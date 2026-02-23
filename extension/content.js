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
  let lastHighlightedStepIndex = -1;
  let onPageClickHandler = null;
  let observeDebounceTimer = null;
  let urlPollInterval = null;

  let training = {
    steps: /** @type {any[]} */ ([]),
    title: '',
    stepIndex: 0,
    chatHistory: /** @type {{role:string,content:string}[]} */ ([]),
    isTyping: false,
    minimized: false,
    isObserving: false,
    lastUrl: '',
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
      };

      // Listen for page clicks to schedule proactive auto-observation
      if (onPageClickHandler) {
        document.removeEventListener('click', onPageClickHandler, { capture: true });
      }
      onPageClickHandler = (e) => {
        if (!trainingEl || training.isTyping) return;
        if (training.stepIndex + 1 >= training.steps.length) return;
        const el = e.target;
        if (el.closest?.('#__hoponai_training__') || el.closest?.('#__hoponai_hl__')) return;
        scheduleAutoObserve();
      };
      document.addEventListener('click', onPageClickHandler, { capture: true, passive: true });

      renderWidget();
      makeDraggable();
      highlightStep(steps[0]);
      startUrlPolling();
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
      'width:360px',
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
    if (highlightEl) { highlightEl.remove(); highlightEl = null; }
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

    // Skip if not found, is body, or is inside the training widget itself
    if (!el || el === document.body || el.closest?.('#__hoponai_training__')) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    // Wait for scroll to settle before positioning the fixed overlay
    setTimeout(() => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      if (!document.getElementById('__hp_hl_style__')) {
        const s = document.createElement('style');
        s.id = '__hp_hl_style__';
        s.textContent = '@keyframes __hp_ring__{0%,100%{box-shadow:0 0 0 3px rgba(14,165,233,0.35)}50%{box-shadow:0 0 0 9px rgba(14,165,233,0.08)}}';
        document.head.appendChild(s);
      }

      const hl = document.createElement('div');
      hl.id = '__hoponai_hl__';
      hl.style.cssText = [
        'position:fixed',
        `top:${rect.top - 4}px`,
        `left:${rect.left - 4}px`,
        `width:${rect.width + 8}px`,
        `height:${rect.height + 8}px`,
        'border:2px solid #0EA5E9',
        'border-radius:6px',
        'pointer-events:none',
        'z-index:2147483646',
        'animation:__hp_ring__ 1.8s ease-in-out infinite',
      ].join(';');

      document.body.appendChild(hl);
      highlightEl = hl;
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
          <div style="background:#F8FAFC;border:1px solid #E8ECF2;border-radius:12px 12px 12px 3px;padding:8px 10px;font-size:12px;line-height:1.55;max-width:215px;color:#1A1D26">${esc(m.content)}</div>
        </div>`;
      }
      return `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <div style="background:#0EA5E9;color:#fff;border-radius:12px 12px 3px 12px;padding:8px 10px;font-size:12px;line-height:1.55;max-width:205px">${esc(m.content)}</div>
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
      <div style="padding:12px;background:#F8FAFC;border-bottom:1px solid #E8ECF2;flex-shrink:0">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:#0EA5E9;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${stepIndex + 1}</div>
          <div style="font-size:12px;font-weight:600;color:#1A1D26;line-height:1.5">${esc(step.instruction || 'Follow the step shown')}</div>
        </div>
        ${step.screenshot ? `<div style="margin-top:10px;border-radius:7px;overflow:hidden;border:1px solid #E8ECF2"><img src="${step.screenshot}" alt="Step ${stepIndex + 1}" style="width:100%;display:block"/></div>` : ''}
      </div>

      <div id="__hp_chat__" style="overflow-y:auto;padding:10px;min-height:60px;max-height:180px">
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
      trainingEl.querySelector('#__hp_prev__').addEventListener('click', () => {
        if (training.stepIndex > 0 && !training.isTyping) {
          training.stepIndex--;
          highlightStep(training.steps[training.stepIndex]);
          renderWidget();
          scrollChat();
        }
      });

      trainingEl.querySelector('#__hp_next__').addEventListener('click', () => handleNext());

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
    // Send all step instructions + URLs — Sarah uses these to determine position
    const allSteps = steps.map((s) => ({ instruction: s.instruction || '', url: s.url || '' }));

    const result = await chrome.runtime.sendMessage({
      type: 'CALL_SARAH_PLAY',
      messages: history,
      context: {
        walkthroughTitle: title,
        stepIndex,
        totalSteps: steps.length,
        allSteps,
        mode,
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
        training.stepIndex = detectedStep;
        highlightStep(training.steps[training.stepIndex]);
        if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
        renderWidget();
        scrollChat();
      }
      // No advancement → silent, don't re-render, don't touch chat
    } catch {
      training.isObserving = false;
      setObservingIndicator(false);
    }
  }

  function scheduleAutoObserve() {
    clearTimeout(observeDebounceTimer);
    observeDebounceTimer = setTimeout(autoObserve, 1500);
  }

  function cancelAutoObserve() {
    clearTimeout(observeDebounceTimer);
    observeDebounceTimer = null;
  }

  function startUrlPolling() {
    training.lastUrl = window.location.href;
    urlPollInterval = setInterval(() => {
      if (!trainingEl) { clearInterval(urlPollInterval); return; }
      const current = window.location.href;
      if (current !== training.lastUrl) {
        training.lastUrl = current;
        cancelAutoObserve();
        setTimeout(autoObserve, 500);  // small settle delay for SPA render
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
  }

  async function sendChatMessage() {
    if (!trainingEl || training.isTyping) return;
    const input = /** @type {HTMLInputElement} */ (trainingEl.querySelector('#__hp_inp__'));
    const text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';

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

  // "Got it →" fallback: user manually triggers an observe call.
  // Always shows Sarah's reply (unlike auto-observe which is silent on no progress).
  async function handleNext() {
    if (!trainingEl || training.isTyping) return;
    const { steps, stepIndex } = training;
    const isLast = stepIndex + 1 >= steps.length;

    if (isLast) {
      const updatedHistory = [...training.chatHistory, { role: 'user', content: 'I completed the last step!' }];
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
      return;
    }

    cancelAutoObserve();
    training.isTyping = true;
    renderWidget();
    scrollChat();

    try {
      const { reply, detectedStep } = await callSarahPlay(training.chatHistory, 'observe');
      training.isTyping = false;
      if (!trainingEl) return;
      if (detectedStep > training.stepIndex) {
        training.stepIndex = detectedStep;
        highlightStep(training.steps[training.stepIndex]);
      }
      // Always surface a reply — user pressed the button and expects feedback
      const msg = reply || "I can see you're making progress — keep going!";
      training.chatHistory = [...training.chatHistory, { role: 'assistant', content: msg }];
    } catch {
      training.isTyping = false;
    }

    renderWidget();
    scrollChat();
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
