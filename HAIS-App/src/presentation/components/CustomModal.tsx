import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
  primaryLabel?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  onSecondaryAction,
  secondaryLabel = 'BATAL',
  primaryLabel = 'TUTUP'
}) => {
  const getIconData = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'close-circle', color: '#C8102E' };
      case 'info':
        return { name: 'information', color: '#F2B333' };
      default:
        return { name: 'information', color: '#F2B333' };
    }
  };

  const { name, color } = getIconData();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons name={name as any} size={64} color={color} style={styles.modalIcon} />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalBody}>{message}</Text>
          
          {onSecondaryAction ? (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={onSecondaryAction}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity 
                style={[styles.primaryButton, { flex: 1 }]} 
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryButton, { width: '100%' }]} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    textAlign: 'center',
  },
  modalBody: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#C8102E', // HAIS Red
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#3A3A3A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
