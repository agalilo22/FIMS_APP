// frontend/src/pages/Reports.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // <--- CHANGE IS HERE: Import autoTable explicitly
import { saveAs } from 'file-saver';

const Reports = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loadingClients, setLoadingClients] = useState(true);
    const [errorClients, setErrorClients] = useState(null);

    // Fetch clients for dropdown (stabilized with useCallback for useEffect)
    const fetchClientsForDropdown = useCallback(async () => {
        setLoadingClients(true);
        setErrorClients(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorClients('Authentication required to fetch clients.');
                return;
            }
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(res.data.clients);
        } catch (err) {
            console.error('Error fetching clients for dropdown:', err.response ? err.response.data : err.message);
            setErrorClients('Failed to load clients for reporting: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoadingClients(false);
        }
    }, []);

    useEffect(() => {
        fetchClientsForDropdown();
    }, [fetchClientsForDropdown]);

    const generatePdfReport = async () => {
        if (!clients.length) {
            alert('No client data available to generate PDF.');
            return;
        }

        const doc = new jsPDF(); // Initialize jsPDF

        doc.setFontSize(18);
        doc.text('FIMS Financial Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        let filteredData = clients;
        if (selectedClient) {
            filteredData = filteredData.filter(c => c._id === selectedClient);
        }
        if (startDate) {
            const start = new Date(startDate);
            filteredData = filteredData.filter(c => new Date(c.createdAt) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filteredData = filteredData.filter(c => new Date(c.createdAt) <= end);
        }

        if (filteredData.length === 0) {
            alert('No data matches the selected filters for PDF report. Please adjust your filters.');
            return;
        }

        const tableColumn = ["Client Name", "Email", "Revenue ($)", "Expenses ($)", "Net Profit ($)", "Created At"];
        const tableRows = [];

        filteredData.forEach(client => {
            const clientData = [
                client.name,
                client.email,
                client.financials?.revenue?.toLocaleString() || 'N/A',
                client.financials?.expenses?.toLocaleString() || 'N/A',
                client.financials?.netProfit?.toLocaleString() || 'N/A',
                new Date(client.createdAt).toLocaleDateString(),
            ];
            tableRows.push(clientData);
        });

        // The key change: Call autoTable as a function and pass the doc instance
        // This is a common pattern for jsPDF plugins if they don't auto-attach correctly
        autoTable(doc, { // <--- CHANGE IS HERE: Pass doc as the first argument
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [68, 114, 196], textColor: [255, 255, 255] },
            styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto', halign: 'right' },
                3: { cellWidth: 'auto', halign: 'right' },
                4: { cellWidth: 'auto', halign: 'right' },
                5: { cellWidth: 'auto' },
            }
        });

        doc.save('fims_financial_report.pdf');
    };

    const generateCsvReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = {
                clientId: selectedClient,
                startDate: startDate,
                endDate: endDate,
            };
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/reports/client-financials-csv`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params,
                responseType: 'blob',
            });

            saveAs(res.data, 'client_financials_report.csv');
            alert('CSV report generated and downloaded!');
        } catch (err) {
            console.error('Error generating CSV:', err.response ? err.response.data : err.message);
            alert('Failed to generate CSV report: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <div className="p-6 bg-gray-50 min-h-screen">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Custom Financial Reporting</h1>

                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="2xl font-semibold mb-4 text-gray-800">Report Filters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label htmlFor="client-select" className="block text-sm font-medium text-gray-700">Select Client</label>
                                <select
                                    id="client-select"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    disabled={loadingClients}
                                >
                                    <option value="">All Clients</option>
                                    {clients.map(client => (
                                        <option key={client._id} value={client._id}>{client.name}</option>
                                    ))}
                                </select>
                                {errorClients && <p className="text-red-500 text-xs mt-1">{errorClients}</p>}
                            </div>
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    id="start-date"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    id="end-date"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={generatePdfReport}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300"
                            >
                                Generate PDF Report
                            </button>
                            <button
                                onClick={generateCsvReport}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300"
                            >
                                Generate CSV Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;