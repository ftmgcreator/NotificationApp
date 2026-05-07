import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type User = { id: number; name: string; email: string };

type AuthCtx = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser]     = useState<User | null>(null);
    const [token, setToken]   = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('token');
            if (stored) {
                setToken(stored);
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch {
                    await AsyncStorage.removeItem('token');
                }
            }
            setLoading(false);
        })();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        await AsyncStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch {}
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
