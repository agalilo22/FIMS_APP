// frontend/src/pages/ClientDetail.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // Get user info from localStorage (ensure this is consistent with how you store it after login)
    // It's safer to parse this once and use it.
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userRole = user.role || ''; // Default to empty string if no user or role

    // Wrap fetchClientDetails in useCallback to stabilize it for useEffect's dependency array
    const fetchClientDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token, redirect to login or show error
                navigate('/login');
                return;
            }
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients/${id}`, { // <-- FIX IS HERE!
                headers: { Authorization: `Bearer ${token}` },
            });
            setClient(res.data);
        } catch (err) {
            console.error('Error fetching client details:', err.response ? err.response.data : err.message);
            setError('Failed to load client details. You might not have access or the client does not exist.');
            // Optionally navigate back if client not found or unauthorized
            if (err.response && (err.response.status === 404 || err.response.status === 403)) {
                navigate('/clients'); // Go back to clients list
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]); // Add id and navigate to useCallback dependencies

    useEffect(() => {
        // Only fetch if an ID is present in the URL
        if (id) {
            fetchClientDetails();
        } else {
            setLoading(false); // If no ID, no loading, just show not found
            setError('No client ID provided.');
        }
    }, [id, fetchClientDetails]); // Now fetchClientDetails is stable thanks to useCallback

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('clientId', id);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('File uploaded successfully!');
            setSelectedFile(null); // Clear selected file
            fetchClientDetails(); // Refresh client details to show new file
        } catch (err) {
            console.error('File upload error:', err.response ? err.response.data : err.message);
            setUploadError('Failed to upload file: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleFileDownload = async (fileUrl) => {
        try {
            const token = localStorage.getItem('token');
            // Get a pre-signed URL for secure download
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/files/signed-url`, {
                params: { clientId: id, fileUrl }, // Pass fileUrl in params
                headers: { Authorization: `Bearer ${token}` },
            });
            window.open(res.data.signedUrl, '_blank'); // Open in new tab for download
        } catch (err) {
            console.error('Error downloading file:', err.response ? err.response.data : err.message);
            alert('Failed to download file: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteFile = async (fileUrl) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/files/delete`, { clientId: id, fileUrl }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('File deleted successfully!');
            fetchClientDetails(); // Refresh client details
        } catch (err) {
            console.error('Error deleting file:', err.response ? err.response.data : err.message);
            alert('Failed to delete file: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6"><Navbar /><p className="text-center mt-20">Loading client details...</p></div>
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

    if (!client) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6"><Navbar /><p className="text-center mt-20">Client not found.</p></div>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <div className="p-6 bg-gray-50 min-h-screen">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">{client.name}'s Profile</h1>

                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Client Information</h2>
                        <p className="mb-2"><span className="font-medium">Email:</span> {client.email}</p>
                        <p className="mb-2"><span className="font-medium">Phone:</span> {client.phone || 'N/A'}</p>
                        <p className="mb-2"><span className="font-medium">Notes:</span> {client.notes || 'N/A'}</p>
                        <p className="mb-2"><span className="font-medium">Tags:</span> {client.tags && client.tags.length > 0 ? client.tags.join(', ') : 'N/A'}</p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Financials</h3>
                        {/* Ensure client.financials exists before accessing its properties */}
                        {client.financials ? (
                            <>
                                <p className="mb-1"><span className="font-medium">Revenue:</span> ${client.financials.revenue?.toLocaleString()}</p>
                                <p className="mb-1"><span className="font-medium">Expenses:</span> ${client.financials.expenses?.toLocaleString()}</p>
                                <p className="mb-1"><span className="font-medium">Net Profit:</span> ${client.financials.netProfit?.toLocaleString()}</p>
                            </>
                        ) : (
                            <p className="mb-1 text-gray-600">Financial data not available.</p>
                        )}
                    </div>

                    {/* File Upload Section */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Financial Documents</h2>

                        {(userRole === 'admin' || userRole === 'analyst') && (
                            <div className="mb-6 border p-4 rounded-md bg-blue-50 border-blue-200">
                                <h3 className="text-lg font-medium text-blue-800 mb-3">Upload New Document</h3>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                             file:mr-4 file:py-2 file:px-4
                                             file:rounded-full file:border-0
                                             file:text-sm file:font-semibold
                                             file:bg-blue-50 file:text-blue-700
                                             hover:file:bg-blue-100"
                                />
                                {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                                <button
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile || uploading}
                                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        )}

                        {client.fileUrls && client.fileUrls.length > 0 ? (
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Uploaded Documents</h3>
                                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                                    {client.fileUrls.map((file, index) => (
                                        <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                            {/* Display file name (assuming file object has fileName property) */}
                                            <span className="text-gray-700 font-medium">{file.fileName || file.url.split('/').pop()}</span>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleFileDownload(file.url)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                                >
                                                    Download
                                                </button>
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteFile(file.url)}
                                                        className="text-red-600 hover:text-red-900 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-gray-600">No documents uploaded for this client yet.</p>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/clients')}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md mt-6"
                    >
                        Back to Clients
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;