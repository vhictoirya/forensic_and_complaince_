# Blockchain Forensics & Compliance APP

A high-performance FastAPI backend for analyzing blockchain transactions and wallet behaviors. This system provides deep insights into crypto activities, including risk scoring, pattern detection, and forensic analysis.

## 🚀 Features

- **Transaction Forensics**:
  - Deep event analysis (Token Transfers, Swaps, Approvals)
  - Visualizable Token Flow Graphs (Hop analysis)
  - Multi-factor Risk Scoring (0-100 scale)
  - Sanctions Screening (OFAC, etc.)
  - MEV & Flashbot detection heuristics

- **Address Profiling**:
  - Behavioral Pattern Detection (e.g., Burst activity, Late-night transactions)
  - Counterparty Risk Assessment
  - Entity Labeling (Exchanges, Mixers, Privacy Protocols)
  - Historical Volume & Velocity metrics

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Data Provider**: [Moralis API](https://moralis.io/)
- **Server**: Uvicorn
- **Validation**: Pydantic

## 📋 Prerequisites

- Python 3.8+
- A Moralis API Key (Get one free at [moralis.io](https://admin.moralis.io/register))

## ⚙️ Installation

1. **Clone the repository** (if applicable) or navigate to the `backend` folder.

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install fastapi uvicorn requests python-dotenv
   ```

4. **Configuration**:
   Create a `.env` file in the `backend` directory and add your Moralis API Key:
   ```env
   MORALIS_KEY=your_actual_moralis_api_key_here
   ```

## ▶️ Usage

Start the development server:

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --reload --port 8002
```

The API will start at `http://localhost:8002`.

## 📖 API Documentation

Once running, interactive documentation is available at:

- **Swagger UI**: [http://localhost:8002/docs](http://localhost:8002/docs)
- **ReDoc**: [http://localhost:8002/redoc](http://localhost:8002/redoc)

## 🔍 Key Endpoints

### 1. Analyze Transaction
**GET** `/api/analyze-transaction/{tx_hash}`
- Analyzes a specific transaction hash.
- Returns risk score, token flows, and security flags.

### 2. Analyze Address
**GET** `/api/analyze-address/{address}`
- Profiles a wallet address.
- Returns behavioral patterns, recent history, and association risks.

### 3. Health Check
**GET** `/health`
- Verifies server status and Moralis API connectivity.

## ⚠️ Risk Scoring System

The system assigns a risk score (0-100) based on weighted factors:
- **CRITICAL**: Sanctioned entities, known hacks.
- **HIGH**: Mixer usage, high-value anomalies.
- **MEDIUM**: Complex circular flows, suspicious timing.
- **LOW**: Standard exchange interactions.

## 🛡️ License

This project is for educational and compliance research purposes.
