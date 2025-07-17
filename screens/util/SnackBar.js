import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SnackBar = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [timeoutId, setTimeoutId] = useState(null);
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, msgType = 'info', duration = 2500) => {
      setMessage(msg);
      setType(msgType);
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (timeoutId) clearTimeout(timeoutId);
      const id = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, duration);
      setTimeoutId(id);
    },
    hide: () => {
      if (timeoutId) clearTimeout(timeoutId);
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    },
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], backgroundColor: type === 'error' ? '#c51b18' : '#333' },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: width * 0.05,
    width: width * 0.9,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SnackBar; 