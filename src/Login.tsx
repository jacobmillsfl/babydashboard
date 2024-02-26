import React, { useEffect, useState } from 'react';
import ApiClient from './Utils/ApiClient';
import LocalStorageManager from './Utils/LocalStorageManager';
import { useAppContext } from './Contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [status, setStatus] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    const context = useAppContext();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        ApiClient.getInstance()
            .verifyPassword(username, password)
            .then((verifyPasswordResponse) => {
                if (!verifyPasswordResponse) {
                    console.error('Failed to verify password.');
                    return;
                }

                console.log("Verify Password Response", verifyPasswordResponse);

                ApiClient.getInstance()
                    .getFamilyKey(verifyPasswordResponse.idToken)
                    .then((key: string) => {
                        // Update local storage
                        const localStorageManager = LocalStorageManager.getInstance();
                        const expiresInSeconds = parseInt(verifyPasswordResponse.expiresIn);
                        const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;

                        localStorageManager.setIdToken(verifyPasswordResponse.idToken);
                        localStorageManager.setRefreshToken(verifyPasswordResponse.refreshToken);
                        localStorageManager.setTokenExpiration(expirationTime);
                        localStorageManager.setFamilyKey(key);

                        // Update Context
                        context.setIsAuthenticated(true);

                        console.log('Authentication successful');

                        // Navigate to Dashboard (maybe be unnecessary)
                        setLoggedIn(true);
                    });
            })
            .catch((reason: Error) => {
                setStatus(reason.message);
                setShowError(true);
            });
    };

    useEffect(() => {
        if (loggedIn) {
            navigate('/');
        }
    }, [loggedIn]);

    return (
        <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 mt-6">
            {showError && (
                <div
                    className="absolute top-0 left-0 right-0 mx-auto max-w-md w-full bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md"
                    role="alert"
                >
                    <div className="flex">
                        <div className="py-1">
                            <svg
                                className="fill-current h-6 w-6 text-blue-500 mr-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 0c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 15h-2v-2h2v2zm0-4h-2v-6h2v6z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold">Error</p>
                            <div className="flex items-center">
                                <p className="text-sm mr-2">{status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-md w-full mx-auto space-y-8 bg-gray-50 p-4 mt-12">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Email
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
