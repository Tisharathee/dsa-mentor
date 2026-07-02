// All calls to your FastAPI backend live here, in one place.
// Why a separate file instead of fetch() inline in App.jsx?
// Keeps App.jsx focused on UI/state, and means there's exactly ONE
// place to change the backend URL or request shape later.

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function startSession(problemStatement, userAttempt) {
  const res = await fetch(`${API_BASE}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem_statement: problemStatement,
      user_attempt: userAttempt,
    }),
  })
  if (!res.ok) {
    throw new Error(`Backend error (${res.status}): ${await res.text()}`)
  }
  return res.json()
}

export async function continueSession(state, newAttemptDetail) {
  const res = await fetch(`${API_BASE}/continue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: state,
      user_attempt: newAttemptDetail,
    }),
  })
  if (!res.ok) {
    throw new Error(`Backend error (${res.status}): ${await res.text()}`)
  }
  return res.json()
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`)
  return res.ok
}