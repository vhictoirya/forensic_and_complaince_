import React from 'react';
import SearchBar from '../components/SearchBar';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-16 py-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                        Blockchain Forensics
                    </span>
                    <br />
                    <span className="text-white">
                        & Compliance Platform
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-slate-400">
                    Advanced transaction monitoring, risk analysis, and compliance checks for the Ethereum blockchain.
                </p>

                <div className="pt-8">
                    <SearchBar />
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Risk Analysis</h3>
                    <p className="text-slate-400">
                        Real-time risk scoring for transactions and addresses based on historical data and known patterns.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sanctions Screening</h3>
                    <p className="text-slate-400">
                        Instant checks against OFAC sanctions lists, known mixers, and high-risk entities.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Activity className="h-6 w-6 text-cyan-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Transaction Tracing</h3>
                    <p className="text-slate-400">
                        Deep dive into transaction flows, token transfers, and smart contract interactions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
