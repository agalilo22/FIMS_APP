// frontend/src/components/Layout/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="text-xl font-bold text-gray-800">FIMS</div>
            <div className="flex items-center space-x-4">
                {user && (
                    <span className="text-gray-700">
                        Hello, <span className="font-semibold">{user.name || user.email}</span> (<span className="capitalize">{user.role}</span>)
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;