# 🔍 Blockchain Forensics & Compliance Application

A **comprehensive end-to-end platform** for analyzing blockchain transactions, detecting fraud patterns, and profiling cryptocurrency addresses. This application combines a **powerful backend API** with an **intuitive React dashboard** to provide forensic-grade insights into blockchain activities.

---

## 📖 Quick Overview

### What Does This Do?

This application helps investigators, compliance officers, and security professionals:

1. **Analyze Transactions** - Break down complex blockchain transactions into understandable components
2. **Assess Risk** - Automatic multi-factor risk scoring (0-100 scale) with clear explanations
3. **Detect Patterns** - Identify suspicious behavioral patterns, burst activity, and anomalies
4. **Screen Sanctions** - Check addresses against OFAC sanctions lists and known mixers
5. **Visualize Networks** - See wallet clustering and address attribution relationships
6. **Profile Wallets** - Comprehensive behavioral analysis including timing, velocity, and counterparties

---

## 🏗️ Project Architecture

```
Blockchain Forensics App/
├── backend/                    # FastAPI server
│   ├── app.py                 # Main application with API endpoints
│   ├── requirements.txt        # Python dependencies
│   └── README.md              # Backend documentation
│
├── frontend/                   # React dashboard
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ForensicsDashboard.jsx    # Main dashboard (3 tabs)
│   │   │   ├── WalletAttributionGraph.jsx # Wallet clustering visualization
│   │   │   └── TransactionFlowVisualization.jsx # Flow diagrams
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json           # JavaScript dependencies
│   ├── vite.config.js         # Build configuration
│   ├── tailwind.config.js     # Styling configuration
│   └── README.md              # Frontend documentation
│
└── README.md                  # This file
```

---

## 🚀 Getting Started (5 Minutes)

### Prerequisites

- **Backend**: Python 3.8+, Moralis API key
- **Frontend**: Node.js 18+
- **Both**: Git

### Quick Setup

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Moralis API key
echo MORALIS_KEY=your_api_key_here > .env

# Start the server
python app.py
```

Backend will run on `http://localhost:8002`

#### 2. Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 3. Access the Dashboard

Open your browser and go to:
```
http://localhost:5173
```

You should now see the Forensics Dashboard with 3 tabs:
- **Transaction Analysis** - Analyze specific transactions
- **Address Profiling** - Profile wallet addresses
- **Address Clustering** - See wallet networks and attribution

---

## 📊 Core Features

### Backend Features (FastAPI)

#### `/api/analyze-transaction/{tx_hash}`
Perform deep forensic analysis on a blockchain transaction.

**Returns:**
- Risk score (0-100) with categorical level (LOW/MEDIUM/HIGH/CRITICAL)
- Event-by-event analysis (Transfers, Swaps, Approvals, etc.)
- Sanctions screening results
- Mixer/Privacy protocol detection
- MEV and flashbot indicators
- Transaction complexity metrics
- Timing analysis flags

**Example:**
```bash
curl http://localhost:8002/api/analyze-transaction/0x1234...
```

#### `/api/analyze-address/{address}`
Comprehensive wallet profiling with behavioral analysis.

**Returns:**
- Address risk score and risk factors
- Recent transaction history (25 most recent)
- Behavioral patterns (burst detection, timing anomalies)
- Entity interaction summary
- High-risk counterparties
- Sanctions check status
- Time pattern analysis

**Example:**
```bash
curl http://localhost:8002/api/analyze-address/0x5678...
```

#### `/health`
Check API status and Moralis connectivity.

### Frontend Features (React Dashboard)

#### 1. **Transaction Analysis Tab** 📈
- Enter a transaction hash
- View detailed breakdown of all events
- See risk scoring with color-coded severity
- Direct links to Etherscan for verification
- Flags for suspicious patterns

#### 2. **Address Profiling Tab** 👤
- Enter a wallet address
- View behavioral patterns and statistics
- See transaction velocity and timing
- Identify high-risk counterparties
- View entity interactions (exchanges, mixers)
- Check sanctions status

#### 3. **Address Clustering Tab** 🔗
- **Wallet Attribution Graph**: Shows John Doe's wallet network
  - 15 wallet clusters with random addresses and balances
  - Color-coded by risk score (Green/Yellow/Orange/Red)
  - Interactive zoom controls
  - Searchable wallet addresses
  
- **Transaction Flow Visualization**: Animated transaction flow diagram
  - Step-by-step transaction routing
  - Animated particle effects
  - Protocol breakdown
  - Fee analysis

---

## 🔐 Risk Scoring System

The application uses a **multi-factor risk scoring algorithm** that considers:

### Critical Risk Factors (High Weight)
- ✗ OFAC Sanctions Match (≤ +70 points)
- ✗ Mixer/Privacy Protocol Use (≤ +40 points)
- ✗ Unlimited Token Approvals (≤ +30 points)

### Medium Risk Factors
- ⚠️ High transaction complexity (≤ +20 points)
- ⚠️ Large value transfers (≤ +15 points)
- ⚠️ Suspicious timing (≤ +10 points)

### Positive Factors (Risk Reduction)
- ✓ Known exchange interaction (-15 points)

### Risk Levels
- **LOW**: 0-29 points (Safe)
- **MEDIUM**: 30-49 points (Monitor)
- **HIGH**: 50-69 points (Investigate)
- **CRITICAL**: 70+ points (Block/Report)

---

## 📡 API Reference

### Transaction Analysis

```http
GET /api/analyze-transaction/{tx_hash}?chain=eth
```

**Response:**
```json
{
  "tx_hash": "0x...",
  "risk_score": 45,
  "risk_level": "MEDIUM",
  "risk_factors": [
    "🔄 Mixer/privacy service interaction",
    "💰 High value: 25.50 ETH"
  ],
  "flags": [...],
  "details": {
    "from_address": "0x...",
    "to_address": "0x...",
    "value": "25.5 ETH",
    ...
  },
  "event_analysis": [
    {
      "event_type": "Transfer",
      "count": 3,
      "risk_flags": []
    }
  ],
  "sanctions_check": false,
  "mixer_interaction": true,
  "exchange_interaction": false,
  ...
}
```

### Address Analysis

```http
GET /api/analyze-address/{address}?chain=eth&limit=25
```

**Response:**
```json
{
  "address": "0x...",
  "address_label": "Binance Hot Wallet",
  "total_transactions": 150,
  "risk_score": 32,
  "risk_level": "MEDIUM",
  "risk_factors": [
    "Multiple mixer interactions"
  ],
  "flags": [
    "🔄 Mixer interactions: 2 transaction(s)"
  ],
  "recent_transactions": [
    {
      "hash": "0x...",
      "from_address": "0x...",
      "to_address": "0x...",
      "value": "10.50 ETH",
      "risk_score": 15,
      "direction": "outgoing",
      "category": "exchange",
      ...
    }
  ],
  "high_risk_counterparties": [],
  "sanctions_check": false,
  "mixer_interaction": true,
  "time_patterns": {
    "tx_per_hour": 0.45,
    "burst_detected": false,
    "suspicious_timing": false
  },
  "behavior_summary": {
    "total_volume_eth": 325.50,
    "avg_tx_value_eth": 2.17,
    "large_tx_count": 5
  },
  ...
}
```

---

## 🔄 Deployment

### Backend (Railway)
The backend is deployed on Railway and automatically redeploys when you push to the main branch.

```bash
# Push changes to GitHub
git add .
git commit -m "Your message"
git push origin main

# Railway will auto-deploy
```

### Frontend (Vercel)
The frontend is deployed on Vercel with automatic deployments on push.

```bash
# Same git workflow
git push origin main

# Vercel will auto-build and deploy
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python web framework
- **Data Provider**: [Moralis API](https://moralis.io/) - Blockchain data aggregator
- **Validation**: Pydantic - Data validation using Python type hints
- **Server**: Uvicorn - ASGI server
- **HTTP**: Requests - HTTP client library

### Frontend
- **Framework**: [React 19](https://react.dev/) - UI library
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast bundler
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Icons**: [Lucide React](https://lucide.dev/) - Icon library
- **Visualization**: HTML5 Canvas - Custom graph rendering
- **State**: React Hooks - Functional component state management

---

## 📚 Component Details

### Backend (`app.py`)
- **Endpoints**: 3 main API routes + health check + docs
- **Models**: 10 Pydantic models for type safety
- **Analysis Functions**: 6 core analysis helpers
- **Data Sources**: Moralis API + Local static lists (sanctions, mixers, exchanges)

### Frontend Components

#### `ForensicsDashboard.jsx` (Main Container)
- 3-tab interface (Transaction, Address, Clustering)
- Tab state management
- Graph view toggle for Address Clustering
- Responsive grid layout

#### `WalletAttributionGraph.jsx` (Visualization)
- Canvas-based graph rendering
- 15 wallet clusters (John Doe owner)
- Random wallet generation
- Risk-based color coding (4 levels)
- Zoom controls
- Search functionality
- Cluster summary cards

#### `TransactionFlowVisualization.jsx` (Flow Diagram)
- Animated transaction flow
- Step-by-step breakdown
- Protocol visualization
- Particle effects
- Fee analysis cards

---

## 🔍 How to Use

### Analyze a Transaction

1. Go to **Transaction Analysis** tab
2. Paste a transaction hash (e.g., from Etherscan)
3. Click **Analyze**
4. Review:
   - Risk score and color-coded level
   - Detailed risk factors
   - Event breakdown (transfers, swaps, etc.)
   - Sanctions/mixer flags

### Profile a Wallet

1. Go to **Address Profiling** tab
2. Enter a wallet address
3. Click **Analyze**
4. View:
   - Overall risk assessment
   - Recent transaction list
   - Behavioral patterns
   - Entity interactions
   - High-risk counterparties

### Explore Wallet Networks

1. Go to **Address Clustering** tab
2. See John Doe's wallet network visualization
3. Use **Transaction Flow** toggle to see transaction routing
4. Zoom in/out to explore details
5. Search for specific wallet addresses

---

## 🚨 Risk Indicators

### Visual Color Coding

| Color | Risk Level | Score |
|-------|-----------|-------|
| 🟢 Green | Low | 0-29 |
| 🟡 Yellow | Medium | 30-49 |
| 🟠 Orange | High | 50-69 |
| 🔴 Red | Critical | 70+ |

### Common Flags

| Icon | Meaning |
|------|---------|
| 🚨 | Critical/OFAC |
| 🔄 | Mixer/Privacy Protocol |
| ⚠️ | Warning/Risky Pattern |
| 💰 | High Value Transfer |
| ⚡ | MEV/Flashbot Risk |
| 🌙 | Suspicious Timing |
| ✅ | Safe/Verified Entity |

---

## 📝 Environment Variables

### Backend (`.env`)
```env
MORALIS_KEY=your_moralis_api_key_here
```

Get your free API key at: https://admin.moralis.io/register

### Frontend (No .env needed)
- Backend URL: `http://localhost:8002` (development)
- Automatically configured for production URLs on Vercel

---

## 🔐 Data Sources

### Static Lists (Hardcoded)
- **Sanctions Addresses**: 5 OFAC-sanctioned addresses
- **Mixer Addresses**: 5 known Tornado Cash addresses
- **Exchange Addresses**: 6 major exchange hot wallets

### Dynamic Data (Moralis API)
- Transaction details
- Event logs (decoded)
- Address history
- Entity labels
- Gas data

---

## 🤝 Contributing

To add features or fix bugs:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📞 Support

### For Backend Issues
- Check `/health` endpoint for API status
- Verify Moralis API key in `.env`
- Check console logs for detailed errors
- See `backend/README.md` for detailed backend docs

### For Frontend Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Run `npm install` again
- Check browser console for errors
- Ensure backend is running on port 8002

### For Deployment Issues
- **Vercel**: Check project dashboard for build logs
- **Railway**: Check deployment status in Railway dashboard
- Verify environment variables are set correctly

---

## 📄 Documentation

- **Backend Details**: See `backend/README.md`
- **Frontend Details**: See `frontend/README.md`
- **API Docs**: http://localhost:8002/docs (when running locally)

---

## 📊 Example Workflow

### Complete Analysis Example

```
1. User enters address: 0x1234...5678
   ↓
2. Backend queries Moralis for last 25 transactions
   ↓
3. For each transaction:
   - Analyze events (transfers, swaps, etc.)
   - Check for sanctions hits
   - Detect mixer interactions
   - Calculate risk score
   ↓
4. Aggregate results:
   - Overall risk score
   - Behavioral patterns
   - High-risk counterparties
   ↓
5. Frontend displays:
   - Risk gauge
   - Transaction list
   - Pattern cards
   - Counterparty warnings
```

---

## 🎯 Key Takeaways

✅ **Complete System**: Transaction analysis + address profiling + network visualization

✅ **Production Ready**: Deployed on Railway (backend) and Vercel (frontend)

✅ **Real Data**: Uses Moralis API for actual blockchain data

✅ **Interactive**: Canvas visualizations with zoom, search, and filters

✅ **Comprehensive**: 15-factor risk analysis with clear explanations

✅ **User Friendly**: Intuitive dashboard with color-coded risk indicators

---

## 📞 Quick Links

- **Live Demo**: Check your deployed Vercel URL
- **Backend API**: http://localhost:8002 (local)
- **API Docs**: http://localhost:8002/docs
- **GitHub**: https://github.com/vhictoirya/forensic_and_complaince_
- **Moralis Docs**: https://moralis.io/docs/

---

**Last Updated**: December 7, 2025

**Version**: 1.0.0

**Status**: Active - Fully Deployed
