# Blockchain Forensics & Compliance APP

A high-performance FastAPI backend for analyzing blockchain transactions and wallet behaviors. This system provides deep insights into crypto activities, including risk scoring, pattern detection, and forensic analysis.

## 🚀 Features

- **Transaction Forensics**:
  - Deep event analysis (Token Transfers, Swaps, Approvals, Withdrawals)
  - Event-level risk flags and pattern detection
  - Multi-factor Risk Scoring (0-100 scale)
  - Sanctions Screening (OFAC sanctions list)
  - High-risk method detection (delegatecall, selfdestruct, etc.)
  - MEV indicators (short deadline detection)

- **Address Profiling**:
  - Behavioral Pattern Detection (Burst activity, Late-night transactions, Timing anomalies)
  - Counterparty Risk Assessment
  - Entity Labeling (Exchanges, Mixers, Privacy Protocols)
  - Historical Volume & Velocity metrics
  - High-risk counterparty identification
  - Sanctions list screening for addresses

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
- Returns:
  - Risk score (0-100) and risk level (LOW/MEDIUM/HIGH/CRITICAL)
  - Event-by-event analysis (Transfers, Swaps, Approvals, etc.)
  - Risk factors and warning flags
  - Transaction details (from/to addresses, value, gas, etc.)
  - Entity labels and counterparty information
  - Sanctions and mixer interaction flags

### 2. Analyze Address
**GET** `/api/analyze-address/{address}`
- Profiles a wallet address with recent transaction history.
- Returns:
  - Overall address risk score
  - Recent transaction list (up to 25 transactions)
  - Behavioral pattern analysis (burst activity, timing anomalies)
  - High-risk counterparties
  - Entity interaction summary
  - Volume and velocity metrics
  - Sanctions check status

### 3. Health Check
**GET** `/health`
- Verifies server status and Moralis API connectivity.
- Returns API version and connection status.

## ⚠️ Risk Scoring System

The system assigns a risk score (0-100) based on weighted factors:

**Critical Risk Factors:**
- Sanctioned entity match: +70 points
- Mixer/privacy protocol interaction: +40 points
- Unlimited token approvals: +30 points

**Medium Risk Factors:**
- High transaction complexity (>50 events): +20 points
- Large value transfers (>10 ETH): +15 points
- Suspicious timing patterns: +10 points

**Risk Level Categories:**
- **LOW** (0-29): Standard transactions, safe interactions
- **MEDIUM** (30-49): Monitor - unusual patterns detected
- **HIGH** (50-69): Investigate - significant risk indicators
- **CRITICAL** (70+): High-risk entities, sanctioned addresses

**Mitigating Factors:**
- Known exchange interaction: -15 points

## 🛡️ License

This project is for educational and compliance research purposes.
