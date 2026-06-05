from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import random

app = FastAPI(title="Explainable AI (XAI) API")

class XAIRequest(BaseModel):
    persona: str
    actionType: str

class FeatureContribution(BaseModel):
    feature: str
    value: float

@app.get("/")
def read_root():
    return {"status": "ok", "message": "XAI API is running"}

@app.post("/api/explain", response_model=List[FeatureContribution])
def explain_action(request: XAIRequest):
    # In a real environment, this would run the SHAP/LIME explainer on the .pkl model.
    # Since we are mocking the output for the interview showcase, we return logical values 
    # based on the persona and action.
    
    contributions = []
    persona = request.persona.lower()
    action = request.actionType.lower()
    
    # Base randomized values for realism
    noise = lambda: round(random.uniform(-0.1, 0.1), 2)
    
    if "emerging" in persona or "discount" in action:
        contributions = [
            {"feature": "Recent Activity", "value": 0.45 + noise()},
            {"feature": "Purchase Frequency", "value": -0.20 + noise()},
            {"feature": "Average Spend", "value": 0.15 + noise()},
            {"feature": "Review Sentiment", "value": 0.30 + noise()},
        ]
    elif "risk" in persona or "win-back" in action:
        contributions = [
            {"feature": "Recent Activity", "value": -0.65 + noise()},
            {"feature": "Purchase Frequency", "value": 0.25 + noise()},
            {"feature": "Average Spend", "value": 0.35 + noise()},
            {"feature": "Review Sentiment", "value": -0.40 + noise()},
        ]
    elif "loyal" in persona:
        contributions = [
            {"feature": "Recent Activity", "value": 0.55 + noise()},
            {"feature": "Purchase Frequency", "value": 0.60 + noise()},
            {"feature": "Average Spend", "value": 0.50 + noise()},
            {"feature": "Review Sentiment", "value": 0.45 + noise()},
        ]
    else:
        # Generic fallback
        contributions = [
            {"feature": "Recent Activity", "value": 0.20 + noise()},
            {"feature": "Purchase Frequency", "value": 0.10 + noise()},
            {"feature": "Average Spend", "value": -0.15 + noise()},
            {"feature": "Review Sentiment", "value": 0.25 + noise()},
        ]
        
    # Add intervention cost as a negative weight (cost-aware policy)
    contributions.append({"feature": "Intervention Cost", "value": -0.35 + noise()})
        
    return contributions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
