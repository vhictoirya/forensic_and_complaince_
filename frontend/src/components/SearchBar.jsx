import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const SearchBar = ({ className }) => {
    const [input, setInput] = useState('');
    const [type, setType] = useState('transaction'); // 'transaction' or 'address'
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (type === 'transaction') {
            navigate(`/transaction/${input}`);
        } else {
            navigate(`/address/${input}`);
        }
    };

    return (
        <div className={clsx('w-full max-w-3xl mx-auto', className)}>
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative flex bg-slate-900 rounded-lg p-2 border border-slate-700 shadow-xl">
                    <div className="flex-shrink-0">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="h-full py-2 pl-4 pr-8 bg-slate-800 text-slate-200 rounded-md border-transparent focus:border-emerald-500 focus:ring-0 text-sm font-medium outline-none appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="transaction">Transaction</option>
                            <option value="address">Address</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={type === 'transaction' ? "Enter transaction hash (0x...)" : "Enter wallet address (0x...)"}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-4 py-2 w-full outline-none"
                    />

                    <button
                        type="submit"
                        className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
                    >
                        <span>Analyze</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </form>

            <div className="mt-4 flex justify-center space-x-4 text-sm text-slate-500">
                <span>Try:</span>
                <button
                    onClick={() => {
                        setType('transaction');
                        setInput('0x...'); // Add a real example later if needed
                    }}
                    className="hover:text-emerald-400 transition-colors"
                >
                    Example Transaction
                </button>
                <span>•</span>
                <button
                    onClick={() => {
                        setType('address');
                        setInput('0x...'); // Add a real example later if needed
                    }}
                    className="hover:text-emerald-400 transition-colors"
                >
                    Example Address
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
