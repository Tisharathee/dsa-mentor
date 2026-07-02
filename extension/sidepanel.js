const API_BASE = 'http://localhost:8000';
let currentSessionState = null;

const GAP_LABELS = {
  wrong_approach: 'Wrong Approach',
  missed_edge_case: 'Missed Edge Case',
  complexity_issue: 'Complexity Issue',
  syntax_or_implementation: 'Syntax / Implementation Error',
  no_attempt_yet: 'No Attempt Yet',
};

function formatGapType(type) {
  return GAP_LABELS[type] || type;
}

// Helper to show/hide loader
function setLoader(show, text = 'Thinking...') {
  const overlay = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-text');
  overlay.style.display = show ? 'flex' : 'none';
  txt.textContent = text;
}

// Helper to display errors
function showError(msg) {
  const errBox = document.getElementById('error-box');
  if (msg) {
    errBox.textContent = msg;
    errBox.style.display = 'block';
    // Auto-scroll to top to see error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    errBox.style.display = 'none';
  }
}

// 1. Sync from LeetCode Tab
async function syncFromLeetCode() {
  showError(null);
  setLoader(true, 'Scraping problem content...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active browser tab found. Make sure you are on LeetCode.');
    }

    if (!tab.url || (!tab.url.includes('leetcode.com/problems') && !tab.url.includes('leetcode.com/fast-problems'))) {
      throw new Error('Please navigate to a LeetCode problem page (e.g., leetcode.com/problems/*)');
    }

    // Ensure content script is injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      console.log('Script injection skipped or already loaded:', e);
    }

    // Send request to scrape
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_LEETCODE' });
    
    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to communicate with LeetCode. Refresh the page and try again.');
    }

    if (!response.description.trim()) {
      throw new Error('Could not find problem description. Make sure the description is visible on screen.');
    }

    document.getElementById('problem-statement').value = response.description;
    document.getElementById('user-attempt').value = response.code || '';
    
  } catch (err) {
    showError(err.message);
  } finally {
    setLoader(false);
  }
}

// 2. Render MentorState Results
function renderResults(state) {
  currentSessionState = state;
  
  document.getElementById('res-understanding').textContent = state.problem_understanding || '';
  
  // Format diagnosis badge
  const badge = document.getElementById('res-badge');
  badge.textContent = formatGapType(state.gap_type);
  badge.className = 'badge'; // Reset classes
  badge.classList.add(`badge-${state.gap_type}`);

  document.getElementById('res-explanation').textContent = state.gap_explanation || '';

  // Render progressive hint
  document.getElementById('res-hint-title').textContent = `Hint #${state.hint_count}`;
  document.getElementById('res-hint-body').textContent = state.hint || '';

  // Toggle screens
  document.getElementById('setup-view').style.display = 'none';
  document.getElementById('results-view').style.display = 'flex';
  
  // Reset follow-up input field
  document.getElementById('follow-up-input').value = '';
}

// 3. Start Mentor Session
async function startSession() {
  showError(null);
  const problem = document.getElementById('problem-statement').value.trim();
  const attempt = document.getElementById('user-attempt').value.trim();

  if (!problem || !attempt) {
    showError('Please provide both the problem statement and your current code attempt.');
    return;
  }

  setLoader(true, 'Analyzing problem & diagnosing attempt...');

  try {
    const res = await fetch(`${API_BASE}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_statement: problem,
        user_attempt: attempt
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    renderResults(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoader(false);
  }
}

// 4. Continue/Follow-up Hint
async function continueSession() {
  showError(null);
  const followUp = document.getElementById('follow-up-input').value.trim();

  if (!followUp) return;
  if (!currentSessionState) {
    showError('No active mentoring session. Please restart.');
    return;
  }

  setLoader(true, 'Processing follow-up attempt...');

  try {
    const res = await fetch(`${API_BASE}/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: currentSessionState,
        user_attempt: followUp
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    renderResults(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoader(false);
  }
}

// 5. Reset to Setup View
function resetSession() {
  currentSessionState = null;
  document.getElementById('follow-up-input').value = '';
  document.getElementById('results-view').style.display = 'none';
  document.getElementById('setup-view').style.display = 'block';
  showError(null);
}

// Attach event listeners
document.getElementById('sync-btn').addEventListener('click', syncFromLeetCode);
document.getElementById('start-btn').addEventListener('click', startSession);
document.getElementById('continue-btn').addEventListener('click', continueSession);
document.getElementById('reset-btn').addEventListener('click', resetSession);
