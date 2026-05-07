import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const DAYS   = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const _d     = new Date();
const today  = `${DAYS[_d.getDay()]}, ${_d.getDate()} ${MONTHS[_d.getMonth()]}`;

type Stats = { sms_sent: number; calls_made: number; failed: number; pending: number; retries: number };
type ActivityItem = { type: string; number: string; status: string; created_at: string };

const statusMap: Record<string, { label: string; color: string }> = {
    sent:      { label: 'Yuborildi',    color: '#6366f1' },
    called:    { label: 'Ko\'tarildi',  color: '#22c55e' },
    failed:    { label: 'Xatolik',      color: '#f87171' },
    no_answer: { label: 'Ko\'tarilmadi', color: '#f87171' },
    pending:   { label: 'Kutilmoqda',   color: '#f59e0b' },
};

function maskNumber(num: string) {
    if (!num || num.length < 8) return num;
    return `${num.slice(0, 6)}••••${num.slice(-3)}`;
}

export default function DashboardScreen() {
    const { logout } = useAuth();
    const [stats, setStats]       = useState<Stats | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading]   = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard');
            setStats(res.data.today);
            setActivity(res.data.activity ?? []);
        } catch {}
    };

    useEffect(() => {
        fetchData().finally(() => setLoading(false));
        const interval = setInterval(fetchData, 30_000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const heroStats = [
        { label: 'SMS',           value: stats?.sms_sent   ?? 0, icon: 'mail',     color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Qo\'ng\'iroq', value: stats?.calls_made ?? 0, icon: 'call',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
    ];

    const subStats = [
        { label: 'Muvaffaqiyatsiz', value: stats?.failed  ?? 0, icon: 'close-circle', color: '#f87171' },
        { label: 'Kutilmoqda',      value: stats?.pending ?? 0, icon: 'time',         color: '#f59e0b' },
        { label: 'Qayta urinish',   value: stats?.retries ?? 0, icon: 'refresh',      color: '#818cf8' },
        { label: 'Jami',            value: (stats?.sms_sent ?? 0) + (stats?.calls_made ?? 0), icon: 'bar-chart', color: '#38bdf8' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0c0c10" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Bugun</Text>
                    <Text style={styles.date}>{today}</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Faol</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={20} color="#475569" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#6366f1" size="large" />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
                >
                    <View style={styles.heroRow}>
                        {heroStats.map(s => (
                            <View key={s.label} style={[styles.heroCard, { borderColor: s.color + '25' }]}>
                                <View style={[styles.heroIcon, { backgroundColor: s.bg }]}>
                                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                                </View>
                                <Text style={styles.heroValue}>{s.value}</Text>
                                <Text style={styles.heroLabel}>{s.label}</Text>
                                <View style={[styles.heroBar, { backgroundColor: s.color + '18' }]}>
                                    <View style={[styles.heroBarFill, { backgroundColor: s.color, width: `${Math.min(s.value / 30 * 100, 100)}%` as any }]} />
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.subGrid}>
                        {subStats.map(s => (
                            <View key={s.label} style={styles.subCard}>
                                <Ionicons name={s.icon as any} size={15} color={s.color} />
                                <Text style={[styles.subValue, { color: s.color }]}>{s.value}</Text>
                                <Text style={styles.subLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>

                    {activity.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Oxirgi faoliyat</Text>
                            <View style={styles.actList}>
                                {activity.map((item, i) => {
                                    const st = statusMap[item.status] ?? { label: item.status, color: '#64748b' };
                                    return (
                                        <View key={i}>
                                            <View style={styles.actRow}>
                                                <View style={[styles.actIcon, { backgroundColor: (item.type === 'sms' ? '#6366f1' : '#22c55e') + '15' }]}>
                                                    <Ionicons name={item.type === 'sms' ? 'mail' : 'call'} size={14} color={item.type === 'sms' ? '#6366f1' : '#22c55e'} />
                                                </View>
                                                <View style={styles.actMeta}>
                                                    <Text style={styles.actNumber}>{maskNumber(item.number)}</Text>
                                                    <Text style={[styles.actStatus, { color: st.color }]}>{st.label}</Text>
                                                </View>
                                                <Text style={styles.actTime}>{item.created_at}</Text>
                                            </View>
                                            {i < activity.length - 1 && <View style={styles.actDivider} />}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0c0c10' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
    greeting: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 3 },
    date: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.3 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    onlineText: { fontSize: 12, color: '#22c55e', fontWeight: '600' },
    logoutBtn: { padding: 4 },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
    heroRow: { flexDirection: 'row', gap: 12 },
    heroCard: { flex: 1, backgroundColor: '#111118', borderRadius: 16, borderWidth: 1, padding: 16, gap: 8, overflow: 'hidden' },
    heroIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    heroValue: { fontSize: 34, fontWeight: '800', color: '#f1f5f9', letterSpacing: -1 },
    heroLabel: { fontSize: 12, color: '#475569', fontWeight: '500' },
    heroBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
    heroBarFill: { height: '100%', borderRadius: 2 },
    subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    subCard: { width: '47%', backgroundColor: '#111118', borderRadius: 12, borderWidth: 1, borderColor: '#1e1e2e', padding: 14, gap: 4 },
    subValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    subLabel: { fontSize: 11, color: '#334155', fontWeight: '500' },
    section: { gap: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: '#334155', letterSpacing: 0.8, textTransform: 'uppercase' },
    actList: { backgroundColor: '#111118', borderRadius: 14, borderWidth: 1, borderColor: '#1e1e2e' },
    actRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
    actIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    actMeta: { flex: 1 },
    actNumber: { fontSize: 13.5, fontWeight: '600', color: '#cbd5e1' },
    actStatus: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    actTime: { fontSize: 11, color: '#334155' },
    actDivider: { height: 1, backgroundColor: '#1a1a24', marginHorizontal: 14 },
});
