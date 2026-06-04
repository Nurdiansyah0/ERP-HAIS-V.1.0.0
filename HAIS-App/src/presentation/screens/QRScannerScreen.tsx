import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

export const QRScannerScreen = ({ onBack }: { onBack: () => void }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  if (!permission) {
    // Permission status is loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Permission is not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kami membutuhkan izin kamera untuk memindai QR Code</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Berikan Izin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={onBack}>
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      "QR Code Terdeteksi",
      `Tipe: ${type}\nData: ${data}`,
      [
        {
          text: "Pindai Lagi",
          onPress: () => setScanned(false)
        },
        {
          text: "Kembali",
          onPress: onBack
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backIconButton} onPress={onBack}>
              <Feather name="arrow-left" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Verifikasi Dokumen</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Scanner Viewport */}
          <View style={styles.scannerFrame}>
            <View style={styles.scannerBox} />
            <Text style={styles.instructionText}>
              Arahkan kamera ke QR Code pada dokumen
            </Text>
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 16,
  },
  backIconButton: {
    padding: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#F2B333',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 24,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  text: {
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#F2B333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#C8102E',
  },
  buttonText: {
    color: '#1F1F1F',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
