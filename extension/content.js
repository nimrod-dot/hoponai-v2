// @ts-check
'use strict';

const APP_URL = 'https://hoponai.com';

// ─── Recording State ──────────────────────────────────────────────────────────

let isListening = false;
let recordingStartTime = null;
let stepIndex = 0;

// ─── Message Listener (from background) ──────────────────────────────────────

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
    injectTrainingWidget(message.steps, message.title);
    sendResponse({ ok: true });
  }

  if (message.type === 'REMOVE_TRAINING') {
    removeTrainingWidget();
    sendResponse({ ok: true });
  }
});

// ─── Recording: Event Capture ─────────────────────────────────────────────────

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
  if (el.closest && el.closest('#__hoponai_training__')) return; // ignore clicks on the widget
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

// ─── Training Widget ──────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let trainingEl = null;

let training = {
  steps: /** @type {any[]} */ ([]),
  title: '',
  stepIndex: 0,
  chatHistory: /** @type {{role:string,content:string}[]} */ ([]),
  isTyping: false,
  minimized: false,
};

function injectTrainingWidget(steps, title) {
  removeTrainingWidget();

  training = {
    steps,
    title,
    stepIndex: 0,
    chatHistory: [],
    isTyping: false,
    minimized: false,
  };

  const el = document.createElement('div');
  el.id = '__hoponai_training__';
  el.style.cssText = [
    'position:fixed',
    'right:16px',
    'top:72px',
    'width:300px',
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

  document.body.appendChild(el);
  trainingEl = el;

  renderWidget();
  makeDraggable();
  sarahNarrate(true);
}

function removeTrainingWidget() {
  if (trainingEl) {
    trainingEl.remove();
    trainingEl = null;
  }
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
    #__hoponai_training__ *{box-sizing:border-box}
    #__hoponai_training__ button{cursor:pointer;border:none;font-family:inherit}
    #__hoponai_training__ input{font-family:inherit}</style>

    <!-- Header / drag handle -->
    <div id="__hp_hdr__" style="padding:10px 12px;background:#fff;border-bottom:1px solid #E8ECF2;display:flex;align-items:center;justify-content:space-between;cursor:grab;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-family:Georgia,serif;font-size:14px;color:#1A1D26">hopon<span style="color:#0EA5E9">ai</span></span>
        <span style="font-size:11px;color:#8B92A5;font-weight:500">${stepIndex + 1}/${total}</span>
      </div>
      <div style="display:flex;gap:4px">
        <button id="__hp_min__" style="width:22px;height:22px;border-radius:50%;background:#E8ECF2;color:#4A5168;font-size:14px;display:flex;align-items:center;justify-content:center">${minimized ? '+' : '−'}</button>
        <button id="__hp_exit__" style="width:22px;height:22px;border-radius:50%;background:#FEE2E2;color:#DC2626;font-size:14px;display:flex;align-items:center;justify-content:center">×</button>
      </div>
    </div>

    <!-- Progress bar -->
    <div style="height:2px;background:#E8ECF2;flex-shrink:0">
      <div style="height:100%;background:#0EA5E9;width:${progress}%;transition:width .3s ease"></div>
    </div>

    ${minimized ? '' : `
    <!-- Step info -->
    <div style="padding:12px;background:#F8FAFC;border-bottom:1px solid #E8ECF2;flex-shrink:0">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <div style="width:26px;height:26px;border-radius:50%;background:#0EA5E9;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${stepIndex + 1}</div>
        <div style="font-size:12px;font-weight:600;color:#1A1D26;line-height:1.5">${esc(step.instruction || 'Follow the step shown')}</div>
      </div>
      ${step.screenshot ? `<div style="margin-top:10px;border-radius:7px;overflow:hidden;border:1px solid #E8ECF2"><img src="${step.screenshot}" alt="Step ${stepIndex + 1}" style="width:100%;display:block"/></div>` : ''}
    </div>

    <!-- Chat -->
    <div id="__hp_chat__" style="overflow-y:auto;padding:10px;min-height:60px;max-height:180px">
      ${chatBubbles}${typingEl}
    </div>

    <!-- Chat input -->
    <div style="padding:8px;border-top:1px solid #E8ECF2;display:flex;gap:6px;align-items:center;flex-shrink:0">
      <input id="__hp_inp__" type="text" placeholder="Ask Sarah…" style="flex:1;padding:6px 10px;border:1px solid #E8ECF2;border-radius:16px;font-size:12px;outline:none;background:#F8FAFC;color:#1A1D26"/>
      <button id="__hp_snd__" style="width:28px;height:28px;border-radius:50%;background:#0EA5E9;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M2 21L23 12 2 3v7l15 2-15 2z"/></svg>
      </button>
    </div>

    <!-- Navigation -->
    <div style="padding:8px 12px;border-top:1px solid #E8ECF2;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#fff">
      <button id="__hp_prev__" style="padding:6px 14px;border-radius:7px;background:#F1F5F9;color:#4A5168;font-size:12px;font-weight:600;opacity:${stepIndex === 0 ? '0.4' : '1'}">← Back</button>
      <button id="__hp_next__" style="padding:6px 16px;border-radius:7px;background:#0EA5E9;color:#fff;font-size:12px;font-weight:600">${isLast ? 'Done ✓' : 'Got it →'}</button>
    </div>
    `}
  `;

  // Bind button events
  trainingEl.querySelector('#__hp_min__').addEventListener('click', (e) => {
    e.stopPropagation();
    training.minimized = !training.minimized;
    renderWidget();
    if (!training.minimized) scrollChat();
  });

  trainingEl.querySelector('#__hp_exit__').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Exit training? Your progress will be lost.')) removeTrainingWidget();
  });

  if (!minimized) {
    trainingEl.querySelector('#__hp_prev__').addEventListener('click', () => {
      if (training.stepIndex > 0 && !training.isTyping) {
        training.stepIndex--;
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

async function getExtToken() {
  const s = await chrome.storage.local.get('extension_token');
  return s.extension_token || null;
}

async function callSarahPlay(history) {
  const { steps, stepIndex, title } = training;
  const step = steps[stepIndex] || {};
  const token = await getExtToken();

  const res = await fetch(`${APP_URL}/api/sarah/play`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      messages: history,
      context: {
        walkthroughTitle: title,
        stepIndex,
        totalSteps: steps.length,
        stepInstruction: step.instruction || '',
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.reply || null;
}

async function sarahNarrate(isGreeting = false) {
  if (!trainingEl) return;

  const userMsg = isGreeting
    ? `I'm ready to follow "${training.title}". Tell me what to do first!`
    : `Got it! What do I do next on step ${training.stepIndex + 1}?`;

  const updatedHistory = [...training.chatHistory, { role: 'user', content: userMsg }];
  training.chatHistory = updatedHistory;
  training.isTyping = true;
  renderWidget();
  scrollChat();

  try {
    const reply = await callSarahPlay(updatedHistory);
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
    const reply = await callSarahPlay(updatedHistory);
    training.isTyping = false;
    if (!trainingEl) return;
    if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
  } catch {
    training.isTyping = false;
  }

  renderWidget();
  scrollChat();
}

async function handleNext() {
  if (!trainingEl || training.isTyping) return;
  const { steps, stepIndex } = training;
  const isLast = stepIndex + 1 >= steps.length;

  const userMsg = isLast ? 'I completed the last step!' : `Done! Moving to step ${stepIndex + 2}.`;
  const updatedHistory = [...training.chatHistory, { role: 'user', content: userMsg }];
  training.chatHistory = updatedHistory;

  if (!isLast) training.stepIndex = stepIndex + 1;
  training.isTyping = true;
  renderWidget();
  scrollChat();

  try {
    const reply = await callSarahPlay(updatedHistory);
    training.isTyping = false;
    if (!trainingEl) return;
    if (reply) training.chatHistory = [...training.chatHistory, { role: 'assistant', content: reply }];
  } catch {
    training.isTyping = false;
  }

  renderWidget();
  scrollChat();
}

// ─── Draggable ────────────────────────────────────────────────────────────────

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
