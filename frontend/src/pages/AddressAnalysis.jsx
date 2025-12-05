import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analyzeAddress } from '../services/api';
import { Shield, AlertTriangle, CheckCircle, Wallet, ArrowRight, Users, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import SearchBar from '../components/SearchBar';

const AddressAnalysis = () => {
    const { address } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (address) {
            fetchAnalysis(address);
        }
    }, [address]);

    const fetchAnalysis = async (addr) => {
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeAddress(addr);
            setData(result);
        } catch (err) {
            setError('Failed to analyze address. Please check the address and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'LOW': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    if (!address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <h2 className="text-3xl font-bold text-white">Address Analysis</h2>
                <p className="text-slate-400">Enter a wallet address to analyze its risk profile and history.</p>
                <SearchBar className="max-w-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-emerald-500" />
                        Address Analysis
                    </h2>
                    <p className="text-slate-400 font-mono text-sm mt-1">{address}</p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Risk Score Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className={clsx('p-6 rounded-2xl border', getRiskColor(data.risk_level))}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Risk Score</h3>
                                <Shield className="h-6 w-6" />
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-bold">{data.risk_score}</span>
                                <span className="text-xl mb-1">/ 100</span>
                            </div>
                            <div className="text-sm font-medium px-3 py-1 rounded-full inline-block bg-black/20">
                                {data.risk_level} RISK
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-semibold text-white mb-4">Risk Flags</h3>
                            <div className="space-y-3">
                                {data.flags.map((flag, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm text-slate-300">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span>{flag}</span>
                                    </div>
                                ))}
                                {data.flags.length === 0 && (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>No risk flags detected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {data.entity_labels.length > 0 && (
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                <h3 className="text-lg font-semibold text-white mb-4">Entity Labels</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.entity_labels.map((label, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm border border-slate-700">
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Txns</div>
                                <div className="text-2xl font-bold text-white">{data.total_transactions}</div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Mixer Interactions</div>
                                <div className={clsx("text-2xl font-bold", data.mixer_interaction ? "text-red-400" : "text-emerald-400")}>
                                    {data.mixer_interaction ? "Yes" : "No"}
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Sanctions</div>
                                <div className={clsx("text-2xl font-bold", data.sanctions_check ? "text-red-500" : "text-emerald-400")}>
                                    {data.sanctions_check ? "Hit" : "Clear"}
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">High Risk Peers</div>
                                <div className="text-2xl font-bold text-amber-400">{data.high_risk_counterparties.length}</div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-cyan-500" />
                                Recent Transactions
                            </h3>
                            <div className="space-y-4">
                                {data.recent_transactions.map((tx, idx) => (
                                    <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 group hover:border-slate-700 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs text-slate-500 font-mono">{new Date(tx.block_timestamp).toLocaleString()}</div>
                                            <div className={clsx("text-xs font-bold px-2 py-0.5 rounded",
                                                tx.risk_score > 50 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                                            )}>
                                                Risk: {tx.risk_score}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-500">From:</span>
                                                    <span className="font-mono text-slate-300 truncate">{tx.from_address}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm mt-1">
                                                    <span className="text-slate-500">To:</span>
                                                    <span className="font-mono text-slate-300 truncate">{tx.to_address}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-medium">{tx.value}</div>
                                                <div className="text-xs text-slate-500 mt-1">{tx.flags[0]}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressAnalysis;
