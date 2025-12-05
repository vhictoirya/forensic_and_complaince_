import axios from 'axios';

const API_URL = 'http://localhost:8007/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyzeTransaction = async (txHash, chain = 'eth') => {
    try {
        const response = await api.get(`/analyze-transaction/${txHash}`, {
            params: { chain },
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing transaction:', error);
        throw error;
    }
};

export const analyzeAddress = async (address, chain = 'eth', limit = 10) => {
    try {
        const response = await api.get(`/analyze-address/${address}`, {
            params: { chain, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing address:', error);
        throw error;
    }
};

export default api;
