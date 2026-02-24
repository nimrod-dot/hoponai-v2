// @ts-check
'use strict';

const APP_URL = 'https://hoponai.com';

// ─── Message Router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording(message.tabId).then(sendResponse);
      return true;

    case 'STEP_CAPTURED':
      handleStepCaptured(message.step, message.tabId).then(sendResponse);
      return true;

    case 'STOP_RECORDING':
      handleStopRecording(message.tabId).then(sendResponse);
      return true;

    case 'UPLOAD_WALKTHROUGH':
      handleUpload(message.payload, message.token).then(sendResponse);
      return true;

    case 'GET_STATE':
      getState().then(sendResponse);
      return true;

    case 'INJECT_TRAINING':
      handleInjectTraining(message.tabId, message.walkthroughId, message.title).then(sendResponse);
      return true;

    case 'REMOVE_TRAINING':
      handleRemoveTraining(message.tabId).then(sendResponse);
      return true;

    // Content scripts can't call hoponai.com directly (CORS). Route via service worker.
    case 'FETCH_WALKTHROUGH':
      bgFetchWalkthrough(message.walkthroughId).then(sendResponse);
      return true;

    case 'CALL_SARAH_PLAY':
      bgCallSarahPlay(message.messages, message.context, sender.tab?.id).then(sendResponse);
      return true;
  }
});

// ─── Recording ────────────────────────────────────────────────────────────────

async function handleStartRecording(tabId) {
  await chrome.storage.session.set({
    recording: true,
    steps: [],
    start_time: Date.now(),
    tab_id: tabId,
  });

  await chrome.action.setBadgeText({ text: 'REC' });
  await chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });

  // Tell the content script to start listening
  await chrome.tabs.sendMessage(tabId, { type: 'START_LISTENING', startTime: Date.now() });

  return { ok: true };
}

async function handleStepCaptured(step, tabId) {
  // Take a screenshot from the background (content scripts cannot do this)
  let screenshot = null;
  try {
    screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 40,
    });
  } catch {
    // Tab may not be visible — continue without screenshot
  }

  const enrichedStep = { ...step, screenshot };

  const stored = await chrome.storage.session.get(['steps']);
  const steps = stored.steps || [];
  steps.push(enrichedStep);

  await chrome.storage.session.set({ steps });

  // Update badge with step count
  await chrome.action.setBadgeText({ text: String(steps.length) });

  return { ok: true, stepIndex: steps.length - 1 };
}

async function handleStopRecording(tabId) {
  await chrome.storage.session.set({ recording: false });

  // Reset badge and icon
  await chrome.action.setBadgeText({ text: '' });

  // Tell content script to stop listening
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'STOP_LISTENING' });
  } catch {
    // Tab may have closed
  }

  return { ok: true };
}

// ─── Upload ───────────────────────────────────────────────────────────────────

async function handleUpload(payload, token = null) {
  const stored = await chrome.storage.session.get(['steps', 'start_time']);
  const steps = stored.steps || [];
  const startTime = stored.start_time || Date.now();

  const duration = steps.length > 0
    ? steps[steps.length - 1].elapsed_ms
    : Date.now() - startTime;

  const metadata = {
    duration_ms: duration,
    step_count: steps.length,
    screenshot_count: steps.filter((s) => s.screenshot !== null).length,
  };

  const target_url = steps.length > 0 ? steps[0].url : '';

  const body = {
    title: payload.title,
    description: payload.description || '',
    category: payload.category || '',
    target_url,
    steps,
    metadata,
  };

  const uploadHeaders = { 'Content-Type': 'application/json' };
  if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${APP_URL}/dashboard/extension/walkthroughs`, {
      method: 'POST',
      credentials: 'include',
      headers: uploadHeaders,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, reason: err.error || 'upload_failed' };
    }

    const data = await res.json();

    // Clear the recording session
    await chrome.storage.session.remove(['steps', 'start_time', 'recording', 'tab_id']);

    return { ok: true, walkthrough: data.walkthrough };
  } catch {
    return { ok: false, reason: 'network_error' };
  }
}

// ─── Training ─────────────────────────────────────────────────────────────────

async function handleInjectTraining(tabId, walkthroughId, title) {
  if (!tabId) return { ok: false, reason: 'no_tab' };
  try {
    // Auto-inject content script if not already loaded on this tab
    const [{ result: csLoaded }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!window.__hoponai_cs__,
    });

    if (!csLoaded) {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      // Give it a moment to initialize
      await new Promise((r) => setTimeout(r, 150));
    }

    await chrome.tabs.sendMessage(tabId, {
      type: 'INJECT_TRAINING',
      walkthroughId,
      title,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: 'inject_failed', detail: String(err) };
  }
}

async function handleRemoveTraining(tabId) {
  if (!tabId) return { ok: false, reason: 'no_tab' };
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'REMOVE_TRAINING' });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'content_script_unavailable' };
  }
}

// ─── State Helper ─────────────────────────────────────────────────────────────

async function getState() {
  const state = await chrome.storage.session.get([
    'recording', 'steps', 'start_time', 'tab_id',
  ]);
  return {
    recording: state.recording || false,
    stepCount: (state.steps || []).length,
    startTime: state.start_time || null,
    tabId: state.tab_id || null,
  };
}

// ─── CORS Proxy for Content Scripts ──────────────────────────────────────────
// Content scripts on ganttpro.com can't call hoponai.com directly (CORS).
// These handlers run in the service worker which has no such restriction.

async function bgFetchWalkthrough(walkthroughId) {
  const stored = await chrome.storage.local.get('extension_token');
  const token = stored.extension_token || null;
  try {
    const res = await fetch(
      `${APP_URL}/dashboard/extension/walkthroughs?id=${walkthroughId}`,
      { headers: token ? { 'Authorization': `Bearer ${token}` } : {} },
    );
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    const wt = data.walkthrough;
    const steps = Array.isArray(wt?.steps) ? wt.steps : [];
    return {
      ok: true,
      steps,
      title: wt?.title || '',
      metadata: {
        platformSummary: wt?.metadata?.platform_summary ?? null,
        coachingNotes:   wt?.metadata?.coaching_notes   ?? null,
        platformName:    wt?.metadata?.platform_name    ?? null,
      },
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function bgCallSarahPlay(messages, context, tabId) {
  const stored = await chrome.storage.local.get('extension_token');
  const token = stored.extension_token || null;

  // Capture screenshot for observe mode (step verification) and greet mode (page awareness).
  let screenshot = null;
  if (context.mode === 'observe' || context.mode === 'greet') {
    try {
      if (tabId) {
        const tab = await chrome.tabs.get(tabId);
        screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: 'jpeg',
          quality: context.mode === 'greet' ? 40 : 70,
        });
      }
    } catch {
      // Tab may not be visible — Sarah observes without screenshot
    }
  }

  try {
    const res = await fetch(`${APP_URL}/api/sarah/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, context, screenshot }),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    // Forward detectedStep so content.js can advance when Sarah sees progress
    return { ok: true, reply: data.reply, detectedStep: data.detectedStep };
  } catch {
    return { ok: false };
  }
}
