import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../state/useAuthStore';
import { useNavigation } from '@react-navigation/native';

// Warna standar HAIS sesuai UI/UX Enterprise Skill
const COLORS = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  primary: '#1e40af', // Deep Blue
  secondary: '#f97316', // Aviation Orange
  text: '#f8fafc',
  textMuted: '#94a3b8',
  status: {
    success: '#10b981', // Hijau (Baik)
    error: '#ef4444', // Merah (Rusak)
  }
};

// Data Dummy Aset (Biasanya didapatkan dari API resolve QR Code)
const ASSET_DATA = {
  id: 'APAR-045',
  location: 'Terminal Keberangkatan - Gate 2',
  expiryDate: '2026-12-31',
  type: 'Powder 6Kg'
};

// Item Ceklis berdasarkan CSV
const CHECKLIST_ITEMS = [
  { id: 'pressure_gauge', label: 'Pressure Gauge' },
  { id: 'pin_segel', label: 'Pin / Segel' },
  { id: 'selang', label: 'Selang' },
  { id: 'klem_selang', label: 'Klem Selang' },
  { id: 'handle', label: 'Handle' },
  { id: 'kondisi_fisik', label: 'Kondisi Fisik' },
];

export const InspectionFormScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [results, setResults] = useState<Record<string, boolean | null>>({});
  const [notes, setNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelect = (id: string, isOk: boolean) => {
    setResults(prev => ({ ...prev, [id]: isOk }));
  };

  const isFormComplete = CHECKLIST_ITEMS.every(item => results[item.id] !== undefined && results[item.id] !== null);

  const handleSubmit = () => {
    // Implementasi simpan ke database
    console.log("Submit data inspeksi:", { asset: ASSET_DATA.id, results, notes, inspector: user?.name });
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Inspeksi APAR</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* ASSET SUMMARY CARD */}
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <MaterialCommunityIcons name="fire-extinguisher" size={24} color={COLORS.secondary} />
              <Text style={styles.assetId}>No. {ASSET_DATA.id}</Text>
            </View>
            <View style={styles.assetInfoRow}>
              <Text style={styles.assetLabel}>Lokasi</Text>
              <Text style={styles.assetValue}>{ASSET_DATA.location}</Text>
            </View>
            <View style={styles.assetInfoRow}>
              <Text style={styles.assetLabel}>Masa Berlaku</Text>
              <Text style={[styles.assetValue, { color: COLORS.status.success }]}>{ASSET_DATA.expiryDate}</Text>
            </View>
            <View style={styles.assetInfoRow}>
              <Text style={styles.assetLabel}>Inspektur</Text>
              <Text style={styles.assetValue}>{user?.name || 'Petugas'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>DAFTAR PEMERIKSAAN</Text>

          {/* CHECKLIST ITEMS (Glove-friendly touch targets) */}
          {CHECKLIST_ITEMS.map((item) => {
            const isGood = results[item.id] === true;
            const isBad = results[item.id] === false;

            return (
              <View key={item.id} style={styles.checklistItem}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                
                <View style={styles.actionButtonsRow}>
                  {/* Tombol Rusak (Kiri) */}
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      isBad ? styles.toggleBadActive : styles.toggleInactive,
                      { marginRight: 8 }
                    ]}
                    onPress={() => handleSelect(item.id, false)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="close-circle-outline" 
                      size={20} 
                      color={isBad ? '#fff' : COLORS.textMuted} 
                    />
                    <Text style={[styles.toggleText, isBad ? { color: '#fff' } : { color: COLORS.textMuted }]}>
                      Rusak
                    </Text>
                  </TouchableOpacity>

                  {/* Tombol Baik (Kanan) */}
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      isGood ? styles.toggleGoodActive : styles.toggleInactive
                    ]}
                    onPress={() => handleSelect(item.id, true)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="check-circle-outline" 
                      size={20} 
                      color={isGood ? '#fff' : COLORS.textMuted} 
                    />
                    <Text style={[styles.toggleText, isGood ? { color: '#fff' } : { color: COLORS.textMuted }]}>
                      Baik
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* NOTES FIELD */}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>CATATAN TAMBAHAN</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tuliskan temuan atau kendala fisik..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

        </ScrollView>

        {/* BOTTOM ACTION BAR */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.submitButton, !isFormComplete && styles.submitButtonDisabled]}
            disabled={!isFormComplete}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="content-save-check" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitText}>
              {isFormComplete ? 'SIMPAN INSPEKSI' : 'LENGKAPI FORM'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PREMIUM NOTIFICATION POP-UP (Modal Custom) */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Berhasil</Text>
              <Text style={styles.modalBody}>Laporan inspeksi APAR telah berhasil disimpan ke dalam sistem.</Text>
              
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>TUTUP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  assetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
    paddingBottom: 12,
  },
  assetId: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 12,
  },
  assetInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assetLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  assetValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  checklistItem: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48, // Glove-friendly touch target
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleInactive: {
    backgroundColor: 'transparent',
    borderColor: COLORS.surfaceLight,
  },
  toggleGoodActive: {
    backgroundColor: COLORS.status.success,
    borderColor: COLORS.status.success,
  },
  toggleBadActive: {
    backgroundColor: COLORS.status.error,
    borderColor: COLORS.status.error,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 8,
    color: COLORS.text,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 24,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  submitButton: {
    height: 56, // Extra large touch target for core actions
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    width: '85%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalBody: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#C8102E',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
