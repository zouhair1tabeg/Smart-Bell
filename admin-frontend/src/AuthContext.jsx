import React, { createContext, useContext, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem('token');
        return savedToken ? { token: savedToken } : null;
    });

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', {
                username,
                password,
                role: 'admin'  // Add role field required by backend
            });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setUser({ token: access_token });
            return true;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
