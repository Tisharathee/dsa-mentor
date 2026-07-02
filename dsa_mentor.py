import os
import re
from typing import TypedDict, Literal
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from utils.llm import get_llm
 
load_dotenv()
 
class MentorState(TypedDict):
    problem_statement: str
    user_attempt: str
    problem_understanding: str
    gap_type: str
    gap_explanation: str
    hint: str
    hint_count: int
    still_stuck: bool
 
def understand_problem_node(state: MentorState) -> dict:
    if state.get("problem_understanding"):
        return {"problem_understanding": state["problem_understanding"]}
    llm = get_llm(temperature=0.2)
    prompt = f"""Restate the following DSA problem in your own plain words,
in 2-3 sentences. Focus on: what input, what output, what's actually
being asked. Do NOT solve it or hint at an approach yet.
 
Problem:
{state['problem_statement']}
"""
    response = llm.invoke(prompt)
    return {"problem_understanding": response.content}
 
GAP_TYPES = ["wrong_approach", "missed_edge_case", "complexity_issue", "syntax_or_implementation", "no_attempt_yet"]
 
def diagnose_gap_node(state: MentorState) -> dict:
    llm = get_llm(temperature=0.2)
    prompt = f"""You are diagnosing why a student is stuck on a DSA problem.
 
Problem understanding: {state['problem_understanding']}
 
Student's attempt or description of being stuck:
{state['user_attempt']}
 
Classify the gap into EXACTLY ONE of these categories:
- wrong_approach: their fundamental strategy/algorithm choice won't work for this problem
- missed_edge_case: their approach is right but breaks on specific inputs (empty, duplicates, negative, etc.)
- complexity_issue: their approach works but is too slow / wrong time-space tradeoff for constraints
- syntax_or_implementation: their idea is correct, they just have a bug or syntax error
- no_attempt_yet: they haven't tried anything concrete yet, just said they're stuck
 
Respond in EXACTLY this format, nothing else:
GAP_TYPE: <one of the categories above>
EXPLANATION: <one sentence on why you classified it this way>
"""
    response = llm.invoke(prompt).content
 
    match_type = re.search(r"GAP_TYPE:\s*\*?(\w+)\*?", response, re.IGNORECASE)
    match_exp = re.search(r"EXPLANATION:\s*(.+)", response, re.IGNORECASE)
 
    gap_type = "no_attempt_yet"
    explanation = response
 
    if match_type:
        candidate = match_type.group(1).strip().lower()
        if candidate in GAP_TYPES:
            gap_type = candidate
    if match_exp:
        explanation = match_exp.group(1).strip().replace("**", "").replace("*", "")
 
    return {"gap_type": gap_type, "gap_explanation": explanation}
 
def generate_hint_node(state: MentorState) -> dict:
    llm = get_llm(temperature=0.4)
    hint_count = state.get("hint_count", 0)
 
    if hint_count == 0:
        specificity = "Give a gentle nudge pointing toward the right direction. Do not name the exact technique."
    elif hint_count == 1:
        specificity = "Name the specific technique or data structure they should consider, but do not explain how to apply it yet."
    else:
        specificity = "Explain step by step in plain English how to apply the technique. NEVER write actual code."
 
    prompt = f"""A student is stuck on a DSA problem.
 
Problem:
{state.get('problem_statement', '')}
 
Our Understanding of the Problem:
{state.get('problem_understanding', '')}
 
Student's attempt:
{state.get('user_attempt', '')}
 
Gap diagnosis: {state['gap_type']} - {state['gap_explanation']}
 
This is hint number {hint_count + 1} for this same problem.
Hint policy for this level: {specificity}
 
Write the hint directly to the student, 2-4 sentences, encouraging tone,
never revealing full working code.
"""
    response = llm.invoke(prompt)
    return {"hint": response.content, "hint_count": hint_count + 1, "still_stuck": False}
 
def route_after_hint(state: MentorState) -> Literal["diagnose_gap", "__end__"]:
    if state.get("still_stuck", False):
        return "diagnose_gap"
    return "__end__"
 
def build_graph():
    builder = StateGraph(MentorState)
    builder.add_node("understand_problem", understand_problem_node)
    builder.add_node("diagnose_gap", diagnose_gap_node)
    builder.add_node("generate_hint", generate_hint_node)
    builder.set_entry_point("understand_problem")
    builder.add_edge("understand_problem", "diagnose_gap")
    builder.add_edge("diagnose_gap", "generate_hint")
    builder.add_conditional_edges(
        "generate_hint",
        route_after_hint,
        {"diagnose_gap": "diagnose_gap", "__end__": END},
    )
    return builder.compile()
 
if __name__ == "__main__":
    graph = build_graph()
    print("=== DSA Mentor ===")
    problem = input("\nPaste the problem statement:\n> ")
    attempt = input("\nDescribe your attempt or where you're stuck:\n> ")
    state = {
        "problem_statement": problem,
        "user_attempt": attempt,
        "hint_count": 0,
        "still_stuck": False,
    }
    result = graph.invoke(state)
    print(f"\n[Agent's understanding]\n{result['problem_understanding']}")
    print(f"\n[Diagnosis: {result['gap_type']}]\n{result['gap_explanation']}")
    print(f"\n[Hint #{result['hint_count']}]\n{result['hint']}")
    while True:
        again = input("\nStill stuck? (y/n): ").strip().lower()
        if again != "y":
            print("\nGo implement it yourself now.")
            break
        more_detail = input("What did you try after the last hint?\n> ")
        result["user_attempt"] = more_detail
        result["still_stuck"] = True
        result = graph.invoke(result)
        print(f"\n[Diagnosis: {result['gap_type']}]\n{result['gap_explanation']}")
        print(f"\n[Hint #{result['hint_count']}]\n{result['hint']}")
 