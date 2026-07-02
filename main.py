import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dsa_mentor import build_graph
 
app = FastAPI(title="DSA Mentor API")
 
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
graph = build_graph()
 
class StartRequest(BaseModel):
    problem_statement: str
    user_attempt: str
 
class ContinueRequest(BaseModel):
    state: dict
    user_attempt: str
 
@app.post("/start")
def start(req: StartRequest):
    initial_state = {
        "problem_statement": req.problem_statement,
        "user_attempt": req.user_attempt,
        "hint_count": 0,
        "still_stuck": False,
    }
    try:
        result = graph.invoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result
 
@app.post("/continue")
def continue_session(req: ContinueRequest):
    state = req.state
    state["user_attempt"] = req.user_attempt
    state["still_stuck"] = True
    try:
        result = graph.invoke(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result
 
@app.get("/health")
def health():
    return {"status": "ok"}
 