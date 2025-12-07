import React, { useState } from 'react';
import { Search, AlertTriangle, Shield, Activity, TrendingUp, Clock, Network, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import WalletAttributionGraph from './WalletAttributionGraph';
import TransactionFlowVisualization from './TransactionFlowVisualization';

const ForensicsDashboard = () => {
    const [activeTab, setActiveTab] = useState('transaction');
    const [graphView, setGraphView] = useState(null);
    const [txHash, setTxHash] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [txResult, setTxResult] = useState(null);
    const [addressResult, setAddressResult] = useState(null);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002';

    const analyzeTx = async () => {
        if (!txHash.trim()) return;

        setLoading(true);
        setError(null);
        setTxResult(null);

        try {
            console.log('Fetching transaction:', txHash);
            const response = await fetch(`${API_BASE}/api/analyze-transaction/${txHash}?chain=eth`);
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Transaction analysis failed' }));
                throw new Error(errorData.detail || `Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Transaction data received:', data);
            setTxResult(data);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to fetch. Make sure the API is running on http://localhost:8002');
        } finally {
            setLoading(false);
        }
    };

    const analyzeAddress = async () => {
        if (!address.trim()) return;

        setLoading(true);
        setError(null);
        setAddressResult(null);

        try {
            console.log('Fetching address:', address);
            const response = await fetch(`${API_BASE}/api/analyze-address/${address}?chain=eth&limit=25`);
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Address analysis failed' }));
                throw new Error(errorData.detail || `Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Address data received:', data);
            setAddressResult(data);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to fetch. Make sure the API is running on http://localhost:8002');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'CRITICAL': return <XCircle className="w-5 h-5" />;
            case 'HIGH': return <AlertTriangle className="w-5 h-5" />;
            case 'MEDIUM': return <AlertCircle className="w-5 h-5" />;
            case 'LOW': return <CheckCircle className="w-5 h-5" />;
            default: return <Shield className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-8 h-8 text-blue-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">Blockchain Forensics</h1>
                                <p className="text-sm text-slate-400">Advanced Transaction Monitoring & Risk Analysis</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-300">API Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tab Navigation */}
                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => setActiveTab('transaction')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'transaction'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4" />
                            <span>Transaction Analysis</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('address')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'address'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Network className="w-4 h-4" />
                            <span>Address Profiling</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('graphs')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'graphs'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Address Clustering</span>
                        </div>
                    </button>
                </div>

                {/* Transaction Analysis Tab */}
                {activeTab === 'transaction' && (
                    <div className="space-y-6">
                        {/* Search Box */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Transaction Hash
                            </label>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && analyzeTx()}
                                    placeholder="0x..."
                                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={analyzeTx}
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Example: 0xfeda0e8f0d6e54112c28d319c0d303c065d1125c9197bd653682f5fcb0a6c81e
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Transaction Results */}
                        {txResult && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* Risk Score Card */}
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">Risk Assessment</h3>
                                            <p className="text-sm text-slate-400">Multi-factor analysis result</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg border-2 flex items-center space-x-2 ${getRiskColor(txResult.risk_level)}`}>
                                            {getRiskIcon(txResult.risk_level)}
                                            <span className="font-bold">{txResult.risk_level}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-400">Risk Score</span>
                                            <span className="text-lg font-bold text-white">{txResult.risk_score}/100</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${txResult.risk_score >= 70 ? 'bg-red-500' :
                                                    txResult.risk_score >= 50 ? 'bg-orange-500' :
                                                        txResult.risk_score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${txResult.risk_score}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                                <span className="text-xs text-slate-400">Sanctions</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">
                                                {txResult.sanctions_check ? 'DETECTED' : 'Clear'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Activity className="w-4 h-4 text-orange-400" />
                                                <span className="text-xs text-slate-400">Mixer</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">
                                                {txResult.mixer_interaction ? 'DETECTED' : 'Clear'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Network className="w-4 h-4 text-green-400" />
                                                <span className="text-xs text-slate-400">Exchange</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">
                                                {txResult.exchange_interaction ? 'YES' : 'No'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs text-slate-400">Complexity</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">
                                                {txResult.complexity_score}/100
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                <span className="text-xs text-slate-400">Timing Flags</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">
                                                {txResult.timing_flags.length || 'None'}
                                            </p>
                                        </div>
                                    </div>

                                    {txResult.risk_factors.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-300 mb-2">Risk Factors</h4>
                                            <div className="space-y-2">
                                                {txResult.risk_factors.map((factor, idx) => (
                                                    <div key={idx} className="flex items-start space-x-2 text-sm">
                                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                                                        <span className="text-slate-300">{factor}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Transaction Details */}
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                    <h3 className="text-lg font-semibold text-white mb-4">Transaction Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-400">From:</span>
                                            <p className="text-white font-mono text-xs mt-1 break-all">
                                                {txResult.details.from_address}
                                            </p>
                                            {txResult.details.from_label && (
                                                <p className="text-blue-400 text-xs mt-1">🏷️ {txResult.details.from_label}</p>
                                            )}
                                            {txResult.details.from_entity && (
                                                <p className="text-purple-400 text-xs mt-1">🏢 {txResult.details.from_entity}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-slate-400">To:</span>
                                            <p className="text-white font-mono text-xs mt-1 break-all">
                                                {txResult.details.to_address}
                                            </p>
                                            {txResult.details.to_label && (
                                                <p className="text-blue-400 text-xs mt-1">🏷️ {txResult.details.to_label}</p>
                                            )}
                                            {txResult.details.to_entity && (
                                                <p className="text-purple-400 text-xs mt-1">🏢 {txResult.details.to_entity}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Value:</span>
                                            <p className="text-white font-semibold mt-1">{txResult.details.value}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Timestamp:</span>
                                            <p className="text-white font-semibold mt-1 text-xs">
                                                {new Date(txResult.details.block_timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Block Number:</span>
                                            <p className="text-white font-semibold mt-1">{txResult.details.block_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Nonce:</span>
                                            <p className="text-white font-semibold mt-1">{txResult.details.nonce}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Gas Used:</span>
                                            <p className="text-white font-semibold mt-1">{txResult.details.gas_used}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Gas Price:</span>
                                            <p className="text-white font-semibold mt-1">{txResult.details.gas_price}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Transaction Fee:</span>
                                            <p className="text-white font-semibold mt-1">{txResult.details.transaction_fee} ETH</p>
                                        </div>
                                        {txResult.details.token_flows && (
                                            <div>
                                                <span className="text-slate-400">Token Hops:</span>
                                                <p className="text-white font-semibold mt-1">{txResult.details.total_hops}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Decoded Call */}
                                    {txResult.details.decoded_call && (
                                        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                                            <h4 className="text-sm font-semibold text-slate-300 mb-2">📝 Decoded Function Call</h4>
                                            <p className="text-white font-mono text-sm mb-1">{txResult.details.decoded_call.label}</p>
                                            <p className="text-slate-400 font-mono text-xs">{txResult.details.decoded_call.signature}</p>
                                            {txResult.details.decoded_call.params && txResult.details.decoded_call.params.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {txResult.details.decoded_call.params.slice(0, 3).map((param, idx) => (
                                                        <div key={idx} className="text-xs">
                                                            <span className="text-slate-400">{param.name}: </span>
                                                            <span className="text-white font-mono">{String(param.value).slice(0, 40)}...</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>

                                {/* Timing Flags */}
                                {txResult.timing_flags.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                            <span>Timing Analysis</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {txResult.timing_flags.map((flag, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                                    <span className="text-purple-300">{flag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Flags */}
                                {txResult.flags.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Detection Flags</h3>
                                        <div className="space-y-2">
                                            {txResult.flags.map((flag, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg">
                                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-200">{flag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Event Analysis */}
                                {txResult.event_analysis.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Event Analysis</h3>
                                        <div className="space-y-3">
                                            {txResult.event_analysis.map((event, idx) => (
                                                <div key={idx} className="p-4 bg-slate-900/50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-white">{event.event_type}</span>
                                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                                            {event.count} events
                                                        </span>
                                                    </div>
                                                    {event.risk_flags.length > 0 && (
                                                        <div className="space-y-1">
                                                            {event.risk_flags.map((flag, fIdx) => (
                                                                <p key={fIdx} className="text-sm text-orange-300">⚠️ {flag}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {
                                    txResult.entity_labels.length > 0 && (
                                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                            <h3 className="text-lg font-semibold text-white mb-4">Entity Labels</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {txResult.entity_labels.map((label, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }
                                {/* View on Etherscan */}
                                <div className="flex justify-end pt-4">
                                    <a
                                        href={`https://etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors"
                                    >
                                        <span>View on Etherscan</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Address Analysis Tab */}
                {activeTab === 'address' && (
                    <div className="space-y-6">
                        {/* Search Box */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Wallet Address
                            </label>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && analyzeAddress()}
                                    placeholder="0x... or ENS name"
                                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={analyzeAddress}
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Example: 0xcB1C1FdE09f811B294172696404e88E658659905
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Address Results */}
                        {addressResult && (
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1">Address Profile</h3>
                                            {addressResult.address_label && (
                                                <p className="text-blue-400 font-medium">{addressResult.address_label}</p>
                                            )}
                                            <p className="text-xs text-slate-400 font-mono mt-2 break-all">{addressResult.address}</p>

                                            {/* Status Badges */}
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {addressResult.sanctions_check && (
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-semibold">
                                                        🚨 SANCTIONED
                                                    </span>
                                                )}
                                                {addressResult.mixer_interaction && (
                                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs font-semibold">
                                                        🔄 MIXER USER
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg border-2 flex items-center space-x-2 ${getRiskColor(addressResult.risk_level)}`}>
                                            {getRiskIcon(addressResult.risk_level)}
                                            <span className="font-bold">{addressResult.risk_level}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Risk Score</p>
                                            <p className="text-xl font-bold text-white">{addressResult.risk_score}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Transactions</p>
                                            <p className="text-xl font-bold text-white">{addressResult.total_transactions}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Total Volume</p>
                                            <p className="text-lg font-bold text-white">{addressResult.behavior_summary.total_volume_eth} ETH</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Avg TX Value</p>
                                            <p className="text-lg font-bold text-white">{addressResult.behavior_summary.avg_tx_value_eth} ETH</p>
                                        </div>
                                    </div>

                                    {/* Time Patterns */}
                                    <div className="bg-slate-900/50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                            <h4 className="text-sm font-semibold text-white">Activity Patterns</h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-slate-400">Velocity:</span>
                                                <p className="text-white font-semibold">{addressResult.time_patterns.tx_per_hour} tx/hour</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Burst Activity:</span>
                                                <p className="text-white font-semibold">
                                                    {addressResult.time_patterns.burst_detected ? 'Detected' : 'None'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Suspicious Timing:</span>
                                                <p className="text-white font-semibold">
                                                    {addressResult.time_patterns.suspicious_timing ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">{addressResult.time_patterns.time_details}</p>
                                    </div>
                                </div>

                                {/* Risk Factors (NEW) */}
                                {addressResult.risk_factors.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
                                        <div className="space-y-2">
                                            {addressResult.risk_factors.map((factor, idx) => (
                                                <div key={idx} className="flex items-start space-x-2 text-sm p-2 bg-red-900/10 rounded">
                                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                                                    <span className="text-slate-300">{factor}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Entity Labels (NEW) */}
                                {addressResult.entity_labels.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Entity Interactions</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {addressResult.entity_labels.map((label, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Behavior Summary */}
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                    <h3 className="text-lg font-semibold text-white mb-4">Behavioral Analysis</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-sm text-slate-400 mb-2">High-Value Transactions</p>
                                            <p className="text-2xl font-bold text-white">{addressResult.behavior_summary.large_tx_count}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-sm text-slate-400 mb-2">Mixer Interactions</p>
                                            <p className="text-2xl font-bold text-white">{addressResult.behavior_summary.mixer_interaction_count}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-sm text-slate-400 mb-2">Unique Counterparties</p>
                                            <p className="text-2xl font-bold text-white">{addressResult.behavior_summary.unique_counterparties}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-sm text-slate-400 mb-2">Analysis Period</p>
                                            <p className="text-2xl font-bold text-white">{addressResult.behavior_summary.analysis_period_days} days</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Flags */}
                                {addressResult.flags.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Detection Flags</h3>
                                        <div className="space-y-2">
                                            {addressResult.flags.map((flag, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg">
                                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-200">{flag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Transactions */}
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                    <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {addressResult.recent_transactions.map((tx, idx) => (
                                            <div key={idx} className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-400 font-mono">{tx.hash.slice(0, 20)}...</p>
                                                        {tx.entity_interaction && (
                                                            <p className="text-sm text-blue-400 mt-1">→ {tx.entity_interaction}</p>
                                                        )}
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.risk_score >= 70 ? 'bg-red-500/20 text-red-300' :
                                                        tx.risk_score >= 40 ? 'bg-orange-500/20 text-orange-300' :
                                                            'bg-green-500/20 text-green-300'
                                                        }`}>
                                                        Risk: {tx.risk_score}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-white font-semibold">{tx.value}</span>
                                                    <span className="text-slate-400 text-xs">
                                                        {new Date(tx.block_timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                {tx.flags.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {tx.flags.map((flag, fIdx) => (
                                                            <span key={fIdx} className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                                                                {flag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Entity Interactions */}
                                {Object.keys(addressResult.behavior_summary.top_entities).length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Top Entity Interactions</h3>
                                        <div className="space-y-2">
                                            {Object.entries(addressResult.behavior_summary.top_entities).map(([entity, count], idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                                                    <span className="text-white font-medium">{entity}</span>
                                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                                        {count} transactions
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* High Risk Counterparties */}
                                {addressResult.high_risk_counterparties.length > 0 && (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                            <span>High-Risk Counterparties</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {addressResult.high_risk_counterparties.map((addr, idx) => (
                                                <div key={idx} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                                    <p className="text-red-300 font-mono text-xs break-all">{addr}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* View on Etherscan */}
                                <div className="flex justify-end pt-4">
                                    <a
                                        href={`https://etherscan.io/address/${address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors"
                                    >
                                        <span>View on Etherscan</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Graph Visualizations Tab */}
                {activeTab === 'graphs' && (
                    <div className="space-y-6">
                        {/* Graph Toggle Buttons */}
                        <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                            <span className="text-sm font-medium text-slate-300">Visualization:</span>
                            <button
                                onClick={() => setGraphView('wallet')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    graphView === 'wallet'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                💰 Wallet Attribution
                            </button>
                            <button
                                onClick={() => setGraphView('flow')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    graphView === 'flow'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                🔄 Transaction Flow
                            </button>
                        </div>

                        {/* Graph Display */}
                        {graphView === 'wallet' && <WalletAttributionGraph />}
                        {graphView === 'flow' && <TransactionFlowVisualization />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForensicsDashboard;
