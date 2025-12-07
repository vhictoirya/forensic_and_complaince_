import React, { useState, useRef, useEffect } from 'react';
import { Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const WalletAttributionGraph = () => {
    const [searchAddress, setSearchAddress] = useState('');
    const [nodeScale, setNodeScale] = useState(1);
    const canvasRef = useRef(null);

    // Mock data for wallet clustering - main user in center with wallet clusters
    const mockClusteringData = {
        mainUser: {
            id: 'user0',
            address: '0x1234...5678',
            label: 'Primary Wallet',
            value: 25.5,
            owner: 'John Doe',
            riskScore: 15
        },
        clusters: Array.from({ length: 15 }, (_, clusterIdx) => {
            const walletCount = Math.floor(Math.random() * 4) + 2; // 2-5 wallets per cluster
            return {
                clusterId: `cluster${clusterIdx + 1}`,
                owner: 'John Doe',
                riskScore: Math.floor(Math.random() * 85) + 15,
                wallets: Array.from({ length: walletCount }, (_, walletIdx) => ({
                    id: `w${clusterIdx * 5 + walletIdx}`,
                    address: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
                    label: `Wallet ${clusterIdx * 5 + walletIdx + 1}`,
                    value: (Math.random() * 30 + 2).toFixed(2)
                }))
            };
        })
    };

    const getRiskColor = (riskScore) => {
        if (riskScore >= 70) return '#ef4444'; // red
        if (riskScore >= 50) return '#f59e0b'; // orange
        if (riskScore >= 30) return '#eab308'; // yellow
        return '#10b981'; // green
    };

    const drawClusteringGraph = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const clusterDistance = 250 * nodeScale;

        // Draw main user in center
        const mainRadius = 40 * nodeScale;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mockClusteringData.mainUser.label, centerX, centerY - 8);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#e0e7ff';
        ctx.fillText(mockClusteringData.mainUser.address, centerX, centerY + 8);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#bfdbfe';
        ctx.fillText(`Owner: ${mockClusteringData.mainUser.owner}`, centerX, centerY + 22);

        // Draw clusters around main user
        mockClusteringData.clusters.forEach((cluster, clusterIdx) => {
            const clusterAngle = (clusterIdx / mockClusteringData.clusters.length) * Math.PI * 2;
            const clusterX = centerX + Math.cos(clusterAngle) * clusterDistance;
            const clusterY = centerY + Math.sin(clusterAngle) * clusterDistance;

            const clusterRiskColor = getRiskColor(cluster.riskScore);

            // Draw connection from main user to cluster
            ctx.strokeStyle = `rgba(59, 130, 246, 0.2)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(clusterX, clusterY);
            ctx.stroke();

            // Draw cluster center (owner circle)
            const clusterNodeRadius = 35 * nodeScale;
            ctx.shadowColor = clusterRiskColor;
            ctx.shadowBlur = 25;
            ctx.fillStyle = clusterRiskColor;
            ctx.beginPath();
            ctx.arc(clusterX, clusterY, clusterNodeRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(clusterX, clusterY, clusterNodeRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw cluster owner label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cluster.owner, clusterX, clusterY - 6);
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#f3f4f6';
            ctx.fillText(`Risk: ${cluster.riskScore}`, clusterX, clusterY + 6);

            // Draw individual wallets in cluster around the owner
            cluster.wallets.forEach((wallet, walletIdx) => {
                const walletAngle = (walletIdx / cluster.wallets.length) * Math.PI * 2 + (clusterAngle * 0.5);
                const walletDistance = 55 * nodeScale;
                const walletX = clusterX + Math.cos(walletAngle) * walletDistance;
                const walletY = clusterY + Math.sin(walletAngle) * walletDistance;

                // Draw connection from owner to wallet
                ctx.strokeStyle = `rgba(${parseInt(clusterRiskColor.slice(1, 3), 16)}, ${parseInt(clusterRiskColor.slice(3, 5), 16)}, ${parseInt(clusterRiskColor.slice(5, 7), 16)}, 0.3)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(clusterX, clusterY);
                ctx.lineTo(walletX, walletY);
                ctx.stroke();

                // Draw wallet node
                const walletRadius = 20 * nodeScale;
                ctx.fillStyle = clusterRiskColor;
                ctx.beginPath();
                ctx.arc(walletX, walletY, walletRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(walletX, walletY, walletRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Draw wallet label
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(wallet.label, walletX, walletY - 3);
                ctx.font = '8px monospace';
                ctx.fillStyle = '#e5e7eb';
                ctx.fillText(wallet.address.slice(0, 8) + '...', walletX, walletY + 5);
                ctx.font = '8px sans-serif';
                ctx.fillStyle = '#d1d5db';
                ctx.fillText(`${wallet.value} ETH`, walletX, walletY + 13);
            });
        });

        // Draw legend
        const legendY = height - 50;
        const riskLevels = [
            { label: 'Low Risk (0-30)', score: 15, color: '#10b981' },
            { label: 'Medium (30-50)', score: 40, color: '#eab308' },
            { label: 'High (50-70)', score: 60, color: '#f59e0b' },
            { label: 'Critical (70+)', score: 85, color: '#ef4444' },
        ];

        let legendX = 20;
        riskLevels.forEach((risk) => {
            ctx.fillStyle = risk.color;
            ctx.beginPath();
            ctx.arc(legendX, legendY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d1d5db';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(risk.label, legendX + 10, legendY + 2);

            legendX += 130;
        });
    };

    useEffect(() => {
        drawClusteringGraph();
    }, [nodeScale]);

    const handleZoomIn = () => setNodeScale(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setNodeScale(prev => Math.max(prev - 0.2, 0.5));
    const handleReset = () => setNodeScale(1);

    return (
        <div className="w-full bg-slate-900 rounded-xl border border-slate-700 p-6">
            <div className="mb-6 space-y-4">
                <h2 className="text-xl font-bold text-white">🔗 Address Clustering Analysis</h2>
                
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

                {/* Controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleZoomIn}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                        <span className="text-sm">Zoom In</span>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                        <span className="text-sm">Zoom Out</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        <Maximize2 className="w-4 h-4" />
                        <span className="text-sm">Reset</span>
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={1400}
                height={900}
                className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700"
            />

            {/* Cluster Summary */}
            <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-white">📊 Cluster Overview:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {mockClusteringData.clusters.map((cluster) => (
                        <div key={cluster.clusterId} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-sm font-semibold text-white">{cluster.owner}</p>
                                    <p className="text-xs text-slate-400">{cluster.wallets.length} wallets</p>
                                </div>
                                <div
                                    className="px-2 py-1 rounded text-xs font-bold text-white"
                                    style={{ backgroundColor: getRiskColor(cluster.riskScore) }}
                                >
                                    {cluster.riskScore}
                                </div>
                            </div>
                            <div className="space-y-1">
                                {cluster.wallets.slice(0, 2).map((wallet) => (
                                    <p key={wallet.id} className="text-xs text-slate-300 truncate">
                                        {wallet.label}: {wallet.value} ETH
                                    </p>
                                ))}
                                {cluster.wallets.length > 2 && (
                                    <p className="text-xs text-slate-500">+{cluster.wallets.length - 2} more</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold">🔄 Coming Soon: Real blockchain heuristics for cluster detection</p>
            </div>
        </div>
    );
};

export default WalletAttributionGraph;
