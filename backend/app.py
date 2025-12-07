# Blockchain Forensics APP with Deep Analysis

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from collections import defaultdict
import requests
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Initialize the FastAPI application with metadata
app = FastAPI(
    title="Blockchain Forensics & Compliance APP",
    version="1.0.0",
    description="Advanced transaction monitoring with deep event analysis and pattern detection"
)

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the frontend (likely running on a different port/domain) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True, # Allow sending cookies/credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

MORALIS_API_KEY = os.getenv("MORALIS_KEY")
MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2"

if not MORALIS_API_KEY or MORALIS_API_KEY == "MORALIS_KEY":
    raise ValueError("❌ MORALIS_KEY not found in .env file")

# Define a dictionary of sanctioned addresses (e.g., Tornado Cash, known hackers)
SANCTIONS_LIST = {
    "0x8576acc5c05d6ce88f4e49bf65bde93d537e45d1": "OFAC Sanctioned - Tornado Cash",
    "0x722122df12d4e14e13ac3b6895a86e84145b6967": "OFAC Sanctioned - Tornado Cash",
    "0xdd4c48c0b24039969fc16d1cdf626eab821d3384": "Sanctioned - Exchange Hack",
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": "OFAC Sanctioned - Lazarus Group",
    "0x098b716b8aaf21512996dc57eb0615e2383e2f96": "Sanctioned - Mixer Service"
}

# Known Mixer Addresses (Static list for guaranteed detection of common mixers)
MIXER_ADDRESSES = {
    "0x8576acc5c05d6ce88f4e49bf65bde93d537e45d1": "Tornado Cash Router",
    "0x722122df12d4e14e13ac3b6895a86e84145b6967": "Tornado Cash",
    "0x098b716b8aaf21512996dc57eb0615e2383e2f96": "Privacy Mixer",
    "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b": "Tornado Cash Pool",
    "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc": "Tornado Cash Pool"
}

# Known Exchange Addresses (Static list)
KNOWN_EXCHANGES = {
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": "Binance Hot Wallet",
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance 14",
    "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance 15",
    "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": "Binance 16",
    "0x5041ed759dd4afc3a72b8192c143f72f4724081a": "Kraken Exchange",
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": "Bitfinex Hot Wallet"
}

# High-Risk Method Patterns (Identify suspicious smart contract interactions)
HIGH_RISK_METHODS = {
    "delegatecall", "selfdestruct", "create2", "suicide",
    "callcode", "destroy", "destroyAndSend"
}

# Mixer/Privacy Protocol Identifiers (Keywords to check against labels)
MIXER_KEYWORDS = ["tornado", "mixer", "tumbler", "privacy", "blender", "anonymizer"]

# Pydantic Models for Data Validation and Schema Documentation
class EventAnalysis(BaseModel):
    event_type: str           
    count: int                
    risk_flags: List[str]      
    details: List[Dict[str, Any]] 

class TransactionDetails(BaseModel):
    from_address: str
    from_label: Optional[str]
    from_entity: Optional[str]
    to_address: Optional[str]
    to_label: Optional[str]
    to_entity: Optional[str]
    value: str                 
    block_number: int
    block_timestamp: str       
    gas_used: str
    gas_price: str
    transaction_fee: str
    nonce: int                 # Transaction count for sender
    decoded_call: Optional[Dict] # Details of the function called

class AnalysisResult(BaseModel):
    tx_hash: str
    risk_score: int            # Calculated risk (0-100)
    risk_level: str            # LOW, MEDIUM, HIGH, CRITICAL
    risk_factors: List[str]    # Explanations for risk score
    flags: List[str]           # Specific warning flags
    details: TransactionDetails
    event_analysis: List[EventAnalysis]
    sanctions_check: bool      # True if involves sanctioned entity
    mixer_interaction: bool    # True if involves mixer
    exchange_interaction: bool # True if involves exchange
    entity_labels: List[str]   # Labels found for involved addresses
    complexity_score: int      # Score based on tx complexity
    timing_flags: List[str]    # Alerts regarding timing (e.g., late night)

class TimePattern(BaseModel):
    tx_per_hour: float
    burst_detected: bool       # True if rapid succession of txs
    suspicious_timing: bool    # True if unusual hours
    time_details: str

class AddressTransaction(BaseModel):
    hash: str
    block_timestamp: str
    from_address: str
    to_address: str
    value: str
    risk_score: int
    flags: List[str]
    entity_interaction: Optional[str]
    direction: str  # "incoming" or "outgoing"
    category: str  # "transfer", "exchange", "nft", "contract"

class AddressAnalysis(BaseModel):
    address: str
    address_label: Optional[str] # Known label for the address
    total_transactions: int
    risk_score: int
    risk_level: str
    risk_factors: List[str]
    flags: List[str]
    entity_labels: List[str]
    recent_transactions: List[AddressTransaction]
    high_risk_counterparties: List[str] # List of risky addresses interacted with
    sanctions_check: bool
    mixer_interaction: bool
    time_patterns: TimePattern
    behavior_summary: Dict[str, Any] # Aggregate behavioral stats

# Helper Functions
def moralis_request(endpoint: str, params: Dict = None) -> Dict:
    """Make request to Moralis API with error handling"""
    headers = {
        "X-API-Key": MORALIS_API_KEY,
        "accept": "application/json"
    }
    url = f"{MORALIS_BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Resource not found on the specified chain")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
             raise HTTPException(status_code=404, detail="Resource not found on the specified chain")
        raise HTTPException(status_code=e.response.status_code, detail=f"Moralis API error: {str(e)}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Moralis API error: {str(e)}")

def check_sanctions(address: str) -> tuple[bool, Optional[str]]:
    """Check if address is on OFAC sanctions list"""
    # Normalize address to lowercase for comparison
    addr_lower = address.lower()
    # Check against local static list
    if addr_lower in SANCTIONS_LIST:
        return True, SANCTIONS_LIST[addr_lower]
    return False, None

def extract_moralis_labels(tx_data: Dict) -> tuple[List[str], bool, bool]:
    """Extract entity labels from Moralis response + static lists (layered approach)"""
    labels = []
    is_mixer = False
    is_exchange = False
    
    # Get addresses from transaction data
    from_addr = tx_data.get("from_address", "").lower()
    to_addr = tx_data.get("to_address", "").lower()
    
    # Check static lists first
    if from_addr in MIXER_ADDRESSES:
        labels.append(f"🔄 From: {MIXER_ADDRESSES[from_addr]} (static list)")
        is_mixer = True
    if to_addr in MIXER_ADDRESSES:
        labels.append(f"🔄 To: {MIXER_ADDRESSES[to_addr]} (static list)")
        is_mixer = True
    
    # Check if addresses are known exchanges (from static list)
    if from_addr in KNOWN_EXCHANGES:
        labels.append(f"🏦 From: {KNOWN_EXCHANGES[from_addr]} (static list)")
        is_exchange = True
    if to_addr in KNOWN_EXCHANGES:
        labels.append(f"🏦 To: {KNOWN_EXCHANGES[to_addr]} (static list)")
        is_exchange = True
    
    # Check sender label
    if tx_data.get("from_address_label"):
        from_label = tx_data["from_address_label"]
        labels.append(f"📤 From: {from_label}")
        if any(kw in from_label.lower() for kw in MIXER_KEYWORDS):
            is_mixer = True
        if "exchange" in from_label.lower():
            is_exchange = True
    
    # Check sender entity name
    if tx_data.get("from_address_entity"):
        from_entity = tx_data["from_address_entity"]
        labels.append(f"🏢 From Entity: {from_entity}")
    
    # Check receiver label
    if tx_data.get("to_address_label"):
        to_label = tx_data["to_address_label"]
        labels.append(f"📥 To: {to_label}")
        if any(kw in to_label.lower() for kw in MIXER_KEYWORDS):
            is_mixer = True
        if "exchange" in to_label.lower() or "binance" in to_label.lower() or "kraken" in to_label.lower():
            is_exchange = True
    
    # Check receiver entity name
    if tx_data.get("to_address_entity"):
        to_entity = tx_data["to_address_entity"]
        labels.append(f"🏢 To Entity: {to_entity}")
        if any(kw in to_entity.lower() for kw in MIXER_KEYWORDS):
            is_mixer = True
    
    return labels, is_mixer, is_exchange

def analyze_events(logs: List[Dict]) -> tuple[List[EventAnalysis], List[str]]:
    """Deep analysis of all transaction events (logs)"""
    event_counts = defaultdict(list)
    flags = []
    
    # Iterate through all event logs
    for log in logs:
        decoded = log.get("decoded_event")
        # Skip if event wasn't decoded (unknown signature)
        if not decoded:
            continue
        
        # Get event name (e.g., Transfer, Approval)
        event_type = decoded.get("label", "Unknown")
        # Extract parameters into a dictionary
        params = {p["name"]: p["value"] for p in decoded.get("params", [])}
        
        # Group events by type
        event_counts[event_type].append({
            "address": log.get("address"),
            "params": params,
            "log_index": log.get("log_index")
        })
    
    # Analyze each event type group
    analyses = []
    
    for event_type, occurrences in event_counts.items():
        event_flags = []
        
        # Check for dangerous Approvals (infinite allowance)
        if event_type == "Approval":
            # Check for very large amounts (near uint256 max)
            unlimited = sum(1 for e in occurrences 
                          if int(e["params"].get("amount", 0)) > 1e50)
            if unlimited > 0:
                event_flags.append(f"{unlimited} unlimited approval(s)")
                flags.append(f"⚠️ {unlimited} unlimited token approval(s) detected")
        
        # Check for complex Transfer patterns
        elif event_type == "Transfer":
            # Count how many distinct tokens were moved
            unique_tokens = len(set(e["address"] for e in occurrences))
            if unique_tokens > 5:
                event_flags.append(f"Multiple tokens: {unique_tokens}")
                flags.append(f"🔄 Complex flow: {unique_tokens} different tokens")
        
        # Check for Swaps (DEX interactions)
        elif event_type in ["Swap", "Swapped"]:
            # Check if there are many swaps in one tx (routing?)
            if len(occurrences) > 3:
                event_flags.append(f"Multi-hop swap: {len(occurrences)} swaps")
                flags.append(f"🔄 Complex DEX routing: {len(occurrences)} swap hops")
        
        # Check for large Withdrawals
        elif event_type == "Withdrawal":
            # Identify large outbound native token moves
            large_withdrawals = sum(1 for e in occurrences 
                                   if int(e["params"].get("wad", 0)) > 1e20) # > 100 ETH
            if large_withdrawals > 0:
                event_flags.append(f"{large_withdrawals} large withdrawal(s)")
        
        # Append analysis for this event type
        analyses.append(EventAnalysis(
            event_type=event_type,
            count=len(occurrences),
            risk_flags=event_flags,
            details=occurrences[:3]  # Return details for First 3 occurrences only
        ))
    
    return analyses, flags

def analyze_timing(timestamp_str: str) -> List[str]:
    """Analyze transaction timing for suspicious patterns (e.g., late night hours)"""
    flags = []
    
    try:
        # standardizing timestamp format
        dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        hour = dt.hour
        
        # Check for Late night activity (2 AM - 5 AM UTC) - often correlates with hack timing
        if 2 <= hour <= 5:
            flags.append(f"🌙 Late-night activity ({hour:02d}:00 UTC)")
        
        # Check for Weekend activity (banks closed, less monitoring)
        if dt.weekday() >= 5:
            flags.append("📅 Weekend transaction")
    except:
        pass
    
    return flags

def calculate_complexity_score(event_count: int) -> int:
    """Calculate a numeric score (0-100) representing transaction complexity"""
    score = 0
    
    # Points for number of events
    score += min(event_count * 2, 50)
    
    # Cap score at 100
    return min(score, 100)

def calculate_advanced_risk_score(
    sanctions_hit: bool,
    mixer_hit: bool,
    flags: List[str],
    entity_labels: List[str],
    complexity: int,
    timing_flags: List[str]
) -> tuple[int, List[str]]:
    """Determine final risk score based on weighted factors"""
    score = 0
    factors = []
    
    # CRITICAL RISK FACTORS
    if sanctions_hit:
        score += 70
        factors.append("🚨 CRITICAL: Sanctioned entity")
    
    # HIGH RISK FACTORS
    if mixer_hit:
        score += 40
        factors.append("🔄 Mixer/privacy service interaction")
    
    if any("unlimited approval" in f.lower() for f in flags):
        score += 30
        factors.append("⚠️ Unlimited token approvals")
    
    if any("circular" in f.lower() for f in flags):
        score += 25
        factors.append("⚠️ Circular flow pattern")
    
    # MEDIUM RISK FACTORS
    if complexity > 50:
        score += 20
        factors.append(f"📊 High complexity ({complexity}/100)")
    
    # Large value transfer check
    if any("large" in f.lower() or "high value" in f.lower() for f in flags):
        score += 15
        factors.append("💰 Large value transfer")
    
    # Timing risks
    if len(timing_flags) > 0:
        score += 10
        factors.append("🕐 Suspicious timing")
    
    # POSITIVE FACTORS (Mitigating factors)
    # Reduce risk if interacting with known safe exchanges
    if any("exchange" in label.lower() for label in entity_labels):
        score = max(0, score - 15)
        factors.append("✅ Known exchange interaction")
    
    return min(100, score), factors

# API Endpoints

@app.get("/api/analyze-transaction/{tx_hash}", response_model=AnalysisResult)
async def analyze_transaction(tx_hash: str, chain: str = "eth"):
    """
    Enhanced transaction analysis with deep event parsing and pattern detection
    
    - **tx_hash**: Transaction hash
    - **chain**: Blockchain network (default: eth)
    
    Returns comprehensive risk analysis including:
    - Event-level analysis (approvals, swaps, transfers)
    - Entity recognition via Moralis labels
    - Timing and complexity analysis
    - Multi-factor risk scoring
    """
    try:
        tx_data = moralis_request(
            f"/transaction/{tx_hash}/verbose",
            params={"chain": chain}
        )
        
        from_addr = tx_data.get("from_address", "")
        to_addr = tx_data.get("to_address", "")
        value_wei = int(tx_data.get("value", 0))
        value_eth = value_wei / 1e18 # Convert Wei to ETH
        nonce = int(tx_data.get("nonce", 0))
        
        # Initialize flags and checks
        flags = []
        
        # Critical Sanctions Check
        from_sanctioned, from_reason = check_sanctions(from_addr)
        to_sanctioned, to_reason = check_sanctions(to_addr)
        sanctions_hit = from_sanctioned or to_sanctioned
        
        if from_sanctioned:
            flags.append(f"🚨 CRITICAL: From address sanctioned - {from_reason}")
        if to_sanctioned:
            flags.append(f"🚨 CRITICAL: To address sanctioned - {to_reason}")
        
        # Extract Entity Labels (Mixers, Exchanges)
        entity_labels, mixer_hit, exchange_hit = extract_moralis_labels(tx_data)
        
        if mixer_hit:
            flags.append("🔄 Mixer/privacy service detected")
        
        # Deep Event Analysis (Logs)
        event_analyses, event_flags = analyze_events(tx_data.get("logs", []))
        flags.extend(event_flags)
        
        # Value Analysis
        if value_eth > 100:
            flags.append(f"💰 Very high value: {value_eth:.2f} ETH (~${value_eth * 2500:.2f})")
        elif value_eth > 10:
            flags.append(f"💰 High value: {value_eth:.2f} ETH")
        
        # Analyze Decoded Function Calls (Input Data)
        decoded_call = tx_data.get("decoded_call")
        if decoded_call:
            method = decoded_call.get("label", "").lower()
            
            # Check for high-risk methods
            if any(risk in method for risk in HIGH_RISK_METHODS):
                flags.append(f"🚨 HIGH RISK method: {decoded_call.get('label')}")
            
            # Check parameters specifically for 'deadline' (MEV detection)
            params = decoded_call.get("params", [])
            for param in params:
                if param.get("name") == "deadline":
                    # Very short deadline relative to timestamp might indicate MEV/Flashbots
                    deadline = int(param.get("value", 0))
                    if 0 < deadline < 9999999999: # Simple heuristic
                        flags.append("⚡ Short deadline (possible MEV)")
        
        # Timing Analysis
        timing_flags = analyze_timing(tx_data.get("block_timestamp", ""))
        
        # Calculate Complexity Score
        complexity_score = calculate_complexity_score(
            len(tx_data.get("logs", []))
        )
        
        # Calculate Overall Risk Score
        risk_score, risk_factors = calculate_advanced_risk_score(
            sanctions_hit,
            mixer_hit,
            flags,
            entity_labels,
            complexity_score,
            timing_flags
        )
        
        # Determine Categorical Risk Level
        if risk_score >= 70:
            risk_level = "CRITICAL"
        elif risk_score >= 50:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # Add 'Safe' indicator if score is low and no flags
        if not flags and risk_score < 30:
            flags.append("✅ Standard transaction - no suspicious indicators")
        
        # Construct and return result object
        return AnalysisResult(
            tx_hash=tx_hash,
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=risk_factors,
            flags=flags,
            details=TransactionDetails(
                from_address=from_addr,
                from_label=tx_data.get("from_address_label"),
                from_entity=tx_data.get("from_address_entity"),
                to_address=to_addr,
                to_label=tx_data.get("to_address_label"),
                to_entity=tx_data.get("to_address_entity"),
                value=f"{value_eth:.6f} ETH",
                block_number=tx_data.get("block_number", 0),
                block_timestamp=tx_data.get("block_timestamp", ""),
                gas_used=tx_data.get("receipt_gas_used", "0"),
                gas_price=f"{int(tx_data.get('gas_price', 0)) / 1e9:.2f} Gwei", # Convert Wei to Gwei
                transaction_fee=tx_data.get("transaction_fee", "0"),
                nonce=nonce,
                decoded_call=decoded_call
            ),
            event_analysis=event_analyses,
            sanctions_check=sanctions_hit,
            mixer_interaction=mixer_hit,
            exchange_interaction=exchange_hit,
            entity_labels=entity_labels,
            complexity_score=complexity_score,
            timing_flags=timing_flags
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing transaction: {str(e)}")

@app.get("/api/analyze-address/{address}", response_model=AddressAnalysis)
async def analyze_address(address: str, chain: str = "eth", limit: int = 25):
    """
    Enhanced address analysis with behavioral pattern detection
    
    - **address**: Wallet address
    - **chain**: Blockchain network (default: eth)
    - **limit**: Number of transactions to analyze (default: 25)
    
    Returns comprehensive address profile including:
    - Transaction velocity and timing patterns
    - High-risk counterparty detection
    - Entity label extraction
    - Behavioral anomaly detection
    - Multi-factor risk scoring
    """
    try:
        tx_data = moralis_request(
            f"/{address}/verbose",
            params={"chain": chain, "limit": limit, "order": "DESC"}
        )
        
        transactions = tx_data.get("result", [])
        
        if not transactions:
            raise HTTPException(status_code=404, detail="No transactions found")
        
        # Initialize analysis counters and lists
        flags = []
        risk_factors = []
        high_risk_counterparties = []
        mixer_interactions = 0
        large_tx_count = 0
        total_volume = 0
        timestamps = []
        
        # Check if target address itself is sanctioned
        addr_sanctioned, addr_reason = check_sanctions(address)
        sanctions_hit = addr_sanctioned
        
        if addr_sanctioned:
            flags.append(f"🚨 CRITICAL: Address is sanctioned - {addr_reason}")
            risk_factors.append("Address on sanctions list")
        
        # Determine Label for the Target Address (from own txs)
        address_label = None
        if transactions:
            first_tx = transactions[0]
            # Check if address was sender in first tx
            if first_tx.get("from_address", "").lower() == address.lower():
                address_label = first_tx.get("from_address_label")
            else:
                address_label = first_tx.get("to_address_label")
        
        # Iterate and Analyze Recent Transactions
        recent_txs = []
        entity_interactions = defaultdict(int)
        
        for tx in transactions:
            tx_hash = tx.get("hash", "")
            from_addr = tx.get("from_address", "")
            to_addr = tx.get("to_address", "")
            value = int(tx.get("value", 0)) / 1e18 # ETH value
            timestamp = tx.get("block_timestamp", "")
            
            # Parse timestamp for timing analysis
            try:
                dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                timestamps.append(dt)
            except:
                pass
            
            total_volume += value
            
            # Identify Counterparty (the other side of the tx)
            is_outgoing = from_addr.lower() == address.lower()
            counterparty = to_addr if is_outgoing else from_addr
            
            # Get Counterparty Labels
            if is_outgoing:
                cp_label = tx.get("to_address_label")
                cp_entity = tx.get("to_address_entity")
            else:
                cp_label = tx.get("from_address_label")
                cp_entity = tx.get("from_address_entity")
            
            # Track counts of potential entities interacted with
            if cp_entity:
                entity_interactions[cp_entity] += 1
            
            # Analyze this specific transaction
            tx_flags = []
            tx_risk = 0
            entity_info = None
            
            # Counterparty Sanctions Check
            cp_sanctioned, cp_reason = check_sanctions(counterparty)
            if cp_sanctioned:
                tx_flags.append(f"Sanctioned: {cp_reason}")
                high_risk_counterparties.append(counterparty)
                tx_risk += 70
            
            # Counterparty Mixer Check
            # Check label keywords
            if cp_label and any(kw in cp_label.lower() for kw in MIXER_KEYWORDS):
                tx_flags.append("Mixer interaction")
                mixer_interactions += 1
                tx_risk += 40
                entity_info = cp_label
            # Check entity keywords
            elif cp_entity and any(kw in cp_entity.lower() for kw in MIXER_KEYWORDS):
                tx_flags.append("Mixer interaction")
                mixer_interactions += 1
                tx_risk += 40
                entity_info = cp_entity
            
            # Transaction Value Check
            if value > 50:
                tx_flags.append(f"Very large: {value:.2f} ETH")
                large_tx_count += 1
                tx_risk += 25
            elif value > 10:
                tx_flags.append(f"Large: {value:.2f} ETH")
                large_tx_count += 1
                tx_risk += 15
            
            # Set display info for entity
            if cp_entity and not entity_info:
                entity_info = cp_entity
            elif cp_label and not entity_info:
                entity_info = cp_label
            
            if not tx_flags:
                tx_flags.append("Standard")
            
            # Determine transaction direction
            direction = "outgoing" if is_outgoing else "incoming"
            
            # Determine transaction category
            category = "transfer"  # default
            entity_lower = (entity_info or "").lower()
            
            # Check for exchanges
            if any(keyword in entity_lower for keyword in ["exchange", "binance", "coinbase", "kraken", "uniswap", "1inch", "sushiswap", "pancakeswap"]):
                category = "exchange"
            # Check for NFT platforms
            elif any(keyword in entity_lower for keyword in ["opensea", "blur", "looksrare", "x2y2", "nft", "beanz", "azuki"]):
                category = "nft"
            # Check for contracts (if entity exists but not exchange/NFT)
            elif entity_info and not category in ["exchange", "nft"]:
                category = "contract"
            
            # Add to list of analyzed transactions
            recent_txs.append(AddressTransaction(
                hash=tx_hash,
                block_timestamp=timestamp,
                from_address=from_addr,
                to_address=to_addr,
                value=f"{value:.4f} ETH",
                risk_score=min(100, tx_risk),
                flags=tx_flags,
                entity_interaction=entity_info,
                direction=direction,
                category=category
            ))
        
        # Time-Based Pattern Analysis (Bursts, Late Night)
        time_patterns = analyze_time_patterns(timestamps)
        
        # Generate Address-Level Aggregate Flags
        if mixer_interactions > 0:
            flags.append(f"🔄 Mixer interactions: {mixer_interactions} transaction(s)")
            risk_factors.append("Multiple mixer interactions")
        
        if large_tx_count > 3:
            flags.append(f"💰 Multiple large transactions: {large_tx_count} txs > 10 ETH")
            risk_factors.append("High-value transaction pattern")
        
        if time_patterns.burst_detected:
            flags.append(f"⚡ Burst activity detected: {time_patterns.time_details}")
            risk_factors.append("Burst transaction pattern")
        
        if time_patterns.suspicious_timing:
            flags.append("🌙 Unusual timing patterns detected")
            risk_factors.append("Off-hours activity")
        
        if high_risk_counterparties:
            unique_risk = len(set(high_risk_counterparties))
            flags.append(f"🚨 High-risk counterparties: {unique_risk} address(es)")
            risk_factors.append("Sanctioned counterparties")
        
        if total_volume > 500:
            flags.append(f"📊 Very high volume: {total_volume:.2f} ETH")
            risk_factors.append("Extremely high transaction volume")
        elif total_volume > 100:
            flags.append(f"📊 High volume: {total_volume:.2f} ETH")
        
        # Entity Interaction Summary
        entity_labels = []
        if address_label:
            entity_labels.append(f"🏷️ Address: {address_label}")
        
        # Get top 5 entities interacted with
        for entity, count in sorted(entity_interactions.items(), key=lambda x: x[1], reverse=True)[:5]:
            entity_labels.append(f"🔗 {entity} ({count} txs)")
        
        # Calculate category summaries for frontend cards
        incoming_txs = [tx for tx in recent_txs if tx.direction == "incoming"]
        outgoing_txs = [tx for tx in recent_txs if tx.direction == "outgoing"]
        exchange_txs = [tx for tx in recent_txs if tx.category == "exchange"]
        nft_txs = [tx for tx in recent_txs if tx.category == "nft"]
        
        # Calculate totals (parse ETH values)
        def parse_eth_value(value_str):
            try:
                return float(value_str.replace(" ETH", ""))
            except:
                return 0.0
        
        incoming_total = sum(parse_eth_value(tx.value) for tx in incoming_txs)
        outgoing_total = sum(parse_eth_value(tx.value) for tx in outgoing_txs)
        
        # Get unique exchange and NFT platforms
        exchange_platforms = list(set(tx.entity_interaction for tx in exchange_txs if tx.entity_interaction))
        nft_platforms = list(set(tx.entity_interaction for tx in nft_txs if tx.entity_interaction))
        
        # Behavioral Summary Dict
        behavior_summary = {
            "total_volume_eth": round(total_volume, 4),
            "avg_tx_value_eth": round(total_volume / len(transactions), 4) if transactions else 0,
            "large_tx_count": large_tx_count,
            "mixer_interaction_count": mixer_interactions,
            "unique_counterparties": len(set(
                [tx.to_address for tx in recent_txs] + [tx.from_address for tx in recent_txs]
            )),
            "top_entities": dict(list(entity_interactions.items())[:5]),
            "analysis_period_days": (timestamps[0] - timestamps[-1]).days if len(timestamps) > 1 else 0
        }
        
        # Calculate Final Risk Score
        risk_score, _ = calculate_advanced_risk_score(
            sanctions_hit,
            mixer_interactions > 0,
            flags,
            entity_labels,
            min(len(transactions) * 2, 50),  # Use tx frequency as proxy for complexity
            [f for f in flags if "timing" in f.lower() or "late" in f.lower()]
        )
        
        # Small penalty for burst behavior
        if time_patterns.burst_detected:
            risk_score = min(100, risk_score + 15)
        
        # Determine Risk Level
        if risk_score >= 70:
            risk_level = "CRITICAL"
        elif risk_score >= 50:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        if not flags:
            flags.append("✅ No suspicious patterns detected")
        
        # Return complete analysis
        return AddressAnalysis(
            address=address,
            address_label=address_label,
            total_transactions=len(transactions),
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=risk_factors,
            flags=flags,
            entity_labels=entity_labels,
            recent_transactions=recent_txs,
            high_risk_counterparties=list(set(high_risk_counterparties)),
            sanctions_check=sanctions_hit,
            mixer_interaction=mixer_interactions > 0,
            time_patterns=time_patterns,
            behavior_summary=behavior_summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing address: {str(e)}")

def analyze_time_patterns(timestamps: List[datetime]) -> TimePattern:
    """Analyze temporal patterns in transaction history (e.g., density, timing)"""
    if len(timestamps) < 2:
        return TimePattern(
            tx_per_hour=0,
            burst_detected=False,
            suspicious_timing=False,
            time_details="Insufficient data"
        )
    
    # Sort timestamps newest first
    timestamps = sorted(timestamps, reverse=True)
    
    # Calculate Velocity (TX/Hour)
    time_span_hours = (timestamps[0] - timestamps[-1]).total_seconds() / 3600
    tx_per_hour = len(timestamps) / time_span_hours if time_span_hours > 0 else 0
    
    # Detect Bursts: Check if 3 transactions happened within a 1-hour window
    burst_detected = False
    for i in range(len(timestamps) - 2):
        window = (timestamps[i] - timestamps[i+2]).total_seconds() / 3600
        if window < 1:
            burst_detected = True
            break
    
    # Check for Suspicious Timing (Late Night): >30% of txs between 2am and 5am
    suspicious_timing = sum(1 for ts in timestamps if 2 <= ts.hour <= 5) > len(timestamps) * 0.3
    
    # Text summary details
    details = f"{tx_per_hour:.2f} tx/hour over {time_span_hours:.1f} hours"
    if burst_detected:
        details += " | Burst detected"
    
    return TimePattern(
        tx_per_hour=round(tx_per_hour, 2),
        burst_detected=burst_detected,
        suspicious_timing=suspicious_timing,
        time_details=details
    )

@app.get("/")
def root():
    """Root endpoint to verify service status and capabilities"""
    return {
        "service": "Blockchain Forensics & Compliance APP",
        "version": "1.0.0",
        "provider": "Moralis",
        "features": [
            "Deep event analysis (all event types)",
            "Multi-factor risk scoring",
            "Behavioral pattern detection",
            "Entity label extraction",
            "Temporal anomaly detection"
        ],
        "endpoints": {
            "analyze_transaction": "/api/analyze-transaction/{tx_hash}",
            "analyze_address": "/api/analyze-address/{address}",
            "health": "/health",
            "docs": "/docs"
        },
        "status": "operational"
    }

@app.get("/health")
def health():
    """Health check endpoint containing a live Moralis connectivity test"""
    try:
        # Test connection by fetching latest block
        moralis_request("/block/latest", params={"chain": "eth"})
        return {
            "status": "healthy",
            "moralis_connected": True,
            "api_version": "1.0.0",
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
    print("🚀 Starting Blockchain Forensics APP...")
    print("📊 Features: Deep event analysis, behavioral patterns")
    print("🔗 Moralis integration enabled")
    print("📖 API docs: http://localhost:8002/docs")
    uvicorn.run(app, host="0.0.0.0", port=8002)