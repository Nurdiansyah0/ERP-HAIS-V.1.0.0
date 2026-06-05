import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Dimensions, StatusBar, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CustomModal } from '../components/CustomModal';

const API_BASE_URL = 'http://10.0.2.2:8080/v1';

const COLORS = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  secondary: '#f97316',
  textMain: '#f8fafc',
  textSub: '#94a3b8',
  danger: '#ef4444',
  success: '#10b981',
};

interface UserData {
  id: string;
  name: string;
  username: string;
  role: string;
}

export const UsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'staff' });
  const [submitting, setSubmitting] = useState(false);

  // Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' as 'error' | 'info' | 'success' });

  const showAlert = (title: string, message: string, type: 'error' | 'info' | 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@hais_jwt_token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error: any) {
      showAlert('Gagal', error.response?.data?.message || 'Gagal memuat data pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.username || !formData.role) {
      showAlert('Validasi', 'Mohon lengkapi semua kolom wajib.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('@hais_jwt_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = { ...formData };
      
      if (editingId) {
        if (!payload.password) delete (payload as any).password;
        await axios.put(`${API_BASE_URL}/admin/users/${editingId}`, payload, config);
        showAlert('Sukses', 'Data user berhasil diperbarui', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/admin/users`, payload, config);
        showAlert('Sukses', 'User baru berhasil ditambahkan', 'success');
      }
      
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      showAlert('Gagal', error.response?.data?.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Hapus User',
      `Apakah Anda yakin ingin menghapus user "${name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('@hais_jwt_token');
              await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              showAlert('Sukses', 'User berhasil dihapus', 'success');
              fetchUsers();
            } catch (error: any) {
              showAlert('Gagal', error.response?.data?.message || 'Gagal menghapus user', 'error');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', username: '', password: '', role: 'staff' });
    setModalVisible(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingId(user.id);
    setFormData({ name: user.name, username: user.username, password: '', role: user.role });
    setModalVisible(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserCard = ({ item }: { item: UserData }) => {
    const isSuperuser = item.role === 'superuser';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: isSuperuser ? COLORS.secondary : COLORS.primary }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.roleContainer}>
            <MaterialCommunityIcons 
              name={isSuperuser ? 'shield-star' : 'badge-account-outline'} 
              size={16} 
              color={isSuperuser ? COLORS.secondary : COLORS.primaryLight} 
            />
            <Text style={[styles.roleText, { color: isSuperuser ? COLORS.secondary : COLORS.primaryLight }]}>
              {item.role.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
              <Feather name="edit-2" size={16} color={COLORS.textMain} />
            </TouchableOpacity>
            {!isSuperuser && (
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(239,68,68,0.1)' }]} onPress={() => handleDelete(item.id, item.name)}>
                <Feather name="trash-2" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Feather name="plus" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.textSub} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau username..."
          placeholderTextColor={COLORS.textSub}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>Tidak ada user ditemukan.</Text>
            </View>
          }
        />
      )}

      {/* Form Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit User' : 'Tambah User Baru'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Masukkan nama"
                placeholderTextColor={COLORS.textSub}
                value={formData.name}
                onChangeText={(t) => setFormData({...formData, name: t})}
              />

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Masukkan username"
                placeholderTextColor={COLORS.textSub}
                autoCapitalize="none"
                value={formData.username}
                onChangeText={(t) => setFormData({...formData, username: t})}
              />

              <Text style={styles.inputLabel}>Password {editingId && '(Kosongkan jika tidak diubah)'}</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Masukkan kata sandi"
                placeholderTextColor={COLORS.textSub}
                secureTextEntry
                value={formData.password}
                onChangeText={(t) => setFormData({...formData, password: t})}
              />

              <Text style={styles.inputLabel}>Hak Akses (Role)</Text>
              <View style={styles.rolePicker}>
                {['staff', 'manager', 'administrator'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleOption, formData.role === role && styles.roleOptionActive]}
                    onPress={() => setFormData({...formData, role})}
                  >
                    <Text style={[styles.roleOptionText, formData.role === role && styles.roleOptionTextActive]}>
                      {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>SIMPAN</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Alert Custom Modal */}
      <CustomModal 
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceLight },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, letterSpacing: 0.5 },
  addButton: { padding: 8, marginRight: -8, backgroundColor: COLORS.primary, borderRadius: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, margin: 16, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.surfaceLight },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: COLORS.textMain, fontSize: 15, paddingVertical: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.surfaceLight },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  userUsername: { fontSize: 13, color: COLORS.textSub },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight },
  roleContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  roleText: { fontSize: 12, fontWeight: '700', marginLeft: 6, letterSpacing: 1 },
  actionsRow: { flexDirection: 'row' },
  actionButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 15, color: COLORS.textSub },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
  inputLabel: { fontSize: 13, color: COLORS.textMain, marginBottom: 8, fontWeight: '600' },
  inputField: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceLight, borderRadius: 12, color: COLORS.textMain, padding: 14, marginBottom: 20 },
  rolePicker: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 },
  roleOption: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.surfaceLight, marginRight: 12, marginBottom: 12 },
  roleOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleOptionText: { color: COLORS.textSub, fontWeight: '600', fontSize: 13 },
  roleOptionTextActive: { color: COLORS.textMain },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 40 : 20 },
  saveButtonText: { color: COLORS.textMain, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
