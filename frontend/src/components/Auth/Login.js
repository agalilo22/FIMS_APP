// frontend/src/components/Auth/Login.js
import React, { useState } from 'react'; // Import useState
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for decoding ID token

const Login = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages

    // Define your allowed domain
    const ALLOWED_DOMAIN = 'mmdc.mcl.edu.ph'; // Replace with your actual registered domain

    const responseGoogle = async (response) => {
        setErrorMessage(''); // Clear previous errors
        console.log('Google login response:', response);

        if (response.credential) {
            try {
                const decodedToken = jwtDecode(response.credential);
                console.log('Decoded Google Token:', decodedToken);

                // Extract domain from email
                const userEmail = decodedToken.email;
                const userDomain = userEmail.split('@')[1];

                if (userDomain !== ALLOWED_DOMAIN) {
                    setErrorMessage("Please sign in with the registered domain Google Account (e.g., your@mmdc.mcl.edu.ph).");
                    return; // Stop the login process
                }

                // If domain is valid, proceed with backend authentication
                const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google`, {
                    id_token: response.credential,
                });
                console.log('Backend response:', res.data);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user info
                navigate('/dashboard'); // Redirect to dashboard on successful login

            } catch (error) {
                console.error('Login error:', error.response ? error.response.data : error.message);
                if (error.response && error.response.data && error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage('Login failed. Please try again.');
                }
            }
        } else {
            setErrorMessage('Google login failed: No credential received.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-4 animate-fade-in-down">
                    Welcome to Finmark Information Management System
                </h1>
                <p className="text-gray-600 mb-8 text-lg animate-fade-in-up">
                    Sign in to manage your financial data.
                </p>

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate-shake" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{errorMessage}</span>
                    </div>
                )}

                <div className="flex justify-center items-center">
                    <GoogleLogin
                        onSuccess={responseGoogle}
                        onError={() => {
                            console.log('Login Failed');
                            setErrorMessage('Google login failed. Please ensure you have an active internet connection.');
                        }}
                        // If you only want to allow one-tap, keep useOneTap.
                        // If you want the full popup experience, you might remove useOneTap or provide a button.
                        // For a better UX, it's good to have both if possible.
                        // For explicit button click, you'd integrate with Google's custom button rendering.
                        // For simplicity, we'll keep the default rendering but note this.
                        useOneTap
                    />
                </div>

                <p className="text-sm text-gray-400 mt-8">
                    &copy; {new Date().getFullYear()} Finmark IMS. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;