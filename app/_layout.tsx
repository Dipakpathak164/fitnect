import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { ToastProvider, useToast } from '../components/Toast';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000', // Set to black to prevent slate blue background showing during keyboard resize
  },
};

function InnerLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const { isResettingPassword } = useToast();

  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      try {
        if (!url) return;
        let paramsString = url.split('#')[1];
        if (!paramsString) {
          paramsString = url.split('?')[1];
        }
        if (paramsString) {
          const params = Object.fromEntries(new URLSearchParams(paramsString));
          const { access_token, refresh_token } = params;
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (error) {
              console.error('Error setting session from deep link:', error.message);
            }
          }
        }
      } catch (err) {
        console.error('Deep link handling error:', err);
      }
    };

    // Get initial URL if app was opened via a link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    }).catch((err) => console.error('getInitialURL error:', err));

    // Listen for incoming URLs while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error('getSession error:', err);
      setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access tabs
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup && !isResettingPassword) {
      // Redirect to dashboard if authenticated, trying to access login, and not resetting password
      router.replace('/(tabs)');
    }
  }, [session, segments, loading, isResettingPassword]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomDarkTheme}>
      <ToastProvider>
        <InnerLayout />
      </ToastProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Slate 900
  },
});
