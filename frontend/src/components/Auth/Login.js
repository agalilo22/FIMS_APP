// frontend/src/components/Auth/Login.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const responseGoogle = async (response) => {
        console.log('Google login response:', response);
        if (response.credential) {
            try {
                const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google`, {
                    id_token: response.credential,
                });
                console.log('Backend response:', res.data);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user info
                navigate('/dashboard'); // Redirect to dashboard on successful login
            } catch (error) {
                console.error('Login error:', error.response ? error.response.data : error.message);
                alert('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold mb-6">FIMS Login</h2>
                <GoogleLogin
                    onSuccess={responseGoogle}
                    onError={() => {
                        console.log('Login Failed');
                        alert('Google login failed.');
                    }}
                    useOneTap
                />
            </div>
        </div>
    );
};

export default Login;