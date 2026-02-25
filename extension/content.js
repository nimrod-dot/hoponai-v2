// @ts-check
'use strict';

// ─── Guard: prevent double-injection when chrome.scripting re-injects this file
(() => {
  if (window.__hoponai_cs__) return;
  window.__hoponai_cs__ = true;

  // ─── Recording State ────────────────────────────────────────────────────────

  let isListening = false;
  let recordingStartTime = null;
  let stepIndex = 0;

  // ─── Message Listener (from background) ─────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'START_LISTENING') {
      recordingStartTime = message.startTime || Date.now();
      stepIndex = 0;
      startListening();
      sendResponse({ ok: true });
    }

    if (message.type === 'STOP_LISTENING') {
      stopListening();
      sendResponse({ ok: true });
    }

    if (message.type === 'INJECT_TRAINING') {
      // Receives walkthroughId + title; fetches steps itself to avoid large messages
      loadAndInjectTraining(message.walkthroughId, message.title);
      sendResponse({ ok: true });
    }

    if (message.type === 'REMOVE_TRAINING') {
      removeTrainingWidget();
      sendResponse({ ok: true });
    }
  });

  // ─── Recording: Event Capture ──────────────────────────────────────────────

  function startListening() {
    if (isListening) return;
    isListening = true;
    document.addEventListener('click', onClickCapture, { capture: true, passive: true });
    document.addEventListener('change', onChangeCapture, { capture: true, passive: true });
    document.addEventListener('input', onInputCapture, { capture: true, passive: true });
    window.addEventListener('beforeunload', onNavigate);
  }

  function stopListening() {
    if (!isListening) return;
    isListening = false;
    document.removeEventListener('click', onClickCapture, { capture: true });
    document.removeEventListener('change', onChangeCapture, { capture: true });
    document.removeEventListener('input', onInputCapture, { capture: true });
    window.removeEventListener('beforeunload', onNavigate);
  }

  function onClickCapture(e) {
    const el = /** @type {Element} */ (e.target);
    if (el.closest && el.closest('#__hoponai_training__')) return;
    const step = buildStep('click', el, {
      x: /** @type {MouseEvent} */ (e).clientX,
      y: /** @type {MouseEvent} */ (e).clientY,
      value: '',
    });
    sendStep(step);
  }

  let inputTimer = null;
  function onInputCapture(e) {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      const el = /** @type {HTMLInputElement} */ (e.target);
      if (isSensitiveField(el)) return;
      const step = buildStep('input', el, { value: el.value || '' });
      sendStep(step);
    }, 600);
  }

  function onChangeCapture(e) {
    const el = /** @type {HTMLInputElement} */ (e.target);
    if (isSensitiveField(el)) return;
    const step = buildStep('change', el, { value: el.value || '' });
    sendStep(step);
  }

  function onNavigate() {
    const step = buildStep('navigate', document.body, { value: window.location.href });
    sendStep(step);
  }

  function buildStep(type, el, extras = {}) {
    return {
      index: stepIndex++,
      type,
      timestamp: Date.now(),
      elapsed_ms: recordingStartTime ? Date.now() - recordingStartTime : 0,
      url: window.location.href,
      page_title: document.title,
      element: extractElementInfo(el),
      value: extras.value || '',
      x: extras.x || 0,
      y: extras.y || 0,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
      screenshot: null,
    };
  }

  function extractElementInfo(el) {
    if (!el || el === document.body) {
      return { tag: 'body', id: '', classes: [], text: '', aria_label: '', xpath: '/html/body' };
    }
    const tag = el.tagName.toLowerCase();
    const id = el.id || '';
    const classes = Array.from(el.classList);
    const text = (el.textContent || '').trim().slice(0, 200);
    const aria_label = el.getAttribute('aria-label') || '';
    const placeholder = el.getAttribute('placeholder') || '';
    const name = el.getAttribute('name') || '';
    const type_attr = el.getAttribute('type') || '';
    const xpath = getXPath(el);
    return { tag, id, classes, text, aria_label, placeholder, name, type: type_attr, xpath };
  }

  function getXPath(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = node.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) index++;
        sibling = sibling.previousSibling;
      }
      parts.unshift(`${node.nodeName.toLowerCase()}[${index}]`);
      node = node.parentNode;
    }
    return '/' + parts.join('/');
  }

  function isSensitiveField(el) {
    const type = (el.type || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    return (
      ['password', 'hidden'].includes(type) ||
      ['password', 'pwd', 'secret', 'token', 'credit_card', 'ssn'].some(
        (s) => name.includes(s) || id.includes(s),
      )
    );
  }

  function sendStep(step) {
    chrome.runtime.sendMessage({ type: 'STEP_CAPTURED', step, tabId: null }).catch(() => {});
  }

  // ─── Training Widget ────────────────────────────────────────────────────────

  /** @type {HTMLElement|null} */
  let trainingEl = null;

  /** @type {HTMLElement|null} */
  let highlightEl = null;
  /** @type {HTMLElement|null} */
  let calloutEl = null;
  let lastHighlightedStepIndex = -1;
  let onPageClickHandler = null;
  let observeDebounceTimer = null;
  let urlPollInterval = null;
  let proactiveTimer = null;   // fires when user is idle on a step too long — sends a visual hint
  let lastAdvancementTime = 0; // cooldown: prevent re-observe right after step advances
  let highlightTimer = null;  // cancel pending spotlight creation on rapid step changes

  let training = {
    steps: /** @type {any[]} */ ([]),
    title: '',
    stepIndex: 0,
    chatHistory: /** @type {{role:string,content:string}[]} */ ([]),
    isTyping: false,
    minimized: false,
    isObserving: false,
    lastUrl: '',
    userMoved: false,          // true once user manually drags widget — disables auto-position
    platformSummary: null,     // from walkthrough metadata (set during processing)
    coachingNotes: null,
    platformName: null,
    phases: null,              // workflow phases [{name, stepStart, stepEnd, transitionMessage, context}]
    lastUrlSig: '',            // urlSig of last polled URL — ignores query-param noise
    hintGivenForStep: -1,      // step index for which a proactive hint was already sent (one per step)
    walkthroughId: null,       // UUID of the current walkthrough — used for analytics events
  };

  // Entry point: fetch walkthrough data, then show widget
  async function loadAndInjectTraining(walkthroughId, title) {
    removeTrainingWidget();

    // Show a loading widget immediately
    const el = document.createElement('div');
    el.id = '__hoponai_training__';
    applyBaseStyles(el);
    el.innerHTML = `
      <div style="padding:10px 12px;background:#fff;border-bottom:1px solid #E8ECF2;display:flex;align-items:center;gap:8px;">
        <span style="font-family:Georgia,serif;font-size:14px;color:#1A1D26">hopon<span style="color:#0EA5E9">ai</span></span>
      </div>
      <div style="padding:24px 16px;text-align:center;color:#8B92A5;font-size:13px">Loading training…</div>`;
    document.body.appendChild(el);
    trainingEl = el;

    try {
      // Route through background service worker to avoid CORS (content scripts
      // run in the page origin and cannot directly call hoponai.com)
      const result = await chrome.runtime.sendMessage({ type: 'FETCH_WALKTHROUGH', walkthroughId });

      if (!result?.ok) {
        showWidgetError(result?.error || 'Failed to load walkthrough. Please try again.');
        return;
      }

      const steps = result.steps || [];
      const actualTitle = result.title || title;

      if (steps.length === 0) {
        showWidgetError('No steps found. Process the walkthrough with AI first.');
        return;
      }

      training = {
        steps,
        title: actualTitle,
        stepIndex: 0,
        chatHistory: [],
        isTyping: false,
        minimized: false,
        isObserving: false,
        lastUrl: '',
        userMoved: false,
        platformSummary: result.metadata?.platformSummary ?? null,
        coachingNotes:   result.metadata?.coachingNotes   ?? null,
        platformName:    result.metadata?.platformName    ?? null,
        phases:          result.metadata?.phases          ?? null,
        hintGivenForStep: -1,
        walkthroughId,
      };

      // Listen for page clicks — advance instantly when user clicks the target element
      if (onPageClickHandler) {
        document.removeEventListener('click', onPageClickHandler, { capture: true });
      }
      onPageClickHandler = (e) => {
        if (!trainingEl || training.isTyping || training.isObserving) return;
        if (training.stepIndex + 1 >= training.steps.length) return;
        const clicked = /** @type {Element} */ (e.target);
        if (clicked.closest?.('#__hoponai_training__') || clicked.closest?.('#__hoponai_hl__')) return;
        const step = training.steps[training.stepIndex];
        if (step?.element && isTargetElement(clicked, step.element)) {
          // User clicked exactly the right element — advance immediately, no AI needed
          handleNextSilent();
        } else {
          // No exact match — schedule observe so Sarah can check if the action was completed
          scheduleAutoObserve();
        }
      };
      document.addEventListener('click', onPageClickHandler, { capture: true, passive: true });

      renderWidget();
      makeDraggable();
      highlightStep(steps[0]);
      startUrlPolling();
      logEvent('session_start');
      sarahNarrate();

    } catch (err) {
      showWidgetError('Network error. Check your connection and try again.');
    }
  }

  function showWidgetError(msg) {
    if (!trainingEl) return;
    trainingEl.innerHTML = `
      <div style="padding:10px 12px;background:#fff;border-bottom:1px solid #E8ECF2;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:Georgia,serif;font-size:14px;color:#1A1D26">hopon<span style="color:#0EA5E9">ai</span></span>
        <button id="__hp_exit__" style="width:22px;height:22px;border-radius:50%;background:#FEE2E2;color:#DC2626;font-size:14px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">×</button>
      </div>
      <div style="padding:20px 16px;text-align:center;color:#DC2626;font-size:12px;line-height:1.5">${esc(msg)}</div>`;
    const exitBtn = trainingEl.querySelector('#__hp_exit__');
    if (exitBtn) exitBtn.addEventListener('click', removeTrainingWidget);
  }

  function applyBaseStyles(el) {
    el.style.cssText = [
      'position:fixed',
      'right:16px',
      'top:72px',
      'width:480px',
      'background:#fff',
      'border-radius:16px',
      'box-shadow:0 8px 48px rgba(0,0,0,0.22)',
      'z-index:2147483647',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'font-size:13px',
      'color:#1A1D26',
      'display:flex',
      'flex-direction:column',
      'overflow:hidden',
      'max-height:calc(100vh - 90px)',
    ].join(';');
  }

  function removeTrainingWidget() {
    removeHighlight();
    lastHighlightedStepIndex = -1;
    cancelAutoObserve();
    cancelProactiveHint();
    stopUrlPolling();
    if (onPageClickHandler) {
      document.removeEventListener('click', onPageClickHandler, { capture: true });
      onPageClickHandler = null;
    }
    if (trainingEl) {
      trainingEl.remove();
      trainingEl = null;
    }
  }

  function removeHighlight() {
    if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; }
    if (calloutEl) { calloutEl.remove(); calloutEl = null; }
    if (highlightEl) { highlightEl.remove(); highlightEl = null; }
  }

  // Floating callout shown when the target element can't be found on the current page.
  // Shows the instruction + a hint to check the screenshot in the widget.
  function showFloatingCallout(instruction) {
    ensureHlStyles();
    const ct = document.createElement('div');
    ct.id = '__hoponai_callout__';
    ct.style.cssText = [
      'position:fixed',
      'top:16px',
      'left:50%',
      'transform:translateX(-50%)',
      'max-width:340px',
      'background:#0F172A',
      'color:#fff',
      'font-size:12px',
      'line-height:1.5',
      'padding:10px 16px',
      'border-radius:12px',
      'pointer-events:none',
      'z-index:2147483647',
      `font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`,
      'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
      'display:flex',
      'flex-direction:column',
      'gap:4px',
      'animation:__hp_callout__ 2.5s ease-in-out infinite',
      'white-space:normal',
    ].join(';');
    ct.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:15px;flex-shrink:0">👆</span>
        <span style="font-weight:600">${esc(instruction)}</span>
      </div>
      <div style="font-size:11px;color:#94A3B8;padding-left:23px">Check the screenshot in the guide panel →</div>`;
    document.body.appendChild(ct);
    calloutEl = ct;
  }

  function ensureHlStyles() {
    if (document.getElementById('__hp_hl_style__')) return;
    const s = document.createElement('style');
    s.id = '__hp_hl_style__';
    s.textContent = [
      '@keyframes __hp_ring__{',
      '0%,100%{box-shadow:0 0 0 4000px rgba(0,0,0,0.38),0 0 0 0 rgba(14,165,233,0.6),0 0 12px 2px rgba(14,165,233,0.4)}',
      '50%{box-shadow:0 0 0 4000px rgba(0,0,0,0.38),0 0 0 6px rgba(14,165,233,0.15),0 0 20px 4px rgba(14,165,233,0.2)}',
      '}',
      '@keyframes __hp_callout__{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-3px)}}',
    ].join('');
    document.head.appendChild(s);
  }

  // Strip HTML tags from AI-generated instructions (they sometimes include <div> etc.)
  function stripHtml(str) {
    return String(str).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Returns true if the clicked element matches the recorded step target.
  // Checks ID, XPath, aria-label, and text content (walking up a few parents).
  function isTargetElement(clickedEl, stepEl) {
    if (!stepEl || !clickedEl) return false;

    // ID match (most reliable)
    if (stepEl.id && clickedEl.id === stepEl.id) return true;

    // XPath match
    if (stepEl.xpath) {
      try {
        const xr = document.evaluate(stepEl.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const xpathNode = xr.singleNodeValue;
        if (xpathNode && (xpathNode === clickedEl || xpathNode.contains(clickedEl))) return true;
      } catch {}
    }

    // Aria-label match
    if (stepEl.aria_label) {
      const target = stepEl.aria_label.trim().toLowerCase();
      if ((clickedEl.getAttribute?.('aria-label') || '').trim().toLowerCase() === target) return true;
    }

    // Text content match — walk up to 3 parents (covers child-icon clicks on a button)
    if (stepEl.text && stepEl.text.trim().length >= 2) {
      const target = stepEl.text.trim().toLowerCase();
      let node = clickedEl;
      for (let i = 0; i < 4 && node; i++) {
        const nodeText = (node.textContent || '').trim().toLowerCase();
        // Only match if the node's own text isn't massively larger than target
        // (avoids matching a big container that happens to contain the target text)
        if (nodeText === target || (nodeText.startsWith(target) && nodeText.length < target.length + 40)) {
          return true;
        }
        node = node.parentElement;
      }
    }

    return false;
  }

  // Advance to next step instantly — called when user clicks exactly the right element.
  function handleNextSilent() {
    if (!trainingEl || training.stepIndex + 1 >= training.steps.length) return;
    cancelAutoObserve();
    doAdvance();
  }

  // Reposition the widget near the found element (unless user manually moved it).
  // Tries right side first, then left, falls back to keeping current position.
  function repositionNearElement(rect) {
    if (!trainingEl || training.userMoved) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const widgetRect = trainingEl.getBoundingClientRect();
    const ww = widgetRect.width || 480;
    const wh = widgetRect.height || 520;
    const gap = 24;

    let left;
    if (rect.right + gap + ww <= vw) {
      left = rect.right + gap;                     // right of element
    } else if (rect.left - gap - ww >= 0) {
      left = rect.left - gap - ww;                 // left of element
    } else {
      left = vw - ww - 16;                         // right edge of viewport
    }

    // Vertically center on element, clamped to viewport
    let top = rect.top + rect.height / 2 - wh / 2;
    top = Math.max(16, Math.min(top, vh - wh - 16));

    trainingEl.style.left = `${Math.round(left)}px`;
    trainingEl.style.top = `${Math.round(top)}px`;
    trainingEl.style.right = 'auto';
  }

  function highlightStep(step) {
    removeHighlight();
    if (!step?.element) return;

    let el = null;

    // Try by id first (fastest lookup)
    if (step.element.id) {
      el = document.getElementById(step.element.id);
    }

    // Fall back to xpath
    if (!el && step.element.xpath) {
      try {
        const xr = document.evaluate(
          step.element.xpath, document, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null,
        );
        el = /** @type {HTMLElement|null} */ (xr.singleNodeValue);
      } catch {}
    }

    // Fall back to aria-label match (handles dynamic/canvas elements that lack stable IDs)
    if ((!el || el === document.body) && step.element.aria_label) {
      const targetAria = step.element.aria_label.trim().toLowerCase();
      const ariaEls = document.querySelectorAll('[aria-label]');
      for (const ae of ariaEls) {
        if ((ae.getAttribute('aria-label') || '').trim().toLowerCase() === targetAria) {
          el = /** @type {HTMLElement} */ (ae);
          break;
        }
      }
    }

    // Fall back to text-content match on leaf-ish nodes (e.g. Gantt chart bars, menu items)
    if ((!el || el === document.body) && step.element.text) {
      const targetText = step.element.text.trim().toLowerCase();
      if (targetText.length >= 2) {
        const candidates = document.querySelectorAll(
          'button, a, [role="button"], [role="menuitem"], [role="option"], td, th, li, span, div',
        );
        for (const candidate of candidates) {
          if (candidate.closest?.('#__hoponai_training__')) continue;
          // Only match when the node itself (not a large container) carries the text
          const ownText = (candidate.textContent || '').trim().toLowerCase();
          if (
            ownText === targetText ||
            (targetText.length > 4 && candidate.children.length <= 2 && ownText === targetText)
          ) {
            el = /** @type {HTMLElement} */ (candidate);
            break;
          }
        }
      }
    }

    // Element not found — guidance is in the widget step card (screenshot + instruction)
    if (!el || el === document.body || el.closest?.('#__hoponai_training__')) {
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    // Wait for scroll to settle before positioning the fixed overlays.
    // Use highlightTimer so a rapid step change cancels this before it fires.
    highlightTimer = setTimeout(() => {
      highlightTimer = null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      ensureHlStyles();

      // ── Spotlight div ───────────────────────────────────────────────────────
      const pad = 5;
      const hl = document.createElement('div');
      hl.id = '__hoponai_hl__';
      hl.style.cssText = [
        'position:fixed',
        `top:${rect.top - pad}px`,
        `left:${rect.left - pad}px`,
        `width:${rect.width + pad * 2}px`,
        `height:${rect.height + pad * 2}px`,
        'border:2.5px solid #0EA5E9',
        'border-radius:8px',
        'pointer-events:none',
        'z-index:2147483645',
        'animation:__hp_ring__ 2.2s ease-in-out infinite',
      ].join(';');
      document.body.appendChild(hl);
      highlightEl = hl;

      // Reposition widget to sit next to the highlighted element
      repositionNearElement(rect);

      // ── Action callout tooltip ──────────────────────────────────────────────
      const instruction = step.instruction ? stripHtml(step.instruction) : '';
      if (!instruction) return;

      // Position below element, flip above if near bottom of viewport
      const spaceBelow = window.innerHeight - rect.bottom;
      const tooltipTop = spaceBelow > 80
        ? rect.bottom + pad + 8
        : rect.top - pad - 8 - 52;  // approx tooltip height

      // Clamp left so tooltip doesn't overflow viewport
      const tooltipLeft = Math.max(8, Math.min(rect.left, window.innerWidth - 232));

      const ct = document.createElement('div');
      ct.id = '__hoponai_callout__';
      ct.style.cssText = [
        'position:fixed',
        `top:${tooltipTop}px`,
        `left:${tooltipLeft}px`,
        'max-width:220px',
        'background:#0F172A',
        'color:#fff',
        'font-size:12px',
        'line-height:1.5',
        'padding:8px 12px 8px 10px',
        'border-radius:10px',
        'pointer-events:none',
        'z-index:2147483647',
        `font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`,
        'box-shadow:0 4px 16px rgba(0,0,0,0.35)',
        'display:flex',
        'align-items:flex-start',
        'gap:7px',
        'animation:none',  // no float on element-anchored tooltip; spotlight animation is enough
      ].join(';');

      // Arrow indicator + text
      ct.innerHTML = `<span style="font-size:14px;flex-shrink:0;margin-top:1px">👆</span><span>${esc(instruction)}</span>`;
      document.body.appendChild(ct);
      calloutEl = ct;
    }, 350);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }

  function renderWidget() {
    if (!trainingEl) return;

    const { steps, stepIndex, chatHistory, isTyping, minimized } = training;
    const step = steps[stepIndex] || {};
    const total = steps.length;
    const progress = total > 0 ? Math.round(((stepIndex + 1) / total) * 100) : 0;
    const isLast = stepIndex + 1 >= total;

    const chatBubbles = chatHistory.map((m) => {
      if (m.role === 'assistant') {
        return `<div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:8px">
          <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#0EA5E9,#6366F1);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">S</div>
          <div style="background:#F8FAFC;border:1px solid #E8ECF2;border-radius:12px 12px 12px 3px;padding:8px 10px;font-size:12px;line-height:1.55;max-width:260px;color:#1A1D26">${esc(m.content)}</div>
        </div>`;
      }
      return `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <div style="background:#0EA5E9;color:#fff;border-radius:12px 12px 3px 12px;padding:8px 10px;font-size:12px;line-height:1.55;max-width:250px">${esc(m.content)}</div>
      </div>`;
    }).join('');

    const typingEl = isTyping ? `<div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:8px">
      <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#0EA5E9,#6366F1);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">S</div>
      <div style="background:#F8FAFC;border:1px solid #E8ECF2;border-radius:12px 12px 12px 3px;padding:10px 12px;display:flex;gap:3px">
        <span style="width:5px;height:5px;border-radius:50%;background:#CBD5E1;display:inline-block;animation:__hp_b__ 1.2s infinite"></span>
        <span style="width:5px;height:5px;border-radius:50%;background:#CBD5E1;display:inline-block;animation:__hp_b__ 1.2s infinite;animation-delay:0.2s"></span>
        <span style="width:5px;height:5px;border-radius:50%;background:#CBD5E1;display:inline-block;animation:__hp_b__ 1.2s infinite;animation-delay:0.4s"></span>
      </div>
    </div>` : '';

    trainingEl.innerHTML = `
      <style>@keyframes __hp_b__{0%,80%,100%{transform:scale(1);opacity:.6}40%{transform:scale(1.3);opacity:1}}
      @keyframes __hp_watch__{0%,100%{opacity:0.3}50%{opacity:1}}
      #__hoponai_training__ *{box-sizing:border-box}
      #__hoponai_training__ button{cursor:pointer;border:none;font-family:inherit}
      #__hoponai_training__ input{font-family:inherit}</style>

      <div id="__hp_hdr__" style="padding:10px 12px;background:#fff;border-bottom:1px solid #E8ECF2;display:flex;align-items:center;justify-content:space-between;cursor:grab;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-family:Georgia,serif;font-size:14px;color:#1A1D26">hopon<span style="color:#0EA5E9">ai</span></span>
          <span style="font-size:11px;color:#8B92A5;font-weight:500">${stepIndex + 1}/${total}</span>
          <div id="__hp_watch__" title="Sarah is watching" style="width:7px;height:7px;border-radius:50%;background:#0EA5E9;opacity:0;transition:opacity 0.3s;flex-shrink:0;${training.isObserving ? 'animation:__hp_watch__ 1.5s ease-in-out infinite' : ''}"></div>
        </div>
        <div style="display:flex;gap:4px">
          <button id="__hp_min__" style="width:22px;height:22px;border-radius:50%;background:#E8ECF2;color:#4A5168;font-size:14px;display:flex;align-items:center;justify-content:center">${minimized ? '+' : '−'}</button>
          <button id="__hp_exit__" style="width:22px;height:22px;border-radius:50%;background:#FEE2E2;color:#DC2626;font-size:14px;display:flex;align-items:center;justify-content:center">×</button>
        </div>
      </div>

      <div style="height:2px;background:#E8ECF2;flex-shrink:0">
        <div style="height:100%;background:#0EA5E9;width:${progress}%;transition:width .3s ease"></div>
      </div>

      ${minimized ? '' : `
      <div style="background:#F8FAFC;border-bottom:1px solid #E8ECF2;flex-shrink:0">
        <div style="padding:10px 12px;display:flex;align-items:flex-start;gap:8px">
          <div style="width:22px;height:22px;border-radius:50%;background:#0EA5E9;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${stepIndex + 1}</div>
          <div style="font-size:12px;font-weight:600;color:#1A1D26;line-height:1.55">${esc(stripHtml(step.instruction || 'Follow the step shown'))}</div>
          ${step.isFlexible ? `<div style="margin-top:5px;display:inline-flex;align-items:center;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:2px 7px;font-size:11px;font-weight:600;color:#15803D">Your choice</div>` : ''}
          ${step.flexibilityNote ? `<div style="margin-top:4px;font-size:11px;color:#6B7280;line-height:1.4">${esc(step.flexibilityNote)}</div>` : ''}
        </div>
      </div>

      <div id="__hp_chat__" style="overflow-y:auto;padding:10px;min-height:80px;max-height:220px">
        ${chatBubbles}${typingEl}
      </div>

      <div style="padding:8px;border-top:1px solid #E8ECF2;display:flex;gap:6px;align-items:center;flex-shrink:0">
        <input id="__hp_inp__" type="text" placeholder="Ask Sarah…" style="flex:1;padding:6px 10px;border:1px solid #E8ECF2;border-radius:16px;font-size:12px;outline:none;background:#F8FAFC;color:#1A1D26"/>
        <button id="__hp_snd__" style="width:28px;height:28px;border-radius:50%;background:#0EA5E9;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M2 21L23 12 2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>

      <div style="padding:8px 12px;border-top:1px solid #E8ECF2;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#fff">
        <button id="__hp_prev__" style="padding:6px 14px;border-radius:7px;background:#F1F5F9;color:#4A5168;font-size:12px;font-weight:600;border:none;opacity:${stepIndex === 0 ? '0.4' : '1'}">← Back</button>
        <button id="__hp_next__" style="padding:6px 16px;border-radius:7px;background:#0EA5E9;color:#fff;font-size:12px;font-weight:600;border:none">${isLast ? 'Done ✓' : 'Got it →'}</button>
      </div>
      `}
    `;

    trainingEl.querySelector('#__hp_min__').addEventListener('click', (e) => {
      e.stopPropagation();
      training.minimized = !training.minimized;
      if (training.minimized) {
        removeHighlight();
      } else {
        highlightStep(training.steps[training.stepIndex]);
      }
      renderWidget();
      if (!training.minimized) scrollChat();
    });

    trainingEl.querySelector('#__hp_exit__').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Exit training?')) removeTrainingWidget();
    });

    if (!minimized) {
      {
        trainingEl.querySelector('#__hp_prev__').addEventListener('click', async () => {
          if (training.stepIndex > 0 && !training.isTyping) {
            training.stepIndex--;
            training.pendingSkipConfirm = false;
            highlightStep(training.steps[training.stepIndex]);
            // Ask Sarah how to undo / what to do at the previous step.
            // Include the step URL so she can tell the user which page to navigate to.
            const prevStep = training.steps[training.stepIndex];
            const prevUrl = prevStep?.url || '';
            const urlHint = prevUrl ? ` The step is on this page: ${prevUrl}.` : '';
            const userMsg = `I want to go back and redo the previous step.${urlHint} If it is on a different page, please tell me exactly how to navigate there first.`;
            const updatedHistory = [...training.chatHistory, { role: 'user', content: userMsg }];
            training.chatHistory = updatedHistory;
            training.isTyping = true;
            renderWidget(); scrollChat();
            try {
              const { reply } = await callSarahPlay(updatedHistory, 'chat');
              training.isTyping = false;
              if (!trainingEl) return;
              const prevInstruction = stripHtml(prevStep?.instruction || '');
              const fallback = prevUrl
                ? `Of course! Navigate to ${prevUrl} first, then: ${prevInstruction}`
                : `Of course! Here's what to do: ${prevInstruction}`;
              const msg = reply || fallback;
              training.chatHistory = [...training.chatHistory, { role: 'assistant', content: msg }];
            } catch { training.isTyping = false; }
            renderWidget(); scrollChat();
          }
        });

        trainingEl.querySelector('#__hp_next__').addEventListener('click', () => handleNext());
      }


      trainingEl.querySelector('#__hp_snd__').addEventListener('click', () => sendChatMessage());

      trainingEl.querySelector('#__hp_inp__').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
      });

      scrollChat();
    }
  }

  function scrollChat() {
    if (!trainingEl) return;
    const chat = trainingEl.querySelector('#__hp_chat__');
    if (chat) setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 30);
  }

  // ─── Sarah AI Calls ───────────────────────────────────────────────────────────

  async function callSarahPlay(history, mode = 'chat') {
    const { steps, stepIndex, title } = training;
    // Include element metadata — Sarah uses text/tag/aria as evidence of click completion
    const allSteps = steps.map((s) => ({
      instruction:     s.instruction || '',
      url:             s.url || '',
      elementText:     (s.element?.text || '').slice(0, 60),
      elementTag:      s.element?.tag || '',
      elementAria:     s.element?.aria_label || '',
      isFlexible:      s.isFlexible === true,
      flexibilityNote: s.flexibilityNote ?? null,
      stepCategory:    s.stepCategory || null,
    }));

    let messages;
    if (mode === 'observe') {
      // Focused binary question: "did I complete THIS step?" — not open-ended scan.
      // Sending chat history causes Sarah to anchor on her own previous wrong answers.
      const step = steps[stepIndex] || {};
      const instruction = stripHtml(step.instruction || '');
      const elemText = (step.element?.text || '').slice(0, 60);
      const elemTag = step.element?.tag || '';
      const elemAria = step.element?.aria_label || '';
      const elemInfo = elemText
        ? ` The target element is <${elemTag || 'element'}> with text "${elemText}"${elemAria ? ` (aria: "${elemAria}")` : ''}.`
        : (elemAria ? ` The target element has aria-label "${elemAria}".` : '');
      messages = [{
        role: 'user',
        content: `I'm on step [${stepIndex}]: "${instruction}".${elemInfo} Look at this screenshot — did I complete this step? Has the result of the action appeared on screen?`,
      }];
    } else {
      messages = history;
    }

    // CHAT mode: sending all steps causes gpt-4o-mini to pick the wrong step.
    // The explicit [STEP] prompt already contains the instruction — trim to ±3 steps.
    // OBSERVE and GREET modes need full list for element evidence and journey context.
    const stepsForContext = mode === 'chat'
      ? allSteps.slice(Math.max(0, stepIndex - 2), stepIndex + 4)
      : allSteps;

    const result = await chrome.runtime.sendMessage({
      type: 'CALL_SARAH_PLAY',
      messages,
      context: {
        walkthroughTitle: title,
        stepIndex,
        totalSteps: steps.length,
        allSteps: stepsForContext,
        mode,
        platformSummary: training.platformSummary,
        coachingNotes:   training.coachingNotes,
        phases:          training.phases,
        currentUrl: mode === 'greet' ? window.location.href : undefined,
      },
    });

    return {
      reply: result?.reply ?? null,
      detectedStep: result?.detectedStep ?? stepIndex,
    };
  }

  // Auto-observe: proactively checks the screen after page clicks / URL changes.
  // Silent when no advancement — only updates chat if Sarah detects progress.
  async function autoObserve() {
    if (!trainingEl || training.isTyping || training.isObserving) return;
    if (training.minimized) return;
    if (training.stepIndex + 1 >= training.steps.length) return;

    training.isObserving = true;
    setObservingIndicator(true);

    try {
      const { reply, detectedStep } = await callSarahPlay(training.chatHistory, 'observe');
      if (!trainingEl) return;
      training.isObserving = false;
      setObservingIndicator(false);

      if (detectedStep > training.stepIndex) {
        lastAdvancementTime = Date.now(); // cooldown starts now
        training.stepIndex = detectedStep;
        highlightStep(training.steps[training.stepIndex]);
        if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
        renderWidget();
        scrollChat();
        scheduleProactiveHint(); // start idle timer for the new step
      }
      // No advancement → silent, don't re-render, don't touch chat
    } catch {
      training.isObserving = false;
      setObservingIndicator(false);
    }
  }

  function scheduleAutoObserve() {
    // Suppress auto-observe for 5s after any advance (or recent "Got it") to prevent noise
    if (Date.now() - lastAdvancementTime < 5000) return;
    clearTimeout(observeDebounceTimer);
    observeDebounceTimer = setTimeout(autoObserve, 2000);
  }

  function cancelAutoObserve() {
    clearTimeout(observeDebounceTimer);
    observeDebounceTimer = null;
  }

  // Proactive hint: if user is idle on a step for 25s, Sarah offers a visual hint.
  // One hint per step max — resets when step advances.
  function scheduleProactiveHint() {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
    if (!trainingEl || training.minimized) return;
    if (training.stepIndex + 1 >= training.steps.length) return; // last step — no hint needed
    if (training.hintGivenForStep === training.stepIndex) return; // already hinted this step

    proactiveTimer = setTimeout(async () => {
      proactiveTimer = null;
      if (!trainingEl || training.isTyping || training.isObserving || training.minimized) return;
      if (training.hintGivenForStep === training.stepIndex) return;

      const step = training.steps[training.stepIndex];
      const instrHint = stripHtml(step?.instruction || '');
      if (!instrHint) return;

      training.hintGivenForStep = training.stepIndex;
      logEvent('hint_shown', training.stepIndex);
      training.isTyping = true;
      renderWidget(); scrollChat();

      const hintPrompt = `[HINT: user has been on step ${training.stepIndex + 1} for 25 seconds. Step: "${instrHint}". Give a visual hint — WHERE on screen to look, what the element looks like (color, position, label), or a common pitfall. 1-2 sentences, warm. Do NOT repeat the instruction verbatim.]`;
      const recentHistory = training.chatHistory.slice(-4);
      const historyWithHint = [...recentHistory, { role: 'user', content: hintPrompt }];

      try {
        const { reply } = await callSarahPlay(historyWithHint, 'chat');
        training.isTyping = false;
        if (!trainingEl) return;
        if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
      } catch {
        training.isTyping = false;
      }
      renderWidget(); scrollChat();
    }, 25000);
  }

  function cancelProactiveHint() {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }

  // Fire-and-forget analytics event — never blocks or delays the training flow.
  function logEvent(eventType, stepIndex = null) {
    if (!training.walkthroughId) return;
    chrome.runtime.sendMessage({
      type: 'LOG_TRAINING_EVENT',
      walkthroughId: training.walkthroughId,
      eventType,
      stepIndex,
    }).catch(() => {});
  }

  // Get a comparable signature from a URL: pathname + hash (covers SPA hash routing)
  function urlSig(url) {
    try { const u = new URL(url); return (u.pathname + u.hash).toLowerCase(); }
    catch { return url.toLowerCase(); }
  }

  // Find the first future step whose recorded URL matches the current URL.
  // Used for instant no-AI advancement when the user navigates to a new page.
  function matchStepByUrl(currentUrl) {
    const sig = urlSig(currentUrl);
    for (let i = training.stepIndex + 1; i < training.steps.length; i++) {
      const stepUrl = training.steps[i].url || '';
      if (stepUrl && urlSig(stepUrl) === sig) return i;
    }
    return -1;
  }

  // Advance to a specific step index via URL match — jump ahead if multiple steps matched.
  function advanceToStep(targetStep) {
    if (!trainingEl) return;
    if (targetStep <= training.stepIndex || targetStep >= training.steps.length) return;
    if (Date.now() - lastAdvancementTime < 1500) return; // prevent rapid-fire duplicates
    if (training.isTyping || training.isObserving) return; // don't interrupt while Sarah is busy
    training.pendingSkipConfirm = false;
    training.stepIndex = targetStep - 1; // doAdvance will increment by 1
    doAdvance();
  }

  function startUrlPolling() {
    training.lastUrl = window.location.href;
    training.lastUrlSig = urlSig(window.location.href);
    urlPollInterval = setInterval(() => {
      if (!trainingEl) { clearInterval(urlPollInterval); return; }
      const current = window.location.href;
      const currentSig = urlSig(current);
      // Compare path+hash only — ignore query-param changes (SPAs add/change params frequently)
      if (currentSig !== training.lastUrlSig) {
        training.lastUrl = current;
        training.lastUrlSig = currentSig;
        cancelAutoObserve();
        // First try URL-based step matching — instant, no AI needed
        const matched = matchStepByUrl(current);
        if (matched > training.stepIndex) {
          setTimeout(() => advanceToStep(matched), 300); // brief render-settle delay
        } else {
          setTimeout(autoObserve, 800); // URL changed but no direct match — let Sarah observe
        }
      }
    }, 1000);
  }

  function stopUrlPolling() {
    clearInterval(urlPollInterval);
    urlPollInterval = null;
  }

  function setObservingIndicator(visible) {
    const dot = trainingEl?.querySelector('#__hp_watch__');
    if (dot) dot.style.opacity = visible ? '1' : '0';
  }

  // Greeting: called once when widget loads. Uses 'greet' mode — no screenshot.
  async function sarahNarrate() {
    if (!trainingEl) return;
    const userMsg = `I'm ready to follow "${training.title}". Tell me what to do first!`;
    const updatedHistory = [{ role: 'user', content: userMsg }];
    training.chatHistory = updatedHistory;
    training.isTyping = true;
    renderWidget();
    scrollChat();
    try {
      const { reply } = await callSarahPlay(updatedHistory, 'greet');
      training.isTyping = false;
      if (!trainingEl) return;
      if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
    } catch {
      training.isTyping = false;
    }
    renderWidget();
    scrollChat();
    scheduleProactiveHint(); // start 25s idle timer after greet — covers the very first step
  }

  async function sendChatMessage() {
    if (!trainingEl || training.isTyping) return;
    const input = /** @type {HTMLInputElement} */ (trainingEl.querySelector('#__hp_inp__'));
    const text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';
    cancelProactiveHint(); // user is actively engaged — no need for idle hint
    logEvent('question_asked', training.stepIndex);

    const updatedHistory = [...training.chatHistory, { role: 'user', content: text }];
    training.chatHistory = updatedHistory;
    training.isTyping = true;
    renderWidget();
    scrollChat();

    try {
      const { reply } = await callSarahPlay(updatedHistory, 'chat');
      training.isTyping = false;
      if (!trainingEl) return;
      if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
    } catch {
      training.isTyping = false;
    }

    renderWidget();
    scrollChat();
  }

  // Advance one step — shared by URL detection, "Got it", and skip paths.
  // Always calls Sarah for a narrative response (using phase + step context),
  // so she explains WHY the next step matters, not just WHAT to click.
  function doAdvance() {
    if (!trainingEl) return;
    if (training.isTyping) return; // prevent concurrent calls while Sarah is responding
    cancelProactiveHint(); // clear any pending idle hint for the step we're leaving
    const { steps, phases } = training;
    if (training.stepIndex + 1 >= steps.length) return;

    const prevInstruction = stripHtml(steps[training.stepIndex]?.instruction || '');
    const prevPhaseIndex  = steps[training.stepIndex]?.phaseIndex ?? -1;
    training.stepIndex++;
    training.pendingSkipConfirm = false;
    lastAdvancementTime = Date.now();

    // Auto-skip consecutive steps with the same instruction (e.g. click→input→change on same field
    // all get the same AI instruction — no need to narrate "Enter project name" three times).
    while (
      training.stepIndex + 1 < steps.length &&
      prevInstruction &&
      stripHtml(steps[training.stepIndex]?.instruction || '') === prevInstruction
    ) {
      training.stepIndex++;
      lastAdvancementTime = Date.now();
    }

    highlightStep(steps[training.stepIndex]);
    logEvent('step_advance', training.stepIndex);

    const newPhaseIndex  = steps[training.stepIndex]?.phaseIndex ?? -1;
    const isPhaseTransition = newPhaseIndex > prevPhaseIndex && newPhaseIndex >= 0;

    // Phase transition: show the pre-generated transition message, then let Sarah add the first step
    if (isPhaseTransition && phases && phases[newPhaseIndex]?.transitionMessage) {
      const msg = phases[newPhaseIndex].transitionMessage;
      training.chatHistory = [...training.chatHistory, { role: 'assistant', content: msg }];
      renderWidget(); scrollChat();
      // Don't return — fall through to also get Sarah to narrate the first step of the new phase
    }

    // Ask Sarah to narrate the current step with context — never just repeat the instruction
    training.isTyping = true;
    renderWidget(); scrollChat();

    const instrHint  = stripHtml(steps[training.stepIndex]?.instruction || '');
    const phaseHint  = steps[training.stepIndex]?.phaseName ? ` Phase: "${steps[training.stepIndex].phaseName}".` : '';
    const prompt = instrHint
      ? `[STEP ${training.stepIndex + 1}/${steps.length}.${phaseHint} Tell the user what to do: "${instrHint}". ONE sentence — action-first ("Now…" / "Next…" / "Go ahead and…"), then why it matters. NEVER start with "Great", "Well done", or any praise.]`
      : `[STEP ${training.stepIndex + 1}/${steps.length}.${phaseHint} Tell the user what to do next — one specific, action-first sentence. NEVER start with praise.]`;

    // Trim to last 4 messages so stale greet context can't confuse Sarah
    const recentHistory = training.chatHistory.slice(-4);
    const historyWithPrompt = [...recentHistory, { role: 'user', content: prompt }];
    callSarahPlay(historyWithPrompt, 'chat').then(({ reply }) => {
      training.isTyping = false;
      if (!trainingEl) return;
      if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
      renderWidget(); scrollChat();
      scheduleProactiveHint(); // start 25s idle timer for the new step
    }).catch(() => { training.isTyping = false; renderWidget(); });
  }

  // "Got it →": trust the user and advance immediately.
  // Auto-observe (URL polling) handles smart detection; "Got it" is the manual override.
  function handleNext() {
    if (!trainingEl || training.isTyping) return;
    const { steps, stepIndex } = training;
    const isLast = stepIndex + 1 >= steps.length;

    if (isLast) {
      logEvent('session_complete');
      const msg = "🎉 You've completed all the steps! Great work!";
      training.chatHistory = [...training.chatHistory, { role: 'assistant', content: msg }];
      renderWidget(); scrollChat();
      return;
    }

    cancelAutoObserve();
    doAdvance();
  }

  // ─── Draggable ──────────────────────────────────────────────────────────────

  function makeDraggable() {
    if (!trainingEl) return;
    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    trainingEl.addEventListener('mousedown', (e) => {
      const tgt = /** @type {Element} */ (e.target);
      if (!tgt.closest('#__hp_hdr__') || tgt.closest('button')) return;
      dragging = true;
      training.userMoved = true; // disable auto-reposition once user takes control
      const rect = trainingEl.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startLeft = rect.left; startTop = rect.top;
      trainingEl.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging || !trainingEl) return;
      trainingEl.style.left = `${startLeft + (e.clientX - startX)}px`;
      trainingEl.style.top = `${startTop + (e.clientY - startY)}px`;
      trainingEl.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (dragging && trainingEl) trainingEl.style.cursor = '';
      dragging = false;
    });
  }

})(); // end guard IIFE
