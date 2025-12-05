# Blockchain Forensics and Compliance App

A full-stack application for monitoring and analyzing blockchain transactions for risk and compliance.

## Prerequisites

- Python 3.8+
- Node.js 16+
- Moralis API Key (in `.env`)

## Quick Start

**Windows:**
Double-click `start_app.bat` to run both backend and frontend.

**Manual Start:**

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8007
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Access

- **Frontend (Dashboard):** [http://localhost:5173](http://localhost:5173)
- **Backend (API Docs):** [http://localhost:8007/docs](http://localhost:8007/docs)

## Features

- **Transaction Analysis:** Analyze ETH transactions for risk flags (Sanctions, Mixers, High Value).
- **Address Analysis:** Check wallet history and counterparty risks.
- **Visual Risk Scoring:** High/Medium/Low risk categorization.
