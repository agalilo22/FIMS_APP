// frontend/src/components/Client/ClientFormModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientFormModal = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        financials: {
            revenue: '', // Change to empty string to allow better initial input for numbers
            expenses: '', // Change to empty string
        },
        notes: '',
        tags: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                financials: {
                    revenue: client.financials?.revenue !== undefined ? client.financials.revenue : '',
                    expenses: client.financials?.expenses !== undefined ? client.financials.expenses : '',
                },
                notes: client.notes || '',
                tags: client.tags || [],
            });
        } else {
            // Reset form for new client
            setFormData({
                name: '', email: '', phone: '',
                financials: { revenue: '', expenses: '' }, // Reset to empty strings
                notes: '', tags: []
            });
        }
        setError(null); // Clear error when client prop changes
    }, [client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError(null); // Clear previous errors on change

        if (name.includes('financials.')) {
            const financialField = name.split('.')[1];
            // --- NEW: Numeric Input Validation ---
            let parsedValue = value === '' ? '' : parseFloat(value);

            // Check for valid number and prevent excessively large numbers (larger than JS max safe integer)
            if (value !== '' && (isNaN(parsedValue) || !Number.isFinite(parsedValue) || parsedValue > Number.MAX_SAFE_INTEGER || parsedValue < -Number.MAX_SAFE_INTEGER)) {
                // Optionally, you can set a specific error here, or let the validation on submit catch it
                setFormData(prev => ({ // Keep the current invalid input to show to the user
                    ...prev,
                    financials: {
                        ...prev.financials,
                        [financialField]: value, // Keep the raw string value if invalid
                    },
                }));
                setError(`Please enter a valid number for ${financialField}. Numbers cannot be excessively large or small.`);
                return; // Stop processing if invalid
            }
            // --- END NEW ---
            setFormData(prev => ({
                ...prev,
                financials: {
                    ...prev.financials,
                    [financialField]: parsedValue, // Use parsedValue, which could be '' or a number
                },
            }));
        } else if (name === 'tags') {
            setFormData(prev => ({
                ...prev,
                tags: value.split(',').map(tag => tag.trim()).filter(tag => tag),
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- NEW: Validation function before submission ---
    const validateFormData = () => {
        const newErrors = [];

        // Email format (basic check, backend will do more)
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.push("Please enter a valid email address.");
        }

        // Numeric values check
        const { revenue, expenses } = formData.financials;

        // Check if they are actually numbers and within a reasonable range
        if (typeof revenue === 'string' && revenue.trim() === '') {
            // If it's an empty string, convert to 0 for backend submission, but it's valid input
            formData.financials.revenue = 0;
        } else if (isNaN(revenue) || !Number.isFinite(revenue) || revenue < 0 || revenue > Number.MAX_SAFE_INTEGER) {
            newErrors.push("Revenue must be a valid non-negative number and not excessively large.");
        }

        if (typeof expenses === 'string' && expenses.trim() === '') {
            // If it's an empty string, convert to 0 for backend submission, but it's valid input
            formData.financials.expenses = 0;
        } else if (isNaN(expenses) || !Number.isFinite(expenses) || expenses < 0 || expenses > Number.MAX_SAFE_INTEGER) {
            newErrors.push("Expenses must be a valid non-negative number and not excessively large.");
        }

        if (newErrors.length > 0) {
            setError(newErrors.join(' ')); // Join multiple errors for display
            return false;
        }
        return true;
    };
    // --- END NEW ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // --- NEW: Run frontend validation ---
        if (!validateFormData()) {
            return; // Stop if validation fails
        }
        // --- END NEW ---

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (client) {
                // Update existing client
                await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/clients/${client._id}`, formData, config);
                alert('Client updated successfully!');
            } else {
                // Create new client
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/clients`, formData, config);
                alert('Client created successfully!');
            }
            onSave(); // Notify parent to refresh list and close modal
        } catch (err) {
            console.error('Error saving client:', err.response ? err.response.data : err.message);
            // --- UPDATED: More specific error message for duplicate email ---
            if (err.response && err.response.status === 409) { // 409 Conflict for duplicate
                setError(err.response.data.message); // This will be "Client with this email already exists."
            } else {
                setError('Failed to save client: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-full max-w-lg mx-auto rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                    {client ? 'Edit Client' : 'Add New Client'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">Revenue ($)</label>
                            <input
                                type="number"
                                id="revenue"
                                name="financials.revenue"
                                value={formData.financials.revenue}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                            // --- NEW: Remove up/down adjusters (spinners) ---
                            // This is a browser-specific styling, often done with CSS
                            // For Tailwind CSS, you might need a utility class like 'appearance-none' or custom CSS.
                            // Adding a custom class 'no-spinners' and defining it in your global CSS.
                            // For now, the 'type="number"' remains but its behavior is modified by CSS.
                            // If you want to strictly prevent arrow keys, you'd need more JS, but removing spinners is the common request.
                            />
                        </div>
                        <div>
                            <label htmlFor="expenses" className="block text-sm font-medium text-gray-700">Expenses ($)</label>
                            <input
                                type="number"
                                id="expenses"
                                name="financials.expenses"
                                value={formData.financials.expenses}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                            // --- NEW: Remove up/down adjusters (spinners) ---
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags.join(', ')}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientFormModal;