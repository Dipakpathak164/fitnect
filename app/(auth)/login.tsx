import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Chrome as Google, Mail, Facebook, ArrowRight, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FitnectLogo } from '../../components/FitnectLogo';
import { useToast } from '../../components/Toast';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot_password' | 'verify_reset_otp' | 'new_password' | 'verify_signup_otp'>('signin');
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'username' | 'password' | 'newPassword' | 'otp' | null>(null);
  const insets = useSafeAreaInsets();
  
  // Ref for the hidden OTP text input
  const otpInputRef = useRef<TextInput>(null);

  // Sign In with Email & Password
  const handleSignIn = async () => {
    if (!email || !password) {
      showToast('Error', 'Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showToast('Sign In Error', error.message, 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Email, Password & Username
  const handleSignUp = async () => {
    if (!email || !password) {
      showToast('Error', 'Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        showToast('Sign Up Error', error.message, 'error');
      } else {
        setOtpCode('');
        setAuthMode('verify_signup_otp');
        showToast(
          'Registration Successful!',
          'A 6-digit verification code has been sent to your email. Please enter it to verify your account.',
          'success'
        );
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verify Sign Up Code (OTP)
  const handleVerifySignupOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      showToast('Error', 'Please enter the 6-digit verification code', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup',
      });

      if (error) {
        showToast('Verification Error', error.message, 'error');
      } else {
        showToast(
          'Email Verified!',
          'Your account has been verified successfully. Welcome to Fitnect!',
          'success'
        );
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Request Reset Password Code (OTP)
  const handleRequestReset = async () => {
    if (!email) {
      showToast('Error', 'Please enter your email address', 'error');
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = Linking.createURL('/(auth)/login');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        showToast('Error', error.message, 'error');
      } else {
        setOtpCode('');
        setAuthMode('verify_reset_otp');
        showToast(
          'Code Sent!',
          'We have sent a 6-digit recovery code to your email address.',
          'success'
        );
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verify Reset Password Code (OTP)
  const handleVerifyResetOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      showToast('Error', 'Please enter the 6-digit verification code', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'recovery',
      });

      if (error) {
        showToast('Verification Error', error.message, 'error');
      } else {
        setAuthMode('new_password');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update with New Password
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      showToast('Error', 'Please enter your new password', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        showToast('Error', error.message, 'error');
      } else {
        showToast(
          'Password Reset Complete!',
          'Your password has been updated. You are now logged in!',
          'success'
        );
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRedirect = async (url: string) => {
    const hash = url.split('#')[1];
    if (hash) {
      const params = Object.fromEntries(new URLSearchParams(hash));
      const { access_token, refresh_token } = params;
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;
      }
    }
  };

  // Google OAuth Sign-In / Sign-Up
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/(tabs)');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          await handleOAuthRedirect(result.url);
        } else {
          setLoading(false);
        }
      }
    } catch (error: any) {
      showToast('Google Auth Error', error.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  // Facebook OAuth Sign-In / Sign-Up
  const handleFacebookAuth = async () => {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/(tabs)');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          await handleOAuthRedirect(result.url);
        } else {
          setLoading(false);
        }
      }
    } catch (error: any) {
      showToast('Facebook Auth Error', error.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  // Helper to render modern 6-box OTP component
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = otpCode[i] || '';
      const isFocused = otpCode.length === i && focusedField === 'otp';
      boxes.push(
        <View 
          key={i} 
          style={[
            styles.otpBox, 
            char ? styles.otpBoxFilled : null,
            isFocused ? styles.otpBoxActive : null
          ]}
        >
          <Text style={styles.otpBoxText}>{char}</Text>
        </View>
      );
    }
    return (
      <View style={styles.otpOuterContainer}>
        <TouchableOpacity 
          style={styles.otpBoxesContainer} 
          activeOpacity={1} 
          onPress={() => otpInputRef.current?.focus()}
        >
          {boxes}
        </TouchableOpacity>
        
        {/* Hidden TextInput overlay */}
        <TextInput
          ref={otpInputRef}
          value={otpCode}
          onChangeText={setOtpCode}
          style={styles.hiddenOtpInput}
          keyboardType="number-pad"
          maxLength={6}
          onFocus={() => setFocusedField('otp')}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Workout Image */}
      <Image
        source={require('../../assets/workout_gym_woman.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      
      {/* Gradient overlay to fade background to pitch black at bottom */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.55)', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Welcome Headers */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            <FitnectLogo size={120} />
          </View>
          <Text style={styles.welcomeText}>
            {authMode === 'signup' ? 'Get Started' : 
             authMode === 'signin' ? 'Welcome Back' : 
             authMode === 'verify_signup_otp' ? 'Verify Email' : 'Reset Password'}
          </Text>
          <Text style={styles.backText}>
            {authMode === 'signup' ? 'With FITNECT' : 
             authMode === 'signin' ? 'To FITNECT' : 
             authMode === 'verify_signup_otp' ? 'For FITNECT' : 'For FITNECT'}
          </Text>
          <Text style={styles.subtext}>
            {authMode === 'signup' ? 'Create an account to track your health' : 
             authMode === 'signin' ? 'Sign In to continue your journey' : 
             authMode === 'verify_signup_otp' ? 'Enter the verification code sent to your email' : 'Recover your account access'}
          </Text>
        </View>

        {/* Glassmorphic Form Card */}
        <View style={styles.card}>
          {/* Tab Switcher */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, authMode === 'signin' && styles.activeTab]}
                onPress={() => setAuthMode('signin')}
              >
                <Text style={[styles.tabText, authMode === 'signin' && styles.activeTabText]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, authMode === 'signup' && styles.activeTab]}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={[styles.tabText, authMode === 'signup' && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Render inputs based on authMode */}
          {authMode === 'signin' && (
            <View style={styles.fieldsContainer}>
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.focusedInputWrapper]}>
                <Mail color={focusedField === 'email' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={[styles.inputWrapper, { marginTop: 16 }, focusedField === 'password' && styles.focusedInputWrapper]}>
                <Lock color={focusedField === 'password' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={securePasswordEntry}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setSecurePasswordEntry(!securePasswordEntry)}
                >
                  {securePasswordEntry ? (
                    <EyeOff color="rgba(255, 255, 255, 0.6)" size={20} />
                  ) : (
                    <Eye color="#ffffff" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotBtn}
                onPress={() => setAuthMode('forgot_password')}
              >
                <Text style={styles.forgotBtnText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {authMode === 'signup' && (
            <View style={styles.fieldsContainer}>
              <View style={[styles.inputWrapper, focusedField === 'username' && styles.focusedInputWrapper]}>
                <User color={focusedField === 'username' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={[styles.inputWrapper, { marginTop: 16 }, focusedField === 'email' && styles.focusedInputWrapper]}>
                <Mail color={focusedField === 'email' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={[styles.inputWrapper, { marginTop: 16 }, focusedField === 'password' && styles.focusedInputWrapper]}>
                <Lock color={focusedField === 'password' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={securePasswordEntry}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setSecurePasswordEntry(!securePasswordEntry)}
                >
                  {securePasswordEntry ? (
                    <EyeOff color="rgba(255, 255, 255, 0.6)" size={20} />
                  ) : (
                    <Eye color="#ffffff" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {authMode === 'forgot_password' && (
            <View style={styles.fieldsContainer}>
              <Text style={styles.descriptionText}>
                Enter your email address to receive a 6-digit password reset code.
              </Text>
              
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.focusedInputWrapper]}>
                <Mail color={focusedField === 'email' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => setAuthMode('signin')}
              >
                <Text style={styles.backBtnText}>← Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {authMode === 'verify_reset_otp' && (
            <View style={styles.fieldsContainer}>
              <Text style={styles.descriptionText}>
                Enter the 6-digit recovery code sent to your email.
              </Text>

              {renderOtpBoxes()}

              <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => setAuthMode('forgot_password')}
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {authMode === 'verify_signup_otp' && (
            <View style={styles.fieldsContainer}>
              <Text style={styles.descriptionText}>
                Enter the 6-digit verification code sent to your email.
              </Text>

              {renderOtpBoxes()}

              <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={styles.backBtnText}>← Back to Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          {authMode === 'new_password' && (
            <View style={styles.fieldsContainer}>
              <Text style={styles.descriptionText}>
                Create a secure new password for your account.
              </Text>

              <View style={[styles.inputWrapper, focusedField === 'newPassword' && styles.focusedInputWrapper]}>
                <Lock color={focusedField === 'newPassword' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="New Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.input}
                  secureTextEntry={securePasswordEntry}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setSecurePasswordEntry(!securePasswordEntry)}
                >
                  {securePasswordEntry ? (
                    <EyeOff color="rgba(255, 255, 255, 0.6)" size={20} />
                  ) : (
                    <Eye color="#ffffff" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Overlapping Diamond Arrow Button */}
          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={
              authMode === 'signin' ? handleSignIn :
              authMode === 'signup' ? handleSignUp :
              authMode === 'forgot_password' ? handleRequestReset :
              authMode === 'verify_reset_otp' ? handleVerifyResetOtp :
              authMode === 'verify_signup_otp' ? handleVerifySignupOtp :
              handleUpdatePassword
            } 
            disabled={loading}
          >
            <View style={styles.submitIconContainer}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ArrowRight color="#FFFFFF" size={24} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Or sign in with divider */}
        <Text style={styles.orText}>Or sign in with</Text>

        {/* Google & Facebook Diamond Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleFacebookAuth} disabled={loading}>
            <View style={styles.socialIconContainer}>
              <Facebook color="#ffffff" size={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth} disabled={loading}>
            <View style={styles.socialIconContainer}>
              <Google color="#ffffff" size={20} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
  },
  logoWrapper: {
    marginBottom: 16,
    marginLeft: -26, // Offset the logo SVG built-in padding to align it perfectly with text
  },
  headerContainer: {
    alignSelf: 'flex-start',
    marginBottom: 44,
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  backText: {
    fontSize: 34,
    fontWeight: '300',
    color: '#ffffff',
    marginTop: 2,
  },
  subtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '500',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 64, // leave extra space for diamond button overlap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    marginBottom: 44,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    height: 58,
  },
  focusedInputWrapper: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    height: '100%',
  },
  fieldsContainer: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  activeTabText: {
    color: '#ffffff',
  },
  forgotBtn: {
    marginTop: 14,
    alignSelf: 'flex-end',
  },
  forgotBtnText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  backBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    position: 'absolute',
    bottom: -32,
    alignSelf: 'center',
    width: 64,
    height: 64,
    backgroundColor: '#D20A1E', // Logo theme red color
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#D20A1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  submitIconContainer: {
    transform: [{ rotate: '-45deg' }],
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginBottom: 20,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  socialIconContainer: {
    transform: [{ rotate: '-45deg' }],
  },
  otpOuterContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  otpBox: {
    width: 42,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  otpBoxFilled: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  otpBoxActive: {
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  otpBoxText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
    marginRight: -4,
  },
});
