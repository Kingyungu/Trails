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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = name.length >= 2 && email.includes('@') && password.length >= 6;

  const handleRegister = async () => {
    if (!isValid) return;
    setLoading(true);
    const success = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (success) router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Ionicons name="leaf" size={48} color={COLORS.tint} />
        <Text style={styles.title}>Join Trails</Text>
        <Text style={styles.subtitle}>Create an account to explore Kenya's trails</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={COLORS.systemRed} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={20} color={COLORS.secondaryLabel} />
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.placeholderText}
            value={name}
            onChangeText={(t) => { setName(t); clearError(); }}
          />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={COLORS.secondaryLabel} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.placeholderText}
            value={email}
            onChangeText={(t) => { setEmail(t); clearError(); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondaryLabel} />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={COLORS.placeholderText}
            value={password}
            onChangeText={(t) => { setPassword(t); clearError(); }}
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
          style={[styles.btn, !isValid && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading || !isValid}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.linkText}>Already have an account? </Text>
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
});
