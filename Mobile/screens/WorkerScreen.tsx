import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { callModule, CallState } from '../modules/callModule';
import { smsModule } from '../modules/smsModule';
import api, { API_URL } from '../services/api';

const RADIUS = 110;
const STROKE = 7;
const SIZE = (RADIUS + STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const BATCH_SIZE = 30;
const CALL_TIMEOUT = 30_000;

type WorkType = 'sms' | 'call';
type PhoneItem = { sms_id?: number; call_id?: number; phone_number: string };
type WorkData = { id: number; type: WorkType; message: string | null; audio_url: string | null };

function maskNumber(num: string) {
    if (!num || num.length < 8) return num;
    return `${num.slice(0, 6)}••••${num.slice(-3)}`;
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const callStateInfo: Record<string, { text: string; color: string; icon: string }> = {
    dialing:   { text: 'Qo\'ng\'iroq qilinmoqda...', color: '#818cf8', icon: 'call-outline' },
    ringing:   { text: 'Javob kutilmoqda...',         color: '#f59e0b', icon: 'call' },
    answered:  { text: 'Ko\'tarildi — ovoz yuborildi', color: '#22c55e', icon: 'volume-high' },
    no_answer: { text: 'Ko\'tarilmadi',               color: '#f87171', icon: 'call-sharp' },
};

function RingWave({ active }: { active: boolean }) {
    const w1 = useRef(new Animated.Value(0)).current;
    const w2 = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (!active) { w1.setValue(0); w2.setValue(0); return; }
        const a = Animated.loop(Animated.stagger(400, [
            Animated.sequence([Animated.timing(w1, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(w1, { toValue: 0, duration: 0, useNativeDriver: true })]),
            Animated.sequence([Animated.timing(w2, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(w2, { toValue: 0, duration: 0, useNativeDriver: true })]),
        ]));
        a.start(); return () => a.stop();
    }, [active]);
    if (!active) return null;
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {[w1, w2].map((w, i) => (
                <Animated.View key={i} style={[styles.wave, {
                    opacity:   w.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.15, 0] }),
                    transform: [{ scale: w.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
                }]} />
            ))}
        </View>
    );
}

export default function WorkerScreen() {
    const [running, setRunning]         = useState(false);
    const [work, setWork]               = useState<WorkData | null>(null);
    const [total, setTotal]             = useState(0);
    const [current, setCurrent]         = useState(0);
    const [retried, setRetried]         = useState(0);
    const [activeNumber, setActiveNumber] = useState('');
    const [callState, setCallState]     = useState<string | null>(null);
    const [showCheck, setShowCheck]     = useState(false);
    const [statusLabel, setStatusLabel] = useState('Tayyor');

    const fadeAnim   = useRef(new Animated.Value(0)).current;
    const scaleAnim  = useRef(new Animated.Value(0.7)).current;
    const checkScale = useRef(new Animated.Value(0)).current;
    const checkFade  = useRef(new Animated.Value(0)).current;
    const ringPulse  = useRef(new Animated.Value(1)).current;
    const runningRef = useRef(false);
    const audioPath  = useRef<string | null>(null);

    const progress     = total > 0 ? current / total : 0;
    const strokeOffset = CIRCUMFERENCE * (1 - progress);
    const ringColor    = showCheck ? '#22c55e' : running ? '#6366f1' : '#1e1e2e';

    function pulseRing() {
        Animated.sequence([
            Animated.timing(ringPulse, { toValue: 1.03, duration: 100, useNativeDriver: true }),
            Animated.timing(ringPulse, { toValue: 1,    duration: 100, useNativeDriver: true }),
        ]).start();
    }

    function animateIn(number: string, state?: string) {
        setActiveNumber(number);
        if (state) setCallState(state);
        fadeAnim.setValue(0); scaleAnim.setValue(0.7);
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 8 }),
            Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }

    function animateOut(): Promise<void> {
        return new Promise(r => Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => r()));
    }

    function showCheckmark(): Promise<void> {
        setShowCheck(true);
        checkScale.setValue(0); checkFade.setValue(0);
        Animated.parallel([
            Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 7 }),
            Animated.timing(checkFade,  { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        return new Promise(r => setTimeout(() => {
            Animated.timing(checkFade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => { setShowCheck(false); r(); });
        }, 900));
    }

    async function downloadAudio(url: string): Promise<string | null> {
        try {
            const dest = FileSystem.cacheDirectory + 'work_audio.mp3';
            const info = await FileSystem.getInfoAsync(dest);
            if (info.exists) return dest;
            const token = (await import('@react-native-async-storage/async-storage')).default.getItem('token');
            const res = await FileSystem.downloadAsync(url, dest, { headers: { Authorization: `Bearer ${await token}` } });
            return res.uri;
        } catch { return null; }
    }

    async function processCall(item: PhoneItem): Promise<'called' | 'no_answer' | 'failed'> {
        return new Promise(async (resolve) => {
            let resolved = false;
            const finish = (status: 'called' | 'no_answer' | 'failed') => {
                if (!resolved) { resolved = true; resolve(status); }
            };

            const timeout = setTimeout(() => {
                callModule.endCall();
                finish('no_answer');
            }, CALL_TIMEOUT);

            const unsub = callModule.onCallStateChanged(async (state: CallState) => {
                animateIn(item.phone_number, state);
                if (state === 'answered') {
                    clearTimeout(timeout);
                    await wait(2000);
                    if (audioPath.current) await callModule.playAudioToCall(audioPath.current);
                    await wait(1000);
                    callModule.endCall();
                    await animateOut();
                    finish('called');
                } else if (state === 'ended') {
                    clearTimeout(timeout);
                    await animateOut();
                    finish('no_answer');
                }
            });

            try {
                await callModule.makeCall(item.phone_number);
            } catch {
                clearTimeout(timeout);
                unsub();
                finish('failed');
            }
        });
    }

    async function processSms(item: PhoneItem, message: string): Promise<'sent' | 'failed'> {
        animateIn(item.phone_number);
        try {
            const ok = await smsModule.sendSms(item.phone_number, message);
            await animateOut();
            return ok ? 'sent' : 'failed';
        } catch {
            await animateOut();
            return 'failed';
        }
    }

    async function runWorker() {
        setStatusLabel('Ishlamoqda');
        let offset = 0;

        while (runningRef.current) {
            let currentWork = work;

            if (!currentWork) {
                try {
                    const res = await api.get('/worker/current');
                    if (!res.data.work) { await wait(5000); continue; }
                    currentWork = res.data.work;
                    setWork(currentWork!);
                    setTotal(res.data.stats.total);
                    setCurrent(res.data.stats.total - res.data.stats.pending);
                    offset = res.data.stats.total - res.data.stats.pending;

                    if (currentWork!.type === 'call' && currentWork!.audio_url) {
                        audioPath.current = await downloadAudio(currentWork!.audio_url);
                    }
                } catch { await wait(3000); continue; }
            }

            try {
                const batchRes = await api.get(`/worker/${currentWork!.id}/numbers`, {
                    params: { limit: BATCH_SIZE, offset },
                });
                const { items, has_more } = batchRes.data;

                if (!items || items.length === 0) {
                    await showCheckmark();
                    setWork(null);
                    audioPath.current = null;
                    offset = 0;
                    continue;
                }

                for (const item of items) {
                    if (!runningRef.current) return;

                    let status: string;

                    if (currentWork!.type === 'sms') {
                        status = await processSms(item, currentWork!.message ?? '');
                        await api.patch(`/worker/sms/${item.sms_id}`, { status });
                        if (status === 'failed') setRetried(r => r + 1);
                    } else {
                        status = await processCall(item);
                        await api.patch(`/worker/calls/${item.call_id}`, { status });
                        if (status === 'no_answer') setRetried(r => r + 1);
                    }

                    pulseRing();
                    offset++;
                    setCurrent(c => c + 1);
                    await wait(50);
                }

                if (!has_more) {
                    await showCheckmark();
                    setWork(null);
                    audioPath.current = null;
                    offset = 0;
                    setRetried(0);
                }

            } catch { await wait(3000); }
        }
    }

    const toggle = () => {
        const next = !running;
        runningRef.current = next;
        setRunning(next);
        if (!next) { setStatusLabel('To\'xtatildi'); setCallState(null); }
        else runWorker();
    };

    const statusColor = running ? '#818cf8' : current > 0 ? '#f59e0b' : '#334155';
    const cs = callState ? callStateInfo[callState] : null;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0c0c10" />
            <View style={styles.header}>
                <Text style={styles.title}>Ish stoli</Text>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                </View>
                {work && <Text style={styles.workTitle} numberOfLines={1}>{work.type === 'sms' ? '💬' : '📞'} {work.id}-ish</Text>}
            </View>

            <View style={styles.center}>
                <Animated.View style={{ transform: [{ scale: ringPulse }] }}>
                    <TouchableOpacity activeOpacity={0.88} onPress={toggle}>
                        <View style={styles.ringWrap}>
                            <RingWave active={callState === 'ringing'} />
                            <Svg width={SIZE} height={SIZE}>
                                <Circle cx={SIZE/2} cy={SIZE/2} r={RADIUS} stroke="#1a1a24" strokeWidth={STROKE} fill="none" />
                                <Circle cx={SIZE/2} cy={SIZE/2} r={RADIUS} stroke={ringColor} strokeWidth={STROKE} fill="none"
                                    strokeDasharray={`${CIRCUMFERENCE}`} strokeDashoffset={strokeOffset}
                                    strokeLinecap="round" rotation="-90" origin={`${SIZE/2}, ${SIZE/2}`} />
                            </Svg>

                            <View style={styles.ringInner}>
                                {showCheck ? (
                                    <Animated.View style={{ opacity: checkFade, transform: [{ scale: checkScale }] }}>
                                        <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
                                    </Animated.View>
                                ) : running && activeNumber && cs ? (
                                    <Animated.View style={[styles.callWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                                        <View style={[styles.callIconWrap, { backgroundColor: cs.color + '18', borderColor: cs.color + '30' }]}>
                                            <Ionicons name={cs.icon as any} size={28} color={cs.color} />
                                        </View>
                                        <Text style={styles.callNumber}>{maskNumber(activeNumber)}</Text>
                                        <Text style={[styles.callStateText, { color: cs.color }]}>{cs.text}</Text>
                                    </Animated.View>
                                ) : running && activeNumber ? (
                                    <Animated.View style={[styles.smsWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                                        <Ionicons name="mail" size={30} color="#818cf8" />
                                        <Text style={styles.callNumber}>{maskNumber(activeNumber)}</Text>
                                    </Animated.View>
                                ) : (
                                    <View style={styles.idleWrap}>
                                        <Text style={styles.countText}>
                                            <Text style={styles.countCur}>{current}</Text>
                                            <Text style={styles.countTot}>/{total || '–'}</Text>
                                        </Text>
                                        <Ionicons name={running ? 'pause' : 'play'} size={16} color="#334155" />
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <Text style={styles.hint}>{running ? 'To\'xtatish uchun bosing' : 'Boshlash uchun bosing'}</Text>

                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{current}</Text>
                        <Text style={styles.statKey}>Bajarildi</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{Math.max(0, total - current)}</Text>
                        <Text style={styles.statKey}>Qoldi</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statVal, retried > 0 && { color: '#f59e0b' }]}>{retried}</Text>
                        <Text style={styles.statKey}>Qayta</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{Math.round(progress * 100)}%</Text>
                        <Text style={styles.statKey}>Progress</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0c0c10' },
    header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, gap: 4 },
    title: { fontSize: 28, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.5 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusLabel: { fontSize: 13, fontWeight: '500' },
    workTitle: { fontSize: 12, color: '#334155', marginTop: 2 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
    ringWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
    wave: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE/2, borderWidth: 1.5, borderColor: '#818cf8' },
    ringInner: { position: 'absolute', width: RADIUS*2-24, height: RADIUS*2-24, alignItems: 'center', justifyContent: 'center' },
    callWrap: { alignItems: 'center', gap: 10 },
    callIconWrap: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    callNumber: { fontSize: 15, fontWeight: '600', color: '#cbd5e1', letterSpacing: 0.5 },
    callStateText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
    smsWrap: { alignItems: 'center', gap: 10 },
    idleWrap: { alignItems: 'center', gap: 10 },
    countText: {},
    countCur: { fontSize: 46, fontWeight: '700', color: '#f1f5f9', letterSpacing: -1 },
    countTot: { fontSize: 22, color: '#334155' },
    hint: { fontSize: 12, color: '#334155' },
    statsBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 14, borderWidth: 1, borderColor: '#1e1e2e', marginHorizontal: 20, paddingVertical: 16, width: '88%' },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statSep: { width: 1, height: 32, backgroundColor: '#1e1e2e' },
    statVal: { fontSize: 20, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.5 },
    statKey: { fontSize: 10, color: '#475569', fontWeight: '500' },
});
