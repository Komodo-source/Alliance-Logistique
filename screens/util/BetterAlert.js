import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

const BetterAlert = forwardRef((props, ref) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [alertData, setAlertData] = useState({});

  useImperativeHandle(ref, () => ({
    showAlert: (
      title,
      message,
      button1 = false,
      button1Text = '',
      actionButton1 = null,
      button2 = false,
      button2Text = '',
      actionButton2 = null
    ) => {
      setAlertData({
        title,
        message,
        button1,
        button1Text,
        actionButton1,
        button2,
        button2Text,
        actionButton2,
      });
      setModalVisible(true);
    },
    hideAlert: () => setModalVisible(false),
  }));

  const handleButtonPress = (action) => {
    setModalVisible(false);
    if (typeof action === 'function') action();
  };

  return (
    <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{alertData.title}</Text>
          <Text style={styles.message}>{alertData.message}</Text>
          <View style={styles.buttons}>
            {alertData.button1 && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleButtonPress(alertData.actionButton1)}
              >
                <Text style={styles.buttonText}>{alertData.button1Text}</Text>
              </TouchableOpacity>
            )}
            {alertData.button2 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => handleButtonPress(alertData.actionButton2)}
              >
                <Text style={styles.buttonText}>{alertData.button2Text}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 10,
  },
  buttonSecondary: {
    backgroundColor: '#cb1010',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default BetterAlert;
