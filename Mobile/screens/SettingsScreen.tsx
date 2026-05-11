import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { useCallback, useEffect, useState } from 'react';
import {
    AppState,
    Linking,
    NativeModules,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Status = 'granted' | 'denied' | 'loading';

const pkg = Application.applicationId ?? 'com.fayzullaevdeveloper.Mobile';

const PERMS = [
    { key: 'call',        label: 'Qo\'ng\'iroq qilish', hint: 'Avtomatik qo\'ng\'iroq uchun',   icon: 'call-outline',           permission: 'android.permission.CALL_PHONE',      critical: true  },
    { key: 'phone_state', label: 'Telefon holati',       hint: 'Qo\'ng\'iroq holatini kuzatish', icon: 'phone-portrait-outline', permission: 'android.permission.READ_PHONE_STATE', critical: true  },
    { key: 'send_sms',    label: 'SMS yuborish',         hint: 'Avtomatik SMS uchun',            icon: 'chatbubble-outline',     permission: 'android.permission.SEND_SMS',         critical: true  },
    { key: 'read_sms',    label: 'SMS o\'qish',          hint: 'SMS holatini tekshirish',        icon: 'mail-open-outline',      permission: 'android.permission.READ_SMS',         critical: false },
    { key: 'receive_sms', label: 'SMS qabul qilish',     hint: 'Kelgan SMSlarni olish',          icon: 'download-outline',       permission: 'android.permission.RECEIVE_SMS',      critical: false },
];

async function checkPerm(permission: string): Promise<Status> {
    if (Platform.OS !== 'android') return 'granted';
    try {
        const { PermissionsAndroid } = await import('react-native');
        return (await PermissionsAndroid.check(permission as any)) ? 'granted' : 'denied';
    } catch { return 'denied'; }
}

async function requestPerm(permission: string): Promise<Status> {
    if (Platform.OS !== 'android') return 'granted';
    try {
        const { PermissionsAndroid } = await import('react-native');
        const r = await PermissionsAndroid.request(permission as any);
        return r === 'granted' ? 'granted' : 'denied';
    } catch { return 'denied'; }
}

async function requestDefaultDialer() {
    if (Platform.OS !== 'android') return;

    const DefaultAppModule = NativeModules.DefaultAppModule;

    if (DefaultAppModule?.setDefaultDialer) {
        try { await DefaultAppModule.setDefaultDialer(); return; } catch {}
    }

    try {
        await IntentLauncher.startActivityAsync(
            'android.telecom.action.CHANGE_DEFAULT_DIALER',
            { extra: { 'android.telecom.extra.CHANGE_DEFAULT_DIALER_PACKAGE_NAME': pkg } }
        );
    } catch {
        try {
            await IntentLauncher.startActivityAsync(
                'android.settings.MANAGE_DEFAULT_APPS_SETTINGS'
            );
        } catch {
            Linking.openSettings();
        }
    }
}

async function requestDefaultSms() {
    if (Platform.OS !== 'android') return;

    const DefaultAppModule = NativeModules.DefaultAppModule;

    if (DefaultAppModule?.setDefaultSms) {
        try { await DefaultAppModule.setDefaultSms(); return; } catch {}
    }

    try {
        await IntentLauncher.startActivityAsync(
            'android.provider.Telephony.ACTION_CHANGE_DEFAULT',
            { extra: { 'android.provider.Telephony.EXTRA_PACKAGE_NAME': pkg } }
        );
    } catch {
        try {
            await IntentLauncher.startActivityAsync(
                'android.settings.MANAGE_DEFAULT_APPS_SETTINGS'
            );
        } catch {
            Linking.openSettings();
        }
    }
}

async function getDialerStatus(): Promise<Status> {
    if (Platform.OS !== 'android') return 'granted';
    try {
        const ok = await NativeModules.DefaultAppModule?.isDefaultDialer();
        return ok ? 'granted' : 'denied';
    } catch { return 'denied'; }
}

async function getSmsStatus(): Promise<Status> {
    if (Platform.OS !== 'android') return 'granted';
    try {
        const ok = await NativeModules.DefaultAppModule?.isDefaultSms();
        return ok ? 'granted' : 'denied';
    } catch { return 'denied'; }
}

function PermRow({ label, hint, icon, status, critical, onPress }: {
    label: string; hint: string; icon: string;
    status: Status; critical: boolean; onPress: () => void;
}) {
    return (
        <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: status === 'granted' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)' }]}>
                <Ionicons name={icon as any} size={16} color={status === 'granted' ? '#22c55e' : '#475569'} />
            </View>
            <View style={styles.rowMeta}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    {critical && <View style={styles.critDot} />}
                </View>
                <Text style={styles.rowHint}>{hint}</Text>
            </View>
            {status === 'loading'
                ? <View style={styles.loadDot} />
                : status === 'granted'
                ? <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                : <TouchableOpacity style={styles.grantBtn} onPress={onPress} activeOpacity={0.7}>
                    <Text style={styles.grantText}>Ruxsat</Text>
                  </TouchableOpacity>
            }
        </View>
    );
}

function DefaultRow({ label, hint, icon, status, onPress }: {
    label: string; hint: string; icon: string; status: Status; onPress: () => void;
}) {
    return (
        <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: status === 'granted' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)' }]}>
                <Ionicons name={icon as any} size={16} color={status === 'granted' ? '#818cf8' : '#475569'} />
            </View>
            <View style={styles.rowMeta}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowHint}>{hint}</Text>
            </View>
            {status === 'granted'
                ? <Ionicons name="checkmark-circle" size={20} color="#818cf8" />
                : <TouchableOpacity style={styles.setBtn} onPress={onPress} activeOpacity={0.7}>
                    <Text style={styles.setText}>Ulash</Text>
                  </TouchableOpacity>
            }
        </View>
    );
}

export default function SettingsScreen() {
    const [statuses, setStatuses] = useState<Record<string, Status>>(
        Object.fromEntries(PERMS.map(p => [p.key, 'loading']))
    );
    const [dialerStatus, setDialerStatus] = useState<Status>('denied');
    const [smsStatus, setSmsStatus]       = useState<Status>('denied');

    const refresh = useCallback(async () => {
        const updated: Record<string, Status> = {};
        for (const p of PERMS) updated[p.key] = await checkPerm(p.permission);
        setStatuses(updated);
        setDialerStatus(await getDialerStatus());
        setSmsStatus(await getSmsStatus());
    }, []);

    useEffect(() => {
        refresh();
        const sub = AppState.addEventListener('change', s => { if (s === 'active') refresh(); });
        return () => sub.remove();
    }, []);

    const handlePerm = async (key: string, permission: string) => {
        const result = await requestPerm(permission);
        if (result === 'denied') Linking.openSettings();
        else setStatuses(prev => ({ ...prev, [key]: result }));
    };

    const grantedCount = Object.values(statuses).filter(s => s === 'granted').length;
    const allGranted   = grantedCount === PERMS.length;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0c0c10" />
            <View style={styles.header}>
                <Text style={styles.title}>Sozlamalar</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={[styles.summaryBar, { borderColor: allGranted ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)' }]}>
                    <Ionicons name={allGranted ? 'shield-checkmark' : 'warning'} size={18} color={allGranted ? '#22c55e' : '#f59e0b'} />
                    <Text style={[styles.summaryText, { color: allGranted ? '#22c55e' : '#f59e0b' }]}>
                        {allGranted ? 'Barcha ruxsatlar berilgan' : `${grantedCount}/${PERMS.length} ruxsat berilgan`}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kerakli ruxsatlar</Text>
                    <View style={styles.group}>
                        {PERMS.map((p, i) => (
                            <View key={p.key}>
                                <PermRow label={p.label} hint={p.hint} icon={p.icon}
                                    status={statuses[p.key]} critical={p.critical}
                                    onPress={() => handlePerm(p.key, p.permission)} />
                                {i < PERMS.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Standart ilovalar</Text>
                    <View style={styles.group}>
                        <DefaultRow label="Telefon ilovasi" hint="Standart qo'ng'iroq ilovasi" icon="call"
                            status={dialerStatus} onPress={requestDefaultDialer} />
                        <View style={styles.divider} />
                        <DefaultRow label="SMS ilovasi" hint="Standart xabar ilovasi" icon="chatbubble"
                            status={smsStatus} onPress={requestDefaultSms} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ilova haqida</Text>
                    <View style={styles.group}>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Versiya</Text>
                            <Text style={styles.infoVal}>1.0.0</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Paket</Text>
                            <Text style={[styles.infoVal, { maxWidth: 180 }]} numberOfLines={1}>{pkg}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0c0c10' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
    title: { fontSize: 28, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.5 },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
    summaryBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
    summaryText: { fontSize: 13, fontWeight: '600' },
    section: { gap: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '600', color: '#334155', letterSpacing: 0.8, textTransform: 'uppercase' },
    group: { backgroundColor: '#111118', borderRadius: 13, borderWidth: 1, borderColor: '#1e1e2e' },
    divider: { height: 1, backgroundColor: '#1a1a24', marginHorizontal: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
    rowIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    rowMeta: { flex: 1, gap: 2 },
    rowLabel: { fontSize: 14, fontWeight: '500', color: '#e2e8f0' },
    rowHint: { fontSize: 11, color: '#475569' },
    critDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#f59e0b' },
    loadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1e1e2e' },
    grantBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
    grantText: { fontSize: 12, fontWeight: '600', color: '#f59e0b' },
    setBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)' },
    setText: { fontSize: 12, fontWeight: '600', color: '#818cf8' },
    infoVal: { fontSize: 12, color: '#475569', textAlign: 'right' },
});
