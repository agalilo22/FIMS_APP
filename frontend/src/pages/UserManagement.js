// frontend/src/pages/UserManagement.js
import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';

const UserManagement = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6">
                <Navbar />
                <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
                <p className="text-gray-700">This section will allow administrators to manage user roles and access.</p>
                {/* You'll add your user listing, role editing, and deletion UI here */}
            </div>
        </div>
    );
};

export default UserManagement;