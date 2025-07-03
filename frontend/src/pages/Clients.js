// frontend/src/pages/Clients.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import ClientFormModal from '../components/Client/ClientFormModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [minRevenueFilter, setMinRevenueFilter] = useState('');
    const [maxRevenueFilter, setMaxRevenueFilter] = useState('');
    const [minRevenueFilterError, setMinRevenueFilterError] = useState(''); // New state for filter errors
    const [maxRevenueFilterError, setMaxRevenueFilterError] = useState(''); // New state for filter errors
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalClients, setTotalClients] = useState(0);

    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user ? user.role : '';
    const navigate = useNavigate();

    // Helper for numeric filter input validation
    const validateFilterInput = (value, setErrorState) => {
        if (value === '') {
            setErrorState(''); // Clear error if input is empty
            return true;
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
            setErrorState('Invalid number.');
            return false;
        }
        // Check for excessively large numbers or negative values
        if (!Number.isFinite(numValue) || numValue > Number.MAX_SAFE_INTEGER || numValue < 0) {
            setErrorState('Too large/negative.');
            return false;
        }
        setErrorState(''); // Clear error if valid
        return true;
    };

    const fetchClients = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        // Frontend validation for filters before fetching
        const isValidMinRevenue = validateFilterInput(minRevenueFilter, setMinRevenueFilterError);
        const isValidMaxRevenue = validateFilterInput(maxRevenueFilter, setMaxRevenueFilterError);

        if (!isValidMinRevenue || !isValidMaxRevenue) {
            setLoading(false);
            setError("Please correct the revenue filter values.");
            return; // Stop execution if validation fails
        }

        try {
            const token = localStorage.getItem('token');
            const params = {
                page,
                limit: 10,
                search: searchQuery,
                minRevenue: minRevenueFilter, // Send as string, backend will parse/validate
                maxRevenue: maxRevenueFilter, // Send as string, backend will parse/validate
            };
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setClients(res.data.clients);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.currentPage); // Make sure this state update doesn't cause extra fetches
            setTotalClients(res.data.totalClients);
        } catch (err) {
            console.error('Error fetching clients:', err.response ? err.response.data : err.message);
            setError('Failed to fetch clients. ' + (err.response?.data?.message || err.message)); // Display backend error for filters
        } finally {
            setLoading(false);
        }
    }, [searchQuery, minRevenueFilter, maxRevenueFilter]); // Dependencies for useCallback are the filters

    useEffect(() => {
        // Debounce filter changes to avoid excessive API calls
        const handler = setTimeout(() => {
            // When filters change, always reset to page 1
            setCurrentPage(1); // Setting currentPage to 1 will trigger the other useEffect
        }, 500); // Debounce for 500ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, minRevenueFilter, maxRevenueFilter]); // Only filters are dependencies here

    useEffect(() => {
        // This useEffect handles pagination clicks and initial load
        // It will be triggered whenever currentPage changes (including when it's set to 1 by the filter useEffect)
        fetchClients(currentPage);
    }, [fetchClients, currentPage]); // fetchClients is stable due to useCallback, currentPage changes on pagination

    const handleAddClient = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDeleteClient = async (clientId) => {
        if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/clients/${clientId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Client deleted successfully!');
                fetchClients(currentPage);
            } catch (err) {
                console.error('Error deleting client:', err.response ? err.response.data : err.message);
                alert('Failed to delete client: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleClientSaved = () => {
        setIsModalOpen(false);
        fetchClients(currentPage);
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <div className="p-6 bg-gray-50 min-h-screen">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Management</h1>

                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div>
                                <input
                                    type="text" // Changed from type="number"
                                    placeholder="Min Revenue"
                                    className={`p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 ${minRevenueFilterError ? 'border-red-500' : 'border-gray-300'}`}
                                    value={minRevenueFilter}
                                    onChange={(e) => {
                                        setMinRevenueFilter(e.target.value);
                                        validateFilterInput(e.target.value, setMinRevenueFilterError);
                                    }}
                                />
                                {minRevenueFilterError && <p className="text-red-500 text-xs italic mt-1">{minRevenueFilterError}</p>}
                            </div>
                            <div>
                                <input
                                    type="text" // Changed from type="number"
                                    placeholder="Max Revenue"
                                    className={`p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 ${maxRevenueFilterError ? 'border-red-500' : 'border-gray-300'}`}
                                    value={maxRevenueFilter}
                                    onChange={(e) => {
                                        setMaxRevenueFilter(e.target.value);
                                        validateFilterInput(e.target.value, setMaxRevenueFilterError);
                                    }}
                                />
                                {maxRevenueFilterError && <p className="text-red-500 text-xs italic mt-1">{maxRevenueFilterError}</p>}
                            </div>
                        </div>
                        {(userRole === 'admin' || userRole === 'analyst') && (
                            <button
                                onClick={handleAddClient}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 w-full md:w-auto"
                            >
                                Add New Client
                            </button>
                        )}
                    </div>

                    {loading && <p className="text-center text-gray-600">Loading clients...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && clients.length === 0 && !error && (
                        <p className="text-center text-gray-600">No clients found.</p>
                    )}

                    {!loading && clients.length > 0 && (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clients.map((client) => (
                                        <tr key={client._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.financials.revenue.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.financials.expenses.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.financials.netProfit.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/clients/${client._id}`)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    View Details
                                                </button>
                                                {(userRole === 'admin' || userRole === 'analyst') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClient(client)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                    </>
                                                )}
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteClient(client._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {userRole === 'viewer' && !['admin', 'analyst'].includes(userRole) && (
                                                    <span className="text-gray-500">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * 10, totalClients)}</span> of{' '}
                                    <span className="font-medium">{totalClients}</span> results
                                </p>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <ClientFormModal
                    client={editingClient}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleClientSaved}
                />
            )}
        </div>
    );
};

export default Clients;