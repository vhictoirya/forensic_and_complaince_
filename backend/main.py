# main.py - Blockchain Forensics API with Moralis Integration
# Install: pip install fastapi uvicorn requests python-dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import requests
import os
from dotenv import load_dotenv  

# Load .env file 
load_dotenv()  

app = FastAPI(
    title="Blockchain Forensics and Compliance APP",
    version="2.0.0",
    description="Transaction monitoring and risk analysis"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Moralis configuration
MORALIS_API_KEY = os.getenv("MORALIS_KEY")
MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2"
if not MORALIS_API_KEY or MORALIS_API_KEY == "MORALIS_KEY":
    raise ValueError("❌ MORALIS_KEY not found in .env file. Please add your Moralis API key.")

# Watchlists (expanded for demo)
SANCTIONS_LIST = {
    "0x8576acc5c05d6ce88f4e49bf65bde93d537e45d1": "OFAC Sanctioned - Tornado Cash Relayer",
    "0x722122df12d4e14e13ac3b6895a86e84145b6967": "Known Mixer - Tornado Cash",
    "0xdd4c48c0b24039969fc16d1cdf626eab821d3384": "Suspected Fraud - Exchange Hack",
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": "Sanctioned Entity - North Korea Lazarus",
    "0x098b716b8aaf21512996dc57eb0615e2383e2f96": "High Risk - Mixer Service"
}

MIXER_ADDRESSES = {
    "0x8576acc5c05d6ce88f4e49bf65bde93d537e45d1",
    "0x722122df12d4e14e13ac3b6895a86e84145b6967",
    "0x098b716b8aaf21512996dc57eb0615e2383e2f96",
    "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b",
    "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc"
}

KNOWN_EXCHANGES = {
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": "Binance Hot Wallet",
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance 14",
    "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance 15",
    "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": "Binance 16"
}

# Pydantic models
class AnalyzeTransactionRequest(BaseModel):
    tx_hash: str
    chain: str = "eth"

class AnalyzeAddressRequest(BaseModel):
    address: str
    chain: str = "eth"
    limit: int = 10

class TokenTransfer(BaseModel):
    token_name: str
    token_symbol: str
    from_address: str
    to_address: str
    value: str
    value_formatted: str

class TransactionDetails(BaseModel):
    from_address: str
    to_address: Optional[str]
    value: str
    block_number: int
    block_timestamp: str
    gas_used: str
    gas_price: str
    transaction_fee: str
    decoded_call: Optional[Dict]
    token_transfers: List[TokenTransfer]

class AnalysisResult(BaseModel):
    tx_hash: str
    risk_score: int
    risk_level: str
    flags: List[str]
    details: TransactionDetails
    sanctions_check: bool
    mixer_interaction: bool
    exchange_interaction: bool
    entity_labels: List[str]

class AddressTransaction(BaseModel):
    hash: str
    block_timestamp: str
    from_address: str
    to_address: str
    value: str
    risk_score: int
    flags: List[str]

class AddressAnalysis(BaseModel):
    address: str
    total_transactions: int
    risk_score: int
    risk_level: str
    flags: List[str]
    entity_labels: List[str]
    recent_transactions: List[AddressTransaction]
    high_risk_counterparties: List[str]
    sanctions_check: bool
    mixer_interaction: bool

# Helper functions
def moralis_request(endpoint: str, params: Dict = None) -> Dict:
    """Make request to Moralis API"""
    headers = {
        "X-API-Key": MORALIS_API_KEY,
        "accept": "application/json"
    }
    url = f"{MORALIS_BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Moralis API error: {str(e)}")

def check_entity_labels(address: str) -> List[str]:
    """Check if address has known entity labels"""
    labels = []
    addr_lower = address.lower()
    
    if addr_lower in SANCTIONS_LIST:
        labels.append(f"🚨 {SANCTIONS_LIST[addr_lower]}")
    if addr_lower in MIXER_ADDRESSES:
        labels.append("🔄 Known Mixer Service")
    if addr_lower in KNOWN_EXCHANGES:
        labels.append(f"🏦 {KNOWN_EXCHANGES[addr_lower]}")
    
    return labels

def calculate_risk_score(flags: List[str], entity_labels: List[str]) -> tuple:
    """Calculate risk score and level"""
    score = 0
    
    # Critical flags
    if any("Sanctioned" in flag or "OFAC" in flag for flag in flags):
        score += 60
    
    # High risk flags
    if any("Mixer" in label for label in entity_labels):
        score += 25
    
    if any("mixer" in flag.lower() for flag in flags):
        score += 20
    
    # Medium risk flags
    if any("Large" in flag or "High value" in flag for flag in flags):
        score += 15
    
    if any("velocity" in flag.lower() or "rapid" in flag.lower() for flag in flags):
        score += 15
    
    if any("Smart contract" in flag for flag in flags):
        score += 10
    
    # Low risk indicators (reduce score)
    if any("Exchange" in label for label in entity_labels):
        score = max(0, score - 10)
    
    # Cap at 100
    score = min(100, score)
    
    # Determine level
    if score >= 70:
        level = "HIGH"
    elif score >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"
    
    return score, level

# Transaction Analysis
@app.get("/api/analyze-transaction/{tx_hash}", response_model=AnalysisResult)
async def analyze_transaction(tx_hash: str, chain: str = "eth"):
    """
    Phase 1: Analyze a single transaction for risk factors
    
    Uses Moralis getDecodedTransactionByHash endpoint
    
    - **tx_hash**: Transaction hash (in URL path)
    - **chain**: Blockchain network (default: eth)
    """
    try:
        # Get decoded transaction from Moralis
        # Full endpoint: https://deep-index.moralis.io/api/v2.2/transaction/{transaction_hash}/verbose
        tx_data = moralis_request(
            f"/transaction/{tx_hash}/verbose",
            params={"chain": chain}
        )
        
        # Extract key data
        from_addr = tx_data.get("from_address", "")
        to_addr = tx_data.get("to_address", "")
        value_wei = int(tx_data.get("value", 0))
        value_eth = value_wei / 1e18
        gas_used = int(tx_data.get("receipt_gas_used", 0))
        gas_price = int(tx_data.get("gas_price", 0))
        tx_fee = (gas_used * gas_price) / 1e18
        
        # Initialize analysis
        flags = []
        entity_labels = []
        sanctions_hit = False
        mixer_hit = False
        exchange_hit = False
        
        # Check addresses
        from_labels = check_entity_labels(from_addr)
        to_labels = check_entity_labels(to_addr)
        entity_labels = from_labels + to_labels
        
        if any("Sanctioned" in label or "OFAC" in label for label in entity_labels):
            flags.append("🚨 CRITICAL: Transaction involves sanctioned entity")
            sanctions_hit = True
        
        if any("Mixer" in label for label in entity_labels):
            flags.append("🔄 Warning: Mixer service interaction detected")
            mixer_hit = True
        
        if any("Exchange" in label for label in entity_labels):
            exchange_hit = True
        
        # Analyze transaction value
        if value_eth > 100:
            flags.append(f"💰 High value transfer: {value_eth:.2f} ETH (${value_eth * 2000:.2f} USD est.)")
        elif value_eth > 10:
            flags.append(f"💰 Large transfer: {value_eth:.2f} ETH")
        
        # Check for smart contract interaction
        decoded_call = tx_data.get("decoded_call")
        if decoded_call:
            method_label = decoded_call.get("label", "Unknown")
            flags.append(f"📝 Smart contract interaction: {method_label}")
        
        # Parse token transfers
        token_transfers = []
        logs = tx_data.get("logs", [])
        for log in logs:
            decoded = log.get("decoded_event")
            if decoded and decoded.get("label") == "Transfer":
                params = {p["name"]: p["value"] for p in decoded.get("params", [])}
                if "from" in params and "to" in params and "value" in params:
                    token_transfers.append(TokenTransfer(
                        token_name=log.get("token_name", "Unknown"),
                        token_symbol=log.get("token_symbol", "???"),
                        from_address=params["from"],
                        to_address=params["to"],
                        value=str(params["value"]),
                        value_formatted=f"{int(params['value']) / 1e18:.4f}"
                    ))
        
        if len(token_transfers) > 5:
            flags.append(f"⚡ Multiple token transfers detected ({len(token_transfers)} transfers)")
        
        # Add safe indicators if no major flags
        if not flags:
            flags.append("✅ Standard transaction - no suspicious indicators detected")
        
        # Calculate risk
        risk_score, risk_level = calculate_risk_score(flags, entity_labels)
        
        return AnalysisResult(
            tx_hash=tx_hash,
            risk_score=risk_score,
            risk_level=risk_level,
            flags=flags,
            details=TransactionDetails(
                from_address=from_addr,
                to_address=to_addr,
                value=f"{value_eth:.6f} ETH",
                block_number=tx_data.get("block_number", 0),
                block_timestamp=tx_data.get("block_timestamp", ""),
                gas_used=str(gas_used),
                gas_price=f"{gas_price / 1e9:.2f} Gwei",
                transaction_fee=f"{tx_fee:.6f} ETH",
                decoded_call=decoded_call,
                token_transfers=token_transfers
            ),
            sanctions_check=sanctions_hit,
            mixer_interaction=mixer_hit,
            exchange_interaction=exchange_hit,
            entity_labels=entity_labels
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing transaction: {str(e)}")

# Address Analysis
@app.get("/api/analyze-address/{address}", response_model=AddressAnalysis)
async def analyze_address(address: str, chain: str = "eth", limit: int = 10):
    """
    Phase 2: Analyze an address's transaction history for patterns
    
    Uses Moralis getDecodedWalletTransaction endpoint
    
    - **address**: Wallet address (in URL path)
    - **chain**: Blockchain network (default: eth)
    - **limit**: Number of transactions to analyze (default: 10)
    """
    try:
        # Get address transactions from Moralis
        tx_data = moralis_request(
            f"/{address}/verbose",
            params={
                "chain": chain,
                "limit": limit
            }
        )
        
        transactions = tx_data.get("result", [])
        
        # Initialize analysis
        flags = []
        high_risk_counterparties = []
        mixer_interactions = 0
        large_tx_count = 0
        total_volume = 0
        
        # Check if address itself is flagged
        entity_labels = check_entity_labels(address)
        sanctions_hit = any("Sanctioned" in label for label in entity_labels)
        
        # Analyze transaction patterns
        recent_txs = []
        for tx in transactions:
            tx_hash = tx.get("hash", "")
            from_addr = tx.get("from_address", "")
            to_addr = tx.get("to_address", "")
            value = int(tx.get("value", 0)) / 1e18
            timestamp = tx.get("block_timestamp", "")
            
            total_volume += value
            
            # Check counterparty
            counterparty = to_addr if from_addr.lower() == address.lower() else from_addr
            counterparty_labels = check_entity_labels(counterparty)
            
            tx_flags = []
            tx_risk = 0
            
            if any("Sanctioned" in label for label in counterparty_labels):
                tx_flags.append("Sanctioned counterparty")
                high_risk_counterparties.append(counterparty)
                tx_risk += 60
            
            if any("Mixer" in label for label in counterparty_labels):
                tx_flags.append("Mixer interaction")
                mixer_interactions += 1
                tx_risk += 25
            
            if value > 10:
                tx_flags.append(f"Large amount: {value:.2f} ETH")
                large_tx_count += 1
                tx_risk += 15
            
            if not tx_flags:
                tx_flags.append("Standard")
            
            recent_txs.append(AddressTransaction(
                hash=tx_hash,
                block_timestamp=timestamp,
                from_address=from_addr,
                to_address=to_addr,
                value=f"{value:.4f} ETH",
                risk_score=min(100, tx_risk),
                flags=tx_flags
            ))
        
        # Generate address-level flags
        if mixer_interactions > 0:
            flags.append(f"🔄 Mixer interactions detected: {mixer_interactions} transaction(s)")
        
        if large_tx_count > 2:
            flags.append(f"💰 Multiple large transactions: {large_tx_count} transactions over 10 ETH")
        
        if len(transactions) > 8 and len(transactions) >= limit:
            flags.append(f"⚡ High transaction velocity: {len(transactions)}+ transactions detected")
        
        if high_risk_counterparties:
            flags.append(f"🚨 High-risk counterparties: {len(set(high_risk_counterparties))} unique address(es)")
        
        if total_volume > 100:
            flags.append(f"📊 High total volume: {total_volume:.2f} ETH across analyzed transactions")
        
        if not flags:
            flags.append("✅ No suspicious patterns detected in recent transactions")
        
        # Calculate overall risk
        risk_score, risk_level = calculate_risk_score(flags, entity_labels)
        
        return AddressAnalysis(
            address=address,
            total_transactions=len(transactions),
            risk_score=risk_score,
            risk_level=risk_level,
            flags=flags,
            entity_labels=entity_labels,
            recent_transactions=recent_txs,
            high_risk_counterparties=list(set(high_risk_counterparties)),
            sanctions_check=sanctions_hit,
            mixer_interaction=mixer_interactions > 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing address: {str(e)}")

@app.get("/")
def root():
    return {
        "service": "Blockchain Forensics and Compliance APP",
        "version": "1.0.0",
        "provider": "Moralis",
        "endpoints": {
            "analyze_transaction": "/api/analyze-transaction",
            "analyze_address": "/api/analyze-address",
            "health": "/health"
        },
        "status": "operational"
    }

@app.get("/health")
def health():
    """Health check endpoint"""
    try:
        # Test Moralis connection
        moralis_request("/latestBlockNumber/eth")
        return {
            "status": "healthy",
            "moralis_connected": True,
            "timestamp": datetime.utcnow().isoformat()
        }
    except:
        return {
            "status": "degraded",
            "moralis_connected": False,
            "timestamp": datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    import nest_asyncio
    
    # Allow nested event loops (for Jupyter)
    try:
        nest_asyncio.apply()
    except:
        pass
    
    uvicorn.run(app, host="0.0.0.0", port=8005)