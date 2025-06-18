// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/summary`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSummary(res.data.summary);

                // Format monthly data for Recharts
                const formattedMonthlyData = res.data.monthlyData.map(item => ({
                    // FIX: Remove unnecessary escape characters and span tags
                    name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                    Revenue: item.monthlyRevenue,
                    Expenses: item.monthlyExpenses,
                    'Net Profit': item.monthlyNetProfit,
                    'Clients Added': item.clientCount,
                }));
                setMonthlyData(formattedMonthlyData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err.response ? err.response.data : err.message);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6"><Navbar /><p className="text-center mt-20">Loading dashboard data...</p></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6"><Navbar /><p className="text-center mt-20 text-red-500">{error}</p></div>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <div className="p-6 bg-gray-50 min-h-screen">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Financial Dashboard</h1>

                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Revenue</h3>
                                <p className="text-4xl font-bold text-green-600">${summary.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Expenses</h3>
                                <p className="text-4xl font-bold text-red-600">${summary.totalExpenses.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Net Profit</h3>
                                <p className="text-4xl font-bold text-blue-600">${summary.totalNetProfit.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Financial Trends</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="Expenses" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="Net Profit" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Client Additions</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Clients Added" fill="#4299e1" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;