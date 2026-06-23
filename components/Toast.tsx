import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
  isResettingPassword: boolean;
  setIsResettingPassword: (val: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [translateY, opacity]);

  const showToast = useCallback((
    newTitle: string,
    newMessage: string,
    newType: ToastType = 'info',
    duration = 4000
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setTitle(newTitle);
    setMessage(newMessage);
    setType(newType);
    setVisible(true);

    // Reset animations
    translateY.setValue(-150);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  }, [translateY, opacity, hideToast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 color="#10B981" size={22} />;
      case 'error':
        return <AlertCircle color="#D20A1E" size={22} />;
      case 'info':
      default:
        return <Info color="#3B82F6" size={22} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.4)';
      case 'error':
        return 'rgba(210, 10, 30, 0.4)';
      case 'info':
      default:
        return 'rgba(59, 130, 246, 0.4)';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, isResettingPassword, setIsResettingPassword }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top > 0 ? insets.top + 10 : 20,
              transform: [{ translateY }],
              opacity,
              borderColor: getBorderColor(),
            },
          ]}
        >
          <View style={styles.toastContent}>
            <View style={styles.iconContainer}>{getIcon()}</View>
            <View style={styles.textContainer}>
              {title ? <Text style={styles.titleText}>{title}</Text> : null}
              <Text style={styles.messageText}>{message}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeButton} activeOpacity={0.7}>
              <X color="rgba(255, 255, 255, 0.5)" size={16} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  messageText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
