import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Image, Alert, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../state/useAuthStore';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { QRScannerScreen } from './QRScannerScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { CustomModal } from '../components/CustomModal';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#C8102E', // Red
  secondary: '#F2B333', // Yellow
  background: '#1F1F1F', // Dark gray
  inputBg: '#2C2C2C',
  textMain: '#FFFFFF',
  textSub: '#888888',
};

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'info' | 'success' });

  const { login, checkSession, isLoading, error } = useAuthStore();
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
    }
  }, [error]);

  useEffect(() => {
    const loadSavedUsername = async () => {
      try {
        // Hanya simpan username untuk pre-fill kolom input. 
        // Auto-login sekarang ditangani otomatis oleh refresh_token di AuthRepository.
        const savedUsername = await AsyncStorage.getItem('saved_username');
        if (savedUsername) {
          setUsername(savedUsername);
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Failed to load username', e);
      }
    };
    loadSavedUsername();
  }, []);

  const handleLogin = async () => {
    if (rememberMe) {
      try {
        await AsyncStorage.setItem('saved_username', username);
      } catch (e) {
        console.error('Failed to save username', e);
      }
    } else {
      try {
        await AsyncStorage.removeItem('saved_username');
      } catch (e) {
        console.error('Failed to clear username', e);
      }
    }

    // In design, password is used instead of OTP
    login(username, password);
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setModalConfig({ title: 'Gagal', message: 'Perangkat Anda tidak memiliki sensor biometrik (Sidik Jari / Face ID).', type: 'error' });
        setModalVisible(true);
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setModalConfig({ title: 'Belum Terdaftar', message: 'Silakan daftarkan Sidik Jari atau Face ID di pengaturan perangkat Anda terlebih dahulu.', type: 'info' });
        setModalVisible(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login ke HAIS',
        fallbackLabel: 'Gunakan Password',
        cancelLabel: 'Batal',
      });

      if (result.success) {
        // Biometrik sukses secara hardware. 
        // Lakukan login diam-diam (silent login) dengan refresh_token dari SecureStore
        const success = await checkSession();
        if (!success) {
          setModalConfig({
            title: 'Otentikasi Diperlukan',
            message: 'Sesi akses Anda telah berakhir atau kredensial perangkat belum terverifikasi. Silakan masuk secara manual menggunakan kata sandi untuk mengaktifkan kembali fitur otentikasi biometrik.',
            type: 'info'
          });
          setModalVisible(true);
        }
      }
    } catch (error) {
      console.error(error);
      setModalConfig({ title: 'Error', message: 'Terjadi kesalahan saat memproses biometrik.', type: 'error' });
      setModalVisible(true);
    }
  };

  if (showQRScanner) {
    return <QRScannerScreen onBack={() => setShowQRScanner(false)} />;
  }

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBack={() => setShowForgotPassword(false)} />;
  }

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

      <ScrollView
        style={{ flex: 1, zIndex: 10 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* Header / Logo Section */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../../assets/compact-logo.png')}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
          <Text style={styles.haisTitle}>HAIS</Text>
          <Text style={styles.arffSubtitle}>HANG NADIM ARFF</Text>
          <Text style={styles.integratedText}>INTEGRATED SYSTEM</Text>
          <View style={styles.integratedUnderline} />
          <Text style={styles.taglineText}>COMMAND • MONITOR • RESPOND</Text>
        </View>

        {/* Form Section */}
        <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnimation }] }]}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Input Username */}
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan username"
                placeholderTextColor={COLORS.textSub}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Input Password */}
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Feather name="lock" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                placeholderTextColor={COLORS.textSub}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={COLORS.textSub} />
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <MaterialCommunityIcons
                name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
                size={22}
                color={COLORS.textMain}
              />
              <Text style={styles.checkboxText}>Ingat saya</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
              <Text style={styles.forgotPasswordText}>Lupa password?</Text>
            </TouchableOpacity>
          </View>

          {/* Main Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>MASUK</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau masuk dengan</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Biometric Button */}
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
            <Ionicons name="finger-print-outline" size={24} color={COLORS.primary} />
            <Text style={styles.biometricButtonText}>Login dengan Biometrik</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 24 }} />

          {/* Document Verification Button */}
          <TouchableOpacity
            style={styles.verificationButton}
            onPress={() => setShowQRScanner(true)}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.secondary} />
            <Text style={styles.verificationButtonText}>Verifikasi Dokumen (Scan QR)</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Footer */}
      <Text style={styles.footerText}>© 2026 Hang Nadim ARFF. All rights reserved.</Text>

      <CustomModal 
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 0,
  },
  absoluteBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.42, // Image strictly stops just below the logo/tagline text
    opacity: 0.8,
  },
  absoluteGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.60, // Raised to blend exactly between Username and Password inputs
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: height * 0.15,
    paddingBottom: 24,
  },
  formContainer: {
    paddingHorizontal: 28,
  },
  haisTitle: {
    fontSize: 46,
    fontWeight: '900',
    color: COLORS.textMain,
    marginTop: -18, // Pulled much closer to the logo
    letterSpacing: 2,
  },
  arffSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  integratedText: {
    fontSize: 14,
    fontWeight: '500', // Made thinner
    color: COLORS.textMain,
    letterSpacing: 2,
    marginTop: 2,
  },
  integratedUnderline: {
    width: 180, // Extended to align perfectly with the text length
    height: 1, // Made thinner (less "bold")
    backgroundColor: COLORS.secondary,
    marginTop: 6,
    marginBottom: 12,
  },
  taglineText: {
    fontSize: 10,
    color: COLORS.textMain,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 12,
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
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    color: COLORS.textMain,
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A3A3A',
  },
  dividerText: {
    color: COLORS.textSub,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  verificationButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(242, 179, 51, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  errorText: {
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  footerText: {
    color: COLORS.textSub,
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  }
});
