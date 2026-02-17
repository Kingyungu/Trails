import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { forgotPassword, resetPassword } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code + new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await forgotPassword(email.trim());
      // In dev mode, show the code in an alert
      if (data.resetCode) {
        Alert.alert('Reset Code', `Your reset code is: ${data.resetCode}`, [{ text: 'OK' }]);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await resetPassword(email.trim(), code.trim(), newPassword);
      if (data.token) {
        await SecureStore.setItemAsync('token', data.token);
        useAuthStore.getState().initialize();
      }
      Alert.alert('Success', 'Your password has been reset!', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Ionicons name="key-outline" size={48} color={COLORS.tint} />
        <Text style={styles.title}>
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your email and we\'ll send you a reset code'
            : 'Enter the code and your new password'}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={COLORS.systemRed} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        {step === 1 ? (
          <>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color={COLORS.secondaryLabel} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.placeholderText}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, !email && styles.btnDisabled]}
              onPress={handleRequestCode}
              disabled={loading || !email}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.btnText}>Send Reset Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputWrap}>
              <Ionicons name="keypad-outline" size={20} color={COLORS.secondaryLabel} />
              <TextInput
                style={styles.input}
                placeholder="Reset code"
                placeholderTextColor={COLORS.placeholderText}
                value={code}
                onChangeText={(t) => { setCode(t); setError(''); }}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondaryLabel} />
              <TextInput
                style={styles.input}
                placeholder="New password (min 6 characters)"
                placeholderTextColor={COLORS.placeholderText}
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(''); }}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.secondaryLabel}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btn, (!code || !newPassword) && styles.btnDisabled]}
              onPress={handleResetPassword}
              disabled={loading || !code || !newPassword}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.btnText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setStep(1); setError(''); }}>
              <Text style={styles.resendText}>Didn't get the code? Resend</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.back()}
        >
          <Text style={styles.linkText}>Back to </Text>
          <Text style={styles.linkBold}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.label,
    marginTop: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.systemRed,
    flex: 1,
  },
  form: {
    gap: SPACING.md,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 50,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.label,
  },
  btn: {
    backgroundColor: COLORS.tint,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  linkText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
  },
  linkBold: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.tint,
    fontWeight: '600',
  },
  resendText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.tint,
    fontWeight: '600',
    textAlign: 'center',
  },
});
