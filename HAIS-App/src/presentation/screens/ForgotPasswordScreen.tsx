import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Dimensions, Image, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.7:8080/v1';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#C8102E', // Red
  secondary: '#F2B333', // Yellow
  background: '#1F1F1F', // Dark gray
  inputBg: '#2C2C2C',
  textMain: '#FFFFFF',
  textSub: '#888888',
};

export const ForgotPasswordScreen = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'success', // 'success' atau 'error'
    onConfirm: () => {},
    confirmText: 'OK'
  });

  const showModal = (title: string, message: string, type: 'success' | 'error', onConfirm?: () => void, confirmText = 'OK') => {
    setModalConfig({ title, message, type, onConfirm: onConfirm || (() => setModalVisible(false)), confirmText });
    setModalVisible(true);
  };

  const handleSendResetLink = async () => {
    if (!email) {
      showModal('Otentikasi Diperlukan', 'Silakan masukkan Email atau NIK terlebih dahulu.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email
      });
      
      showModal(
        'Berhasil', 
        response.data.message || 'Instruksi untuk mereset password telah dikirim.',
        'success',
        onBack,
        'Kembali ke Login'
      );
    } catch (error: any) {
      let errorMessage = 'Gagal menghubungi server. Pastikan koneksi internet Anda aktif.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      showModal('Gagal', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Image and Gradient */}
      <Image
        source={require('../../../assets/login-bg.webp')}
        style={styles.absoluteBackgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(200, 16, 46, 0.5)', 'rgba(200, 16, 46, 0.2)', 'rgba(31, 31, 31, 1)']}
        locations={[0, 0.75, 1]}
        style={styles.absoluteGradient}
      />

      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={28} color={COLORS.textMain} />
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Feather name="unlock" size={64} color={COLORS.secondary} style={{ marginBottom: 20 }} />
          <Text style={styles.title}>Lupa Password?</Text>
          <Text style={styles.subtitle}>
            Masukkan Email atau NIK (Nomor Induk Karyawan) Anda. Kami akan mengirimkan instruksi pemulihan akun.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Input Email/NIK */}
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Feather name="mail" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email atau NIK</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan email atau NIK"
                placeholderTextColor={COLORS.textSub}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSendResetLink}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'MENGIRIM...' : 'KIRIM INSTRUKSI RESET'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Ikon Modal */}
            <View style={[styles.modalIconContainer, { backgroundColor: modalConfig.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(200, 16, 46, 0.1)' }]}>
              {modalConfig.type === 'success' ? (
                <Feather name="check-circle" size={48} color="#4CAF50" />
              ) : (
                <Feather name="x-circle" size={48} color={COLORS.primary} />
              )}
            </View>
            
            {/* Teks Modal */}
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            
            {/* Tombol Modal */}
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: modalConfig.type === 'success' ? COLORS.primary : COLORS.primary }]} 
              onPress={() => {
                setModalVisible(false);
                modalConfig.onConfirm();
              }}
            >
              <Text style={styles.modalButtonText}>{modalConfig.confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingTop: height * 0.08,
  },
  absoluteBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.42,
    opacity: 0.8,
  },
  absoluteGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.60,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.05,
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMain,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    color: COLORS.textMain,
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
