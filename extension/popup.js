// @ts-check
'use strict';

const APP_URL = 'https://hoponai.com';

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const panelLoading = $('panel-loading');
const panelLogin   = $('panel-login');
const panelChat    = $('panel-chat');
const chatArea     = $('chat-area');
const msgInput     = $('msg-input');
const btnSend      = $('btn-send');
const headerUser   = $('header-user');
const hdrName      = $('hdr-name');
const hdrOrg       = $('hdr-org');
const inpToken     = $('inp-token');
const tokenError   = $('token-error');
const btnConnect   = $('btn-connect');
const btnRetry     = $('btn-retry');

// ─── State ────────────────────────────────────────────────────────────────────
let currentTabId   = null;
let isGanttPro     = false;
let authData       = null;
let chatHistory    = [];
let pollInterval   = null;
let recordingState = { recording: false, stepCount: 0 };
let walkthroughList = []; // cached after listWalkthroughs()

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function getStoredToken() {
  const s = await chrome.storage.local.get('extension_token');
  return s.extension_token || null;
}

async function checkAuth() {
  const token = await getStoredToken();
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  try {
    const res = await fetch(`${APP_URL}/dashboard/extension/auth`, {
      credentials: 'include', headers,
    });
    if (res.status === 401) return { ok: false, reason: 'not_logged_in' };
    if (!res.ok)            return { ok: false, reason: 'server_error' };
    return { ok: true, ...(await res.json()) };
  } catch {
    return { ok: false, reason: 'network_error' };
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  show(panelLoading);
  hide(panelLogin);
  panelChat.style.display = 'none';
  chatHistory = [];
  chatArea.innerHTML = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab?.id || null;
  isGanttPro   = tab?.url?.includes('ganttpro.com') || false;

  const auth = await checkAuth();
  hide(panelLoading);

  if (!auth.ok) {
    show(panelLogin);
    return;
  }

  authData = auth;
  const firstName = (auth.user?.name || 'there').split(' ')[0];
  const orgName   = auth.organization?.name || '';

  hdrName.textContent = firstName;
  hdrOrg.textContent  = orgName;
  headerUser.style.display = '';
  panelChat.style.display  = 'flex';

  // Auto-generate a Bearer token if none stored (auth succeeded via Clerk cookie)
  let token = await getStoredToken();
  if (!token) {
    try {
      const tokenRes = await fetch(`${APP_URL}/api/extension/token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        await chrome.storage.local.set({ extension_token: tokenData.token });
      }
    } catch { /* proceed without token — Sarah shows static fallback */ }
  }

  const state = await bg('GET_STATE');
  recordingState = { recording: state.recording || false, stepCount: state.stepCount || 0 };

  if (recordingState.recording) startPolling();

  await sarahGreet(firstName, orgName);
}

init();

// ─── Sarah API ────────────────────────────────────────────────────────────────
async function askSarah(userMessage) {
  const token = await getStoredToken();
  if (!token) {
    if (userMessage) appendUserBubble(userMessage);
    appendSarahBubble(getFallbackGreeting((authData?.user?.name || 'there').split(' ')[0]), getDefaultActions());
    return;
  }

  if (userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });
    appendUserBubble(userMessage);
  }

  const typingEl = appendTyping();

  const state = await bg('GET_STATE');
  recordingState = { recording: state.recording || false, stepCount: state.stepCount || 0 };

  try {
    const res = await fetch(`${APP_URL}/api/sarah/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: chatHistory,
        context: {
          userName:  (authData?.user?.name || 'there').split(' ')[0],
          orgName:   authData?.organization?.name || '',
          isGanttPro,
          recording:  recordingState.recording,
          stepCount:  recordingState.stepCount,
        },
      }),
    });

    typingEl.remove();

    if (!res.ok) {
      appendSarahBubble("Sorry, I couldn't connect right now. Please try again.");
      return;
    }

    const data = await res.json();
    chatHistory.push({ role: 'assistant', content: data.reply });
    appendSarahBubble(data.reply, data.actions || []);

  } catch {
    typingEl.remove();
    appendSarahBubble("I'm having trouble connecting. Check your internet and try again.");
  }
}

async function sarahGreet(firstName, orgName) {
  const token = await getStoredToken();
  if (!token) {
    appendSarahBubble(getFallbackGreeting(firstName), getDefaultActions());
    return;
  }

  const typingEl = appendTyping();

  const greetMsg = recordingState.recording
    ? `I'm back! I see a recording is in progress with ${recordingState.stepCount} steps captured.`
    : `Greet me. My name is ${firstName}${orgName ? ` from ${orgName}` : ''}.`;

  try {
    const res = await fetch(`${APP_URL}/api/sarah/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: greetMsg }],
        context: {
          userName: firstName,
          orgName,
          isGanttPro,
          recording:  recordingState.recording,
          stepCount:  recordingState.stepCount,
        },
      }),
    });

    typingEl.remove();

    if (res.ok) {
      const data = await res.json();
      chatHistory.push({ role: 'assistant', content: data.reply });
      appendSarahBubble(data.reply, data.actions || []);
    } else {
      appendSarahBubble(getFallbackGreeting(firstName), getDefaultActions());
    }
  } catch {
    typingEl.remove();
    appendSarahBubble(getFallbackGreeting(firstName), getDefaultActions());
  }
}

function getFallbackGreeting(name) {
  if (recordingState.recording) return `Hi ${name}! You're recording — ${recordingState.stepCount} steps so far.`;
  if (recordingState.stepCount > 0) return `Hi ${name}! You have ${recordingState.stepCount} recorded steps. Ready to save?`;
  return isGanttPro
    ? `Hi ${name}! I'm Sarah. You're on GanttPRO — ready to record a walkthrough?`
    : `Hi ${name}! I'm Sarah. Navigate to GanttPRO to start recording a walkthrough.`;
}

function getDefaultActions() {
  if (recordingState.recording) return [{ label: 'Stop Recording', action: 'stop_recording' }];
  if (recordingState.stepCount > 0) return [
    { label: 'Save Walkthrough', action: 'open_save_form' },
    { label: 'Discard', action: 'discard' },
  ];
  if (!isGanttPro) return [{ label: 'Open GanttPRO', action: 'open_ganttpro' }];
  return [
    { label: 'Start Recording', action: 'start_recording' },
    { label: 'How does it work?', action: 'help' },
  ];
}

// ─── Action Handling ──────────────────────────────────────────────────────────
async function handleAction(action) {
  switch (action) {
    case 'start_recording': {
      const res = await bg('START_RECORDING', { tabId: currentTabId });
      if (res?.ok) {
        recordingState = { recording: true, stepCount: 0 };
        startPolling();
        await askSarah('I started the recording.');
      } else {
        await askSarah('I tried to start recording but something went wrong. Can you help?');
      }
      break;
    }
    case 'stop_recording': {
      stopPolling();
      await bg('STOP_RECORDING', { tabId: currentTabId });
      const state = await bg('GET_STATE');
      recordingState = { recording: false, stepCount: state.stepCount || 0 };
      await askSarah(`I stopped recording. I captured ${recordingState.stepCount} step${recordingState.stepCount !== 1 ? 's' : ''}.`);
      break;
    }
    case 'open_save_form': {
      appendInlineSaveForm();
      break;
    }
    case 'discard': {
      await chrome.storage.session.remove(['steps', 'start_time', 'recording', 'tab_id']);
      recordingState = { recording: false, stepCount: 0 };
      await askSarah('I discarded the recording. Let\'s start fresh.');
      break;
    }
    case 'open_ganttpro': {
      chrome.tabs.create({ url: 'https://app.ganttpro.com' });
      break;
    }
    case 'go_to_dashboard': {
      chrome.tabs.create({ url: `${APP_URL}/dashboard/walkthroughs` });
      break;
    }
    case 'help': {
      await askSarah('How does recording a walkthrough work?');
      break;
    }
    case 'list_walkthroughs': {
      await listWalkthroughs();
      break;
    }
    default: {
      if (action.startsWith('train:')) {
        await startTraining(action.slice(6));
      }
      break;
    }
  }
}

// ─── Training Flow ────────────────────────────────────────────────────────────

async function listWalkthroughs() {
  const token = await getStoredToken();
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  appendSarahBubble('Let me check your available walkthroughs…');

  try {
    const res = await fetch(`${APP_URL}/dashboard/extension/walkthroughs`, {
      credentials: 'include',
      headers,
    });

    if (!res.ok) {
      appendSarahBubble("I couldn't load walkthroughs right now. Please try again.");
      return;
    }

    const data = await res.json();
    const list = data.walkthroughs || [];
    walkthroughList = list; // cache for title lookup

    if (list.length === 0) {
      appendSarahBubble('No processed walkthroughs yet. Record one first, then run "Process with AI" from the dashboard!');
      return;
    }

    const actions = list.slice(0, 4).map((w) => ({
      label: w.title || 'Untitled',
      action: `train:${w.id}`,
    }));

    appendSarahBubble(
      `I found ${list.length} walkthrough${list.length !== 1 ? 's' : ''} ready for training. Which one would you like to follow?`,
      actions,
    );
  } catch {
    appendSarahBubble("I had trouble loading walkthroughs. Check your connection and try again.");
  }
}

async function startTraining(walkthroughId) {
  // Look up title from cached list (no need to re-fetch here — content script fetches steps itself)
  const cached = walkthroughList.find((w) => w.id === walkthroughId);
  const title = cached?.title || 'Training';

  appendSarahBubble(`Starting "${title}"…`);

  const result = await bg('INJECT_TRAINING', {
    tabId: currentTabId,
    walkthroughId,
    title,
  });

  if (result?.ok) {
    appendSarahBubble(
      `Training started! A guide is loading on the page. Close this popup and follow along — I'm right there with you!`,
      [{ label: 'View Dashboard', action: 'go_to_dashboard' }],
    );
  } else {
    appendSarahBubble(
      "Couldn't start training. If you just installed/updated the extension, refresh your GanttPRO tab and try again.",
    );
  }
}

// ─── UI: Chat Rendering ───────────────────────────────────────────────────────
function appendSarahBubble(text, actions = []) {
  const msg = document.createElement('div');
  msg.className = 'msg sarah';
  msg.innerHTML = `<div class="avatar">S</div><div class="bubble">${escHtml(text)}</div>`;
  chatArea.appendChild(msg);

  if (actions.length) {
    const chips = document.createElement('div');
    chips.className = 'chips';
    actions.forEach(({ label, action }) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (action === 'discard' ? ' danger' : '');
      btn.textContent = label;
      btn.onclick = () => handleAction(action);
      chips.appendChild(btn);
    });
    chatArea.appendChild(chips);
  }

  scrollBottom();
}

function appendUserBubble(text) {
  const msg = document.createElement('div');
  msg.className = 'msg user';
  msg.innerHTML = `<div class="bubble">${escHtml(text)}</div>`;
  chatArea.appendChild(msg);
  scrollBottom();
}

function appendTyping() {
  const msg = document.createElement('div');
  msg.className = 'msg sarah';
  msg.innerHTML = `<div class="avatar">S</div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  chatArea.appendChild(msg);
  scrollBottom();
  return msg;
}

function appendInlineSaveForm() {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;align-items:flex-end;gap:8px;';
  wrapper.innerHTML = `
    <div class="avatar">S</div>
    <div class="save-form">
      <label>Walkthrough title *</label>
      <input id="sf-title" type="text" placeholder="e.g. Create a new project" />
      <label>Description (optional)</label>
      <textarea id="sf-desc" rows="2" placeholder="What does this walkthrough cover?"></textarea>
      <button class="btn-save" id="sf-save">Save Walkthrough</button>
    </div>
  `;
  chatArea.appendChild(wrapper);
  scrollBottom();

  setTimeout(() => document.getElementById('sf-title')?.focus(), 50);

  document.getElementById('sf-save').addEventListener('click', async () => {
    const titleEl = document.getElementById('sf-title');
    const descEl  = document.getElementById('sf-desc');
    const title = titleEl.value.trim();
    if (!title) { titleEl.style.borderColor = '#EF4444'; return; }
    titleEl.style.borderColor = '';

    const saveBtn = document.getElementById('sf-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const token = await getStoredToken();
    const res = await bg('UPLOAD_WALKTHROUGH', {
      payload: { title, description: descEl.value.trim(), category: '' },
      token,
    });

    wrapper.remove();

    if (res?.ok) {
      chatHistory.push({ role: 'assistant', content: 'Walkthrough saved!' });
      appendSarahBubble(
        'Walkthrough saved! 🎉 Head to your dashboard to process it with AI and share it with your team.',
        [{ label: 'View in Dashboard', action: 'go_to_dashboard' }],
      );
    } else {
      appendSarahBubble(
        `Upload failed: ${res?.reason || 'unknown error'}. Want to try again?`,
        [{ label: 'Save Walkthrough', action: 'open_save_form' }],
      );
    }
  });
}

// ─── Polling ──────────────────────────────────────────────────────────────────
function startPolling() {
  stopPolling();
  pollInterval = setInterval(async () => {
    const state = await bg('GET_STATE');
    if (!state.recording) { stopPolling(); return; }
    recordingState.stepCount = state.stepCount || 0;
  }, 2000);
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

// ─── Send message ─────────────────────────────────────────────────────────────
btnSend.addEventListener('click', sendUserMessage);
msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
});

async function sendUserMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  msgInput.value = '';
  await askSarah(text);
}

// ─── Token connect flow ───────────────────────────────────────────────────────
btnRetry.addEventListener('click', () => init());

btnConnect.addEventListener('click', async () => {
  const token = inpToken.value.trim();
  if (!token) {
    tokenError.textContent = 'Please paste your connection token.';
    tokenError.style.display = '';
    return;
  }
  tokenError.style.display = 'none';
  btnConnect.disabled = true;
  btnConnect.textContent = 'Connecting…';

  await chrome.storage.local.set({ extension_token: token });
  await init();

  if (panelLogin.style.display !== 'none') {
    await chrome.storage.local.remove('extension_token');
    tokenError.textContent = 'Invalid token. Please generate a new one from the dashboard.';
    tokenError.style.display = '';
    btnConnect.disabled = false;
    btnConnect.textContent = 'Connect';
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scrollBottom() { chatArea.scrollTop = chatArea.scrollHeight; }

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function show(el) { if (el) el.style.display = ''; }
function hide(el) { if (el) el.style.display = 'none'; }

function bg(type, extra = {}) {
  return chrome.runtime.sendMessage({ type, ...extra }).catch(() => ({ ok: false, reason: 'bg_error' }));
}
