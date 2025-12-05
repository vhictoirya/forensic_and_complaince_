import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { analyzeTransaction } from '../services/api';
import { Shield, AlertTriangle, CheckCircle, Clock, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import SearchBar from '../components/SearchBar';

const TransactionAnalysis = () => {
    const { hash } = useParams();
    const [searchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (hash) {
            fetchAnalysis(hash);
        }
    }, [hash]);

    const fetchAnalysis = async (txHash) => {
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeTransaction(txHash);
            setData(result);
        } catch (err) {
            setError('Failed to analyze transaction. Please check the hash and try again.');
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

    if (!hash) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <h2 className="text-3xl font-bold text-white">Transaction Analysis</h2>
                <p className="text-slate-400">Enter a transaction hash to analyze its risk profile.</p>
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
                        <FileText className="h-6 w-6 text-cyan-500" />
                        Transaction Analysis
                    </h2>
                    <p className="text-slate-400 font-mono text-sm mt-1">{hash}</p>
                </div>
                <div className="flex gap-2">
                    {/* Actions could go here */}
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
                    </div>

                    {/* Details Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-semibold text-white mb-6">Transaction Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Value</label>
                                    <div className="flex items-center gap-2 text-white font-medium">
                                        <DollarSign className="h-4 w-4 text-emerald-500" />
                                        {data.details.value}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Timestamp</label>
                                    <div className="flex items-center gap-2 text-white font-medium">
                                        <Clock className="h-4 w-4 text-cyan-500" />
                                        {new Date(data.details.block_timestamp).toLocaleString()}
                                    </div>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Flow</label>
                                    <div className="flex items-center gap-4 mt-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-slate-500 mb-1">From</div>
                                            <div className="text-sm font-mono text-emerald-400 truncate" title={data.details.from_address}>
                                                {data.details.from_address}
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-xs text-slate-500 mb-1">To</div>
                                            <div className="text-sm font-mono text-cyan-400 truncate" title={data.details.to_address}>
                                                {data.details.to_address}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Gas Used</label>
                                    <div className="text-slate-300 font-mono">{data.details.gas_used}</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Gas Price</label>
                                    <div className="text-slate-300 font-mono">{data.details.gas_price}</div>
                                </div>
                            </div>
                        </div>

                        {/* Token Transfers */}
                        {data.details.token_transfers && data.details.token_transfers.length > 0 && (
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                <h3 className="text-lg font-semibold text-white mb-4">Token Transfers</h3>
                                <div className="space-y-4">
                                    {data.details.token_transfers.map((transfer, idx) => (
                                        <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                                    {transfer.token_symbol}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{transfer.token_name}</div>
                                                    <div className="text-xs text-slate-500">{transfer.value_formatted} {transfer.token_symbol}</div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionAnalysis;
