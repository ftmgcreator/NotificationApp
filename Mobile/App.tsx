import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import WorkerScreen from './screens/WorkerScreen';
import { AuthProvider, useAuth } from './store/AuthContext';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<string, { active: IoniconName; inactive: IoniconName }> = {
    Dashboard: { active: 'grid',        inactive: 'grid-outline'        },
    Worker:    { active: 'play-circle', inactive: 'play-circle-outline' },
    Settings:  { active: 'settings',   inactive: 'settings-outline'    },
};

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6 }]}>
            {state.routes.map((route, index) => {
                const focused = state.index === index;
                const label   = descriptors[route.key].options.title ?? route.name;
                const icons   = tabIcons[route.name];
                return (
                    <TouchableOpacity key={route.key} style={styles.tabItem} activeOpacity={0.7}
                        onPress={() => navigation.navigate(route.name)}>
                        <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                            <Ionicons name={focused ? icons.active : icons.inactive} size={22}
                                color={focused ? '#6366f1' : '#334155'} />
                        </View>
                        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function AppNavigator() {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.splash}>
                <View style={styles.splashDot} />
                <ActivityIndicator color="#6366f1" style={{ marginTop: 24 }} />
            </View>
        );
    }

    if (!token) return <LoginScreen />;

    return (
        <NavigationContainer>
            <Tab.Navigator tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
                <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                <Tab.Screen name="Worker"    component={WorkerScreen}    options={{ title: 'Ish stoli' }} />
                <Tab.Screen name="Settings"  component={SettingsScreen}  options={{ title: 'Sozlamalar' }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AppNavigator />
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    splash: { flex: 1, backgroundColor: '#0c0c10', alignItems: 'center', justifyContent: 'center' },
    splashDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#6366f1' },
    tabBar: { flexDirection: 'row', backgroundColor: '#0c0c10', borderTopWidth: 1, borderTopColor: '#1e1e2e', paddingTop: 10, paddingHorizontal: 16 },
    tabItem: { flex: 1, alignItems: 'center', gap: 3 },
    tabIconWrap: { width: 42, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    tabIconWrapActive: { backgroundColor: 'rgba(99,102,241,0.12)' },
    tabLabel: { fontSize: 11, fontWeight: '500', color: '#334155' },
    tabLabelActive: { color: '#6366f1', fontWeight: '600' },
});
