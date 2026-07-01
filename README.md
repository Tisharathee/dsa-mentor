# DSA Mentor

An AI agent that diagnoses **why** you're stuck on a DSA problem and gives
a graduated hint - never the full solution.

## The problem this solves

Most "AI help" for DSA practice is "paste problem, get full solution" -
which teaches nothing, since you never build the reasoning muscle.
DSA Mentor instead reasons about your specific attempt, classifies what
*kind* of gap you have, and gives the smallest hint that unblocks it -
escalating only if you're still stuck after trying.

## Why this is an agent, not just a chatbot wrapper

A single LLM call that answers a question is not an agent - it's a
function call. This project is agentic because of two things:

1. **Multi-step reasoning pipeline**: understand the problem -> diagnose
   the specific gap type -> generate a hint sized to that gap. Each step
   feeds the next; the agent doesn't jump straight to an answer.
2. **Stateful, escalating behavior**: the agent remembers how many hints
   it has already given on this problem (`hint_count`) and changes its
   own behavior accordingly - hint 1 is a nudge, hint 2 names the
   technique, hint 3+ walks through the approach in words. This is a
   real conditional loop in the graph (`generate_hint -> diagnose_gap`),
   not a fixed script.

## Architecture

```
START
  |
  v
understand_problem   (agent restates the problem in plain words)
  |
  v
diagnose_gap  <-------------------+   (classifies: wrong_approach /
  |                               |    missed_edge_case / complexity_issue /
  v                               |    syntax_or_implementation / no_attempt_yet)
generate_hint                    |
  |                              |
  v                              |
[still stuck?] ---- yes ---------+
  |
  no
  v
 END
```

Built with **LangGraph** as a single stateful graph (not multiple
separate agents) - the complexity here is in the conditional routing and
state management, not in agent-count.

## A real bug I hit and fixed (worth knowing for interviews)

Initially, `still_stuck=True` stayed in state across a single
`.invoke()` call, which meant the conditional edge kept routing back to
`diagnose_gap` inside the SAME call, with no way to exit -
`GraphRecursionError` (hit LangGraph's default recursion limit). Fixed
by resetting `still_stuck` to `False` inside `generate_hint_node` itself,
so one `.invoke()` always produces exactly one hint, and the calling
loop (CLI, or later a UI) is responsible for setting `still_stuck=True`
again on the next call once the user reports they're still blocked. This
keeps the graph safe to drive turn-by-turn from any interface.

## Tech stack

- **LangGraph** - stateful agent graph with conditional edges
- **Gemini 2.5 Flash** (free tier) via a provider-agnostic wrapper
  (`utils/llm.py`) - swappable to Claude with a one-line env change
- Plain Python, no framework bloat - every line is mine and explainable

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# add your free GOOGLE_API_KEY: https://aistudio.google.com/app/apikey
python dsa_mentor.py
```

## What I'd build next (and why I didn't yet)

- A minimal Streamlit UI instead of CLI - skipped for now to spend the
  limited time on getting the agent logic correct and fully understood
  first, since a UI on top of broken/shallow logic is worse than a
  working CLI with solid logic.
- Persisting hint history across problems (not just within one problem)
  - would need a small DB; deliberately out of scope to keep this
  buildable and fully owned in the time available.