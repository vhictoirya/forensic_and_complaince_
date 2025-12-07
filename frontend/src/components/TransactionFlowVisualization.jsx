import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingDown, TrendingUp, Zap } from 'lucide-react';

const TransactionFlowVisualization = () => {
    const [searchAddress, setSearchAddress] = useState('');
    const [animationPhase, setAnimationPhase] = useState(0);
    const canvasRef = useRef(null);

    // Mock transaction flow data
    const mockTransactionData = {
        source: { address: '0x1234...5678', label: 'User', type: 'user', color: '#3b82f6' },
        transactions: [
            { id: 'tx1', from: 'step0', to: 'step1', amount: 2.5, type: 'send', token: 'ETH' },
            { id: 'tx2', from: 'step1', to: 'step2', amount: 2.5, type: 'swap', token: 'USDC' },
            { id: 'tx3', from: 'step2', to: 'step3', amount: 2400, type: 'stake', token: 'USDC' },
            { id: 'tx4', from: 'step1', to: 'step2', amount: 0.1, type: 'fee', token: 'ETH' },
        ],
        steps: [
            { id: 'step0', address: '0x1234...5678', label: 'Wallet', type: 'user' },
            { id: 'step1', address: '0xabcd...ef01', label: 'Uniswap V3', type: 'dex' },
            { id: 'step2', address: '0x2345...6789', label: 'AAVE', type: 'protocol' },
            { id: 'step3', address: '0xbcde...f012', label: 'Staking Pool', type: 'contract' },
        ]
    };

    const getTypeColor = (type) => {
        const colors = {
            user: '#3b82f6',
            dex: '#8b5cf6',
            protocol: '#10b981',
            contract: '#f59e0b'
        };
        return colors[type] || '#6b7280';
    };

    const getTransactionColor = (type) => {
        const colors = {
            send: '#3b82f6',
            swap: '#f59e0b',
            stake: '#10b981',
            fee: '#ef4444'
        };
        return colors[type] || '#6b7280';
    };

    const drawFlowDiagram = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const stepWidth = width / mockTransactionData.steps.length;
        const nodeRadius = 25;
        const centerY = height / 2;

        // Draw connection lines between steps
        mockTransactionData.steps.forEach((step, idx) => {
            if (idx < mockTransactionData.steps.length - 1) {
                const x1 = (idx + 0.5) * stepWidth;
                const x2 = (idx + 1.5) * stepWidth;

                // Draw main connection
                ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1 + nodeRadius, centerY);
                ctx.lineTo(x2 - nodeRadius, centerY);
                ctx.stroke();

                // Draw arrow
                ctx.fillStyle = 'rgba(107, 114, 128, 0.5)';
                ctx.beginPath();
                ctx.moveTo(x2 - nodeRadius, centerY);
                ctx.lineTo(x2 - 15, centerY - 5);
                ctx.lineTo(x2 - 15, centerY + 5);
                ctx.fill();
            }
        });

        // Draw nodes
        mockTransactionData.steps.forEach((step, idx) => {
            const x = (idx + 0.5) * stepWidth;
            const y = centerY;

            // Draw glow effect
            ctx.shadowColor = getTypeColor(step.type);
            ctx.shadowBlur = 20;
            ctx.fillStyle = getTypeColor(step.type);
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'transparent';

            // Draw border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(step.label, x, y);

            // Draw step number below
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#d1d5db';
            ctx.fillText(`Step ${idx + 1}`, x, y + 35);

            // Draw address below that
            ctx.font = '9px monospace';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(step.address, x, y + 50);
        });

        // Draw animated transaction flows
        mockTransactionData.transactions.forEach((tx, txIdx) => {
            const fromStep = mockTransactionData.steps.findIndex(s => s.id === tx.from);
            const toStep = mockTransactionData.steps.findIndex(s => s.id === tx.to);

            if (fromStep >= 0 && toStep >= 0) {
                const fromX = (fromStep + 0.5) * stepWidth;
                const toX = (toStep + 0.5) * stepWidth;

                // Stagger animations
                const progress = (animationPhase + txIdx * 0.15) % 1;

                if (progress < 0.8) {
                    const currentX = fromX + (toX - fromX) * progress;

                    // Draw particle
                    ctx.fillStyle = getTransactionColor(tx.type);
                    ctx.shadowColor = getTransactionColor(tx.type);
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(currentX, centerY - 15, 6, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw label
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = '#e5e7eb';
                    ctx.font = '9px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${tx.amount} ${tx.token}`, currentX, centerY - 30);
                }
            }
        });

        // Draw legend
        const legendY = height - 40;
        const legendItems = [
            { label: 'Send', type: 'send' },
            { label: 'Swap', type: 'swap' },
            { label: 'Stake', type: 'stake' },
            { label: 'Fee', type: 'fee' }
        ];

        let legendX = 20;
        legendItems.forEach((item) => {
            ctx.fillStyle = getTransactionColor(item.type);
            ctx.beginPath();
            ctx.arc(legendX, legendY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d1d5db';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 10, legendY + 3);

            legendX += 100;
        });
    };

    useEffect(() => {
        drawFlowDiagram();

        const interval = setInterval(() => {
            setAnimationPhase(prev => (prev + 0.02) % 1);
        }, 50);

        return () => clearInterval(interval);
    }, [animationPhase]);

    return (
        <div className="w-full bg-slate-900 rounded-xl border border-slate-700 p-6">
            <div className="mb-6 space-y-4">
                <h2 className="text-xl font-bold text-white">🔄 Transaction Flow Graph</h2>
                
                {/* Search Bar */}
                <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700 focus-within:border-blue-400">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search wallet address (e.g., 0x1234...)"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                    />
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center space-x-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-slate-400">Total Flow</span>
                        </div>
                        <p className="text-lg font-bold text-white">2400 USDC</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center space-x-2 mb-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-slate-400">Transactions</span>
                        </div>
                        <p className="text-lg font-bold text-white">4 Txs</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center space-x-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-slate-400">Fees</span>
                        </div>
                        <p className="text-lg font-bold text-white">0.1 ETH</p>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700"
            />

            {/* Step Details */}
            <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-white">Flow Steps:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockTransactionData.steps.map((step, idx) => (
                        <div key={step.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getTypeColor(step.type) }}
                                />
                                <span className="text-sm font-semibold text-white">{step.label}</span>
                                <span className="text-xs text-slate-500">{step.address}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold">⏳ Coming Soon: Real transaction data integration and advanced path analysis</p>
            </div>
        </div>
    );
};

export default TransactionFlowVisualization;
