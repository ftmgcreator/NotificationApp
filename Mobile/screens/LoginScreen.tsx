import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../store/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const handleLogin = async () => {
        if (!email || !password) { setError('Email va parol kiriting'); return; }
        setLoading(true);
        setError('');
        try {
            await login(email.trim(), password);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Ulanib bo\'lmadi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor="#0c0c10" />

            <View style={styles.inner}>
                <View style={styles.brand}>
                    <View style={styles.brandDot} />
                    <Text style={styles.brandText}>Notification App</Text>
                </View>

                <View style={styles.heading}>
                    <Text style={styles.title}>Kirish</Text>
                    <Text style={styles.sub}>Davom etish uchun tizimga kiring</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="admin@admin.com"
                            placeholderTextColor="#2d2d3d"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Parol</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#2d2d3d"
                            secureTextEntry
                        />
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.btnText}>Kirish</Text>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0c0c10' },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 32 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' },
    brandText: { fontSize: 13, fontWeight: '600', color: '#475569', letterSpacing: 0.5 },
    heading: { gap: 6 },
    title: { fontSize: 28, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.5 },
    sub: { fontSize: 13, color: '#475569' },
    form: { gap: 14 },
    field: { gap: 6 },
    label: { fontSize: 12, fontWeight: '500', color: '#475569' },
    input: {
        backgroundColor: '#111118',
        borderWidth: 1,
        borderColor: '#1e1e2e',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#e2e8f0',
    },
    error: { fontSize: 12, color: '#f87171', marginTop: -4 },
    btn: {
        backgroundColor: '#6366f1',
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
