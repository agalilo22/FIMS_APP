// frontend/src/components/Layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user ? user.role : '';

    return (
        <div className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
            <div className="text-2xl font-bold mb-8 text-center text-blue-400">FIMS Admin</div>
            <nav className="flex-1">
                <ul>
                    <li className="mb-2">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `block py-2 px-4 rounded-md transition duration-200 ${isActive ? 'bg-gray-700 text-blue-300' : 'hover:bg-gray-700'
                                }`
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="/clients"
                            className={({ isActive }) =>
                                `block py-2 px-4 rounded-md transition duration-200 ${isActive ? 'bg-gray-700 text-blue-300' : 'hover:bg-gray-700'
                                }`
                            }
                        >
                            Clients
                        </NavLink>
                    </li>
                    {/* Conditional rendering based on role for reports and analysis */}
                    {(userRole === 'admin' || userRole === 'analyst') && (
                        <li className="mb-2">
                            <NavLink
                                to="/reports"
                                className={({ isActive }) =>
                                    `block py-2 px-4 rounded-md transition duration-200 ${isActive ? 'bg-gray-700 text-blue-300' : 'hover:bg-gray-700'
                                    }`
                                }
                            >
                                Reports
                            </NavLink>
                        </li>
                    )}
                    {userRole === 'admin' && (
                        <li className="mb-2">
                            <NavLink
                                to="/admin/users" // A hypothetical route for admin to manage users/roles
                                className={({ isActive }) =>
                                    `block py-2 px-4 rounded-md transition duration-200 ${isActive ? 'bg-gray-700 text-blue-300' : 'hover:bg-gray-700'
                                    }`
                                }
                            >
                                User Management
                            </NavLink>
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;