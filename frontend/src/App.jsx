import { useState } from 'react'
import { startSession, continueSession } from './api'
import './App.css'

export default function App() {
  // Form inputs
  const [problem, setProblem] = useState('')
  const [attempt, setAttempt] = useState('')

  // Session state - mirrors the MentorState dict the backend returns
  const [session, setSession] = useState(null) // null until first hint comes back
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Used only on the "still stuck?" follow-up step
  const [followUp, setFollowUp] = useState('')

  async function handleStart(e) {
    e.preventDefault()
    if (!problem.trim() || !attempt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await startSession(problem, attempt)
      setSession(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStillStuck() {
    if (!followUp.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await continueSession(session, followUp)
      setSession(result)
      setFollowUp('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setProblem('')
    setAttempt('')
    setSession(null)
    setFollowUp('')
    setError(null)
  }

  return (
    <div className="page">
      <header>
        <h1>DSA Mentor</h1>
        <p className="subtitle">
          Stuck on a problem? Get a diagnosis and a hint — never the full answer.
        </p>
      </header>

      {error && <div className="error-box">{error}</div>}

      {!session ? (
        <form onSubmit={handleStart} className="card">
          <label>
            Problem statement
            <textarea
              rows={4}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Paste the DSA problem here..."
              required
            />
          </label>

          <label>
            What have you tried, or where are you stuck?
            <textarea
              rows={3}
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              placeholder="e.g. I used nested loops but it's too slow / I don't know where to start..."
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Thinking...' : 'Get a hint'}
          </button>
        </form>
      ) : (
        <div className="card results">
          <Section title="Agent's understanding" body={session.problem_understanding} />
          <Section
            title={`Diagnosis: ${session.gap_type}`}
            body={session.gap_explanation}
          />
          <Section title={`Hint #${session.hint_count}`} body={session.hint} highlight />

          <div className="followup">
            <label>
              Still stuck after this hint?
              <textarea
                rows={2}
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="What did you try after the last hint?"
              />
            </label>
            <div className="button-row">
              <button onClick={handleStillStuck} disabled={loading || !followUp.trim()}>
                {loading ? 'Thinking...' : 'Get next hint'}
              </button>
              <button onClick={handleReset} className="secondary">
                Solved it — start a new problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, body, highlight }) {
  return (
    <div className={highlight ? 'section highlight' : 'section'}>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}