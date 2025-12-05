import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Search, Shield, TrendingUp, ExternalLink, User, Activity, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { analyzeTransaction, analyzeAddress } from '../services/api';

const Dashboard = () => {
    const [mode, setMode] = useState('transaction');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [txResult, setTxResult] = useState(null);
    const [addressResult, setAddressResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyzeTransaction = async () => {
        setLoading(true);
        setError(null);
        setTxResult(null);
        setAddressResult(null);

        try {
            const data = await analyzeTransaction(input);
            setTxResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeAddress = async () => {
        setLoading(true);
        setError(null);
        setTxResult(null);
        setAddressResult(null);

        try {
            const data = await analyzeAddress(input);
            setAddressResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = () => {
        if (!input.trim()) return;
        if (mode === 'transaction') {
            handleAnalyzeTransaction();
        } else {
            handleAnalyzeAddress();
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getRiskIcon = (level) => {
        if (level === 'HIGH') return <AlertCircle className="w-6 h-6" />;
        if (level === 'MEDIUM') return <AlertTriangle className="w-6 h-6" />;
        return <CheckCircle className="w-6 h-6" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Shield className="w-12 h-12 text-blue-400" />
                        <h1 className="text-5xl font-bold text-white">Blockchain Forensics and Compliance App</h1>
                    </div>
                    <p className="text-blue-200 text-lg mb-4">
                        Transaction Monitoring & Compliance Analysis
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-300">
                        <span className="bg-blue-900/50 px-3 py-1 rounded-full">Powered by Moralis</span>
                        <span className="bg-blue-900/50 px-3 py-1 rounded-full">Ethereum Mainnet</span>
                        <span className="bg-green-900/50 px-3 py-1 rounded-full">✓ Live</span>
                    </div>
                </div>

                {/* Mode Switcher */}
                <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => { setMode('transaction'); setTxResult(null); setAddressResult(null); setError(null); }}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'transaction'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Activity className="w-5 h-5" />
                                Analyze Transaction
                            </div>
                        </button>
                        <button
                            onClick={() => { setMode('address'); setTxResult(null); setAddressResult(null); setError(null); }}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'address'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-5 h-5" />
                                Analyze Address
                            </div>
                        </button>
                    </div>

                    {/* Input Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {mode === 'transaction' ? 'Enter Transaction Hash' : 'Enter Wallet Address'}
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                placeholder={mode === 'transaction' ? '0x...' : '0x...'}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !input.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Analyze
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Example buttons */}
                        <div className="mt-4 text-sm text-gray-600">
                            <p className="font-medium mb-2">Try these examples:</p>
                            <div className="flex gap-2 flex-wrap">
                                {mode === 'transaction' ? (
                                    <>
                                        <button
                                            onClick={() => setInput('0xfeda0e8f0d6e54112c28d319c0d303c065d1125c9197bd653682f5fcb0a6c81e')}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                        >
                                            Recent 1inch Swap
                                        </button>

                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setInput('0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be')}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                        >
                                            Binance Hot Wallet
                                        </button>

                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                            <p className="text-red-800 font-semibold">Analysis Failed</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Transaction Results */}
                {txResult && (
                    <div className="space-y-6">
                        {/* Risk Score Card */}
                        <div className={`rounded-lg border-2 p-6 ${getRiskColor(txResult.risk_level)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getRiskIcon(txResult.risk_level)}
                                    <div>
                                        <h2 className="text-2xl font-bold">Risk Level: {txResult.risk_level}</h2>
                                        <p className="text-sm opacity-80">Transaction: {txResult.tx_hash.slice(0, 20)}...</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold">{txResult.risk_score}</div>
                                    <div className="text-xs opacity-80">RISK SCORE</div>
                                </div>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-current transition-all duration-500"
                                    style={{ width: `${txResult.risk_score}%` }}
                                />
                            </div>
                        </div>

                        {/* Entity Labels */}
                        {txResult.entity_labels && txResult.entity_labels.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-purple-500" />
                                    Entity Labels
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {txResult.entity_labels.map((label, idx) => (
                                        <span key={idx} className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risk Flags */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                Risk Indicators ({txResult.flags.length})
                            </h3>
                            <ul className="space-y-2">
                                {txResult.flags.map((flag, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Transaction Details */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Transaction Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">From Address</p>
                                    <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                                        {txResult.details.from_address}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">To Address</p>
                                    <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                                        {txResult.details.to_address || 'Contract Creation'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        Value
                                    </p>
                                    <p className="font-semibold text-gray-900">{txResult.details.value}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Block Number</p>
                                    <p className="font-semibold text-gray-900">{txResult.details.block_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Timestamp
                                    </p>
                                    <p className="font-semibold text-gray-900">{txResult.details.block_timestamp}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Transaction Fee</p>
                                    <p className="font-semibold text-gray-900">{txResult.details.transaction_fee}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Gas Used</p>
                                    <p className="font-semibold text-gray-900">{txResult.details.gas_used}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Gas Price</p>
                                    <p className="font-semibold text-gray-900">{txResult.details.gas_price}</p>
                                </div>
                                {txResult.details.decoded_call && (
                                    <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-600 mb-1 font-semibold">Smart Contract Interaction</p>
                                        <p className="font-mono text-sm text-blue-900">
                                            Method: {txResult.details.decoded_call.label || 'Unknown'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Token Transfers */}
                        {txResult.details.token_transfers && txResult.details.token_transfers.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Token Transfers ({txResult.details.token_transfers.length})
                                </h3>
                                <div className="space-y-3">
                                    {txResult.details.token_transfers.map((transfer, idx) => (
                                        <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-blue-900">
                                                    {transfer.token_name} ({transfer.token_symbol})
                                                </span>
                                                <span className="text-blue-700 font-semibold">
                                                    {transfer.value_formatted} {transfer.token_symbol}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p>From: {transfer.from_address}</p>
                                                <p>To: {transfer.to_address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compliance Checks */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Compliance Checks</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Sanctions List</span>
                                    {txResult.sanctions_check ? (
                                        <span className="text-red-600 font-semibold flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            MATCH
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-semibold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            CLEAR
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Mixer Detection</span>
                                    {txResult.mixer_interaction ? (
                                        <span className="text-red-600 font-semibold flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            DETECTED
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-semibold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            CLEAR
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Exchange</span>
                                    {txResult.exchange_interaction ? (
                                        <span className="text-blue-600 font-semibold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            YES
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 font-semibold">
                                            NO
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                                Export Report
                            </button>
                            <a
                                href={`https://etherscan.io/tx/${txResult.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View on Etherscan
                            </a>
                        </div>
                    </div>
                )}

                {/* Address Results */}
                {addressResult && (
                    <div className="space-y-6">
                        {/* Address Risk Score */}
                        <div className={`rounded-lg border-2 p-6 ${getRiskColor(addressResult.risk_level)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getRiskIcon(addressResult.risk_level)}
                                    <div>
                                        <h2 className="text-2xl font-bold">Address Risk: {addressResult.risk_level}</h2>
                                        <p className="text-sm opacity-80 font-mono">{addressResult.address.slice(0, 20)}...</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold">{addressResult.risk_score}</div>
                                    <div className="text-xs opacity-80">RISK SCORE</div>
                                </div>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-current transition-all duration-500"
                                    style={{ width: `${addressResult.risk_score}%` }}
                                />
                            </div>
                        </div>

                        {/* Address Summary */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Address Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{addressResult.total_transactions}</p>
                                    <p className="text-sm text-gray-600">Transactions</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{addressResult.entity_labels.length}</p>
                                    <p className="text-sm text-gray-600">Labels</p>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <p className="text-2xl font-bold text-orange-600">{addressResult.flags.length}</p>
                                    <p className="text-sm text-gray-600">Risk Flags</p>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{addressResult.high_risk_counterparties.length}</p>
                                    <p className="text-sm text-gray-600">High Risk</p>
                                </div>
                            </div>
                        </div>

                        {/* Entity Labels */}
                        {addressResult.entity_labels && addressResult.entity_labels.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-purple-500" />
                                    Entity Information
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {addressResult.entity_labels.map((label, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risk Patterns */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                Detected Patterns ({addressResult.flags.length})
                            </h3>
                            <ul className="space-y-2">
                                {addressResult.flags.map((flag, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                            <div className="space-y-3">
                                {addressResult.recent_transactions.map((tx, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-sm text-blue-600">{tx.hash.slice(0, 20)}...</span>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.risk_score >= 70 ? 'bg-red-100 text-red-700' :
                                                tx.risk_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                Risk: {tx.risk_score}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Value: {tx.value}</p>
                                            <p>Time: {tx.block_timestamp}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {tx.flags.map((flag, fIdx) => (
                                                    <span key={fIdx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* High Risk Counterparties */}
                        {addressResult.high_risk_counterparties.length > 0 && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    ⚠️ High Risk Counterparties
                                </h3>
                                <div className="space-y-2">
                                    {addressResult.high_risk_counterparties.map((addr, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded font-mono text-sm text-gray-700">
                                            {addr}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                                Export Report
                            </button>
                            <a
                                href={`https://etherscan.io/address/${addressResult.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View on Etherscan
                            </a>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-blue-200 text-sm space-y-2">
                    <p>🚀 Blockchain Forensics & Compliance Platform v1.0</p>
                    <p className="text-xs opacity-75">Powered by Moralis API | Real-time Ethereum Analysis</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
