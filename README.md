# Agentic Customer Mining Dashboard

A full-stack, AI-driven customer analytics platform designed to analyze e-commerce data, segment customers, and recommend dynamic marketing strategies. 

## Features

- **Executive Dashboard**: High-level overview of customer lifetime value (CLV), estimated revenue, and segment distribution.
- **Dynamic Customer Segmentation**: Analyzes purchasing behavior to classify users into distinct marketing personas (e.g., Silent Loyalists, Emerging Loyalists, Churn Risk).
- **Agent Policy & Recommendations**: Recommends personalized actions (Discounts, Loyalty Rewards, Win-Back campaigns) for different customer segments.
- **Explainable AI (XAI) Integration**: Features a live Python API that calculates the rationale behind AI decisions, visually breaking down feature importance (like Recency, Frequency, and Sentiment) using interactive charts.
- **AI Message Studio**: Generates personalized marketing communications tailored to specific customer personas.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide React
- **Backend (Node.js)**: Express.js, MongoDB (Mongoose)
- **Model Services (Python)**: FastAPI, Uvicorn, Pydantic
- **Data & AI**: Python Data Science Stack (Pandas, Scikit-Learn)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB

### 1. Start the Node.js Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Python XAI Microservice
```bash
cd model_api
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be running locally at `http://localhost:5173`.
