import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../state/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomModal } from '../components/CustomModal';

const { width } = Dimensions.get('window');
// Untuk Glove-friendly operation (mudah ditekan walau pakai sarung tangan)
// Minimum touch target 48x48. Card kita buat cukup besar.
const CARD_WIDTH = (width - 48) / 2;

// HAIS Color Palette
const COLORS = {
  background: '#0f172a', // Dark theme background
  surface: '#1e293b', // Card surface
  surfaceLight: '#334155', // Border or light surface
  primary: '#1e40af', // Deep Blue
  primaryLight: '#3b82f6',
  secondary: '#f97316', // Aviation Orange
  text: '#f8fafc',
  textMuted: '#94a3b8',
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9'
  }
};

const BUSINESS_MODULES = [
  { id: 'b1', title: 'Personnel', icon: 'account-group', color: COLORS.primaryLight },
  { id: 'b2', title: 'Shift Data', icon: 'calendar-clock', color: COLORS.primaryLight },
  { id: 'b3', title: 'Vehicles', icon: 'fire-truck', color: COLORS.status.error },
  { id: 'b4', title: 'Inspections', icon: 'clipboard-check', color: COLORS.status.success },
  { id: 'b5', title: 'Maintenance', icon: 'tools', color: COLORS.status.warning },
  { id: 'b6', title: 'Emergency', icon: 'alert-decagram', color: COLORS.status.error },
  { id: 'b7', title: 'Watchroom', icon: 'eye-circle', color: COLORS.status.info },
];

const SYSTEM_MODULES = [
  { id: 's1', title: 'Users', icon: 'account-cog', color: COLORS.textMuted },
  { id: 's2', title: 'Roles', icon: 'shield-account', color: COLORS.textMuted },
  { id: 's3', title: 'Audit Logs', icon: 'shield-search', color: COLORS.textMuted },
  { id: 's4', title: 'Config', icon: 'cogs', color: COLORS.textMuted },
  { id: 's5', title: 'Database', icon: 'database-cog', color: COLORS.textMuted },
];

export const HomeScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const isSystemRole = user?.role === 'superuser' || user?.role === 'administrator';
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalConfig, setModalConfig] = React.useState({ title: '', message: '' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: isSystemRole ? COLORS.secondary : COLORS.primary }]}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>Hang Nadim ARFF</Text>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={[styles.roleBadge, { borderColor: isSystemRole ? COLORS.secondary : COLORS.primary }]}>
                <MaterialCommunityIcons 
                  name={isSystemRole ? 'shield-star' : 'badge-account'} 
                  size={12} 
                  color={isSystemRole ? COLORS.secondary : COLORS.primaryLight} 
                />
                <Text style={[styles.roleText, { color: isSystemRole ? COLORS.secondary : COLORS.primaryLight }]}>
                  {user?.role?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          {/* Logout button (minimum 48x48 touch target) */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
            <MaterialCommunityIcons name="logout-variant" size={24} color={COLORS.status.error} />
          </TouchableOpacity>
        </View>

        {/* STATS / DASHBOARD PANELS (Solid, clear info, status colors) */}
        {!isSystemRole ? (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>
                <Text style={{ color: COLORS.status.success }}>🟢 </Text>Alerts
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4/4</Text>
              <Text style={styles.statLabel}>
                <Text style={{ color: COLORS.status.success }}>🟢 </Text>Fleet
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>
                <Text style={{ color: COLORS.status.info }}>🔵 </Text>On Duty
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>99.9%</Text>
              <Text style={styles.statLabel}>
                <Text style={{ color: COLORS.status.success }}>🟢 </Text>Uptime
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Secure</Text>
              <Text style={styles.statLabel}>
                <Text style={{ color: COLORS.status.success }}>🟢 </Text>Status
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12h</Text>
              <Text style={styles.statLabel}>
                <Text style={{ color: COLORS.status.warning }}>🟡 </Text>Backup
              </Text>
            </View>
          </View>
        )}

        {/* SYSTEM ADMINISTRATION */}
        {isSystemRole && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SYSTEM ADMINISTRATION</Text>
            </View>
            <View style={styles.gridContainer}>
              {SYSTEM_MODULES.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.8} 
                  style={styles.cardWrapper}
                  onPress={() => {
                    if (item.id === 's1') {
                      navigation.navigate('Users');
                    } else {
                      setModalConfig({ title: 'Under Development', message: `Fitur ${item.title} masih dalam tahap pengembangan.` });
                      setModalVisible(true);
                    }
                  }}
                >
                  <View style={styles.card}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* OPERATIONAL COMMAND CENTER */}
        <View style={[styles.sectionHeader, isSystemRole && { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>OPERATIONAL COMMAND CENTER</Text>
        </View>
        <View style={styles.gridContainer}>
          {BUSINESS_MODULES.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.8} 
              style={styles.cardWrapper}
              onPress={() => {
                if (item.id === 'b4') {
                  navigation.navigate('InspectionForm');
                } else {
                  setModalConfig({ title: 'Under Development', message: `Fitur ${item.title} masih dalam tahap pengembangan.` });
                  setModalVisible(true);
                }
              }}
            >
              <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <CustomModal 
        visible={modalVisible}
        type="info"
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8, // Flat, less rounded design for enterprise
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statItem: {
    alignItems: 'flex-start', // Align left for readable data density
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    minHeight: 110,
    justifyContent: 'flex-start',
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
