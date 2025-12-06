# Blockchain Forensics & Compliance Dashboard

A modern, high-performance React application for visualizing blockchain forensic data. This dashboard connects to the forensics backend to provide an intuitive interface for analyzing transaction flows, risk scores, and entity behaviors.

## 🌟 Key Features

### 🔍 Transaction Analysis
- **Visual Token Flow**: Interactive node-link diagrams showing the path of tokens through multiple hops.
- **Deep Event Parsing**: Human-readable breakdown of complex smart contract events (Swaps, Approvals, etc.).
- **Risk Indicators**: Clear visual flags for critical risks (Sanctions, Mixers, Wash Trading).
- **Direct Etherscan Links**: One-click access to verify data on the block explorer.

### 👤 Address Profiling
- **Behavioral Analytics**: Charts and insights into user activity patterns (e.g., "Late Night" trading, Burst activity).
- **Counterparty Risk**: Identification of interactions with high-risk or sanctioned entities.
- **Entity Identification**: Automatic labeling of known exchanges, mixers, and other entities.

## 🛠️ Tech Stack

- **Core**: [React](https://react.dev/) (v19) via [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks (`useState`, `useEffect`)
- **HTTP Client**: Native Fetch API

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- The Backend API running locally on port `8002` (see backend README)

## ⚙️ Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *Note: This project uses `lucide-react`, `tailwindcss`, and `@tailwindcss/postcss`.*

## ▶️ Usage

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5176`).

3. **Connect to Backend**:
   Ensure your backend service is running on `http://localhost:8002`. The frontend is configured to talk to this endpoint by default.

## 🏗️ Project Structure

```
src/
├── components/
│   └── ForensicsDashboard.jsx  # Main dashboard component containing all logic & UI
├── index.css                   # Global styles and Tailwind directives
├── App.jsx                     # Root application wrapper
└── main.jsx                    # Entry point
```

## 🔧 Configuration

The API base URL is currently set to `http://localhost:8002` inside `src/components/ForensicsDashboard.jsx`.
To change this for production or a different environment, modify the `API_BASE` constant in that file:

```javascript
const API_BASE = 'http://your-production-api.com';
```

## 🎨 Design System

The application uses a "Dark Mode" aesthetic optimized for data density and readability:
- **Backgrounds**: Slate-900/950 for deep contrast.
- **Accents**: 
  - 🔴 Red: Critical Risks / Sanctions
  - 🟡 Orange/Yellow: Warnings / Medium Risks
  - 🔵 Blue: Information / Links
  - 🟣 Purple: Entities / Labels
- **Glassmorphism**: Subtle transparencies (`backdrop-blur`) for modern UI depth.

## 🛡️ License

This project is for educational and compliance research purposes.
