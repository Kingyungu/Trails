import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useSubscriptionStore from '../store/subscriptionStore';
import useAuthStore from '../store/authStore';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 'KES 299',
    period: '/month',
    tag: null,
  },
  {
    id: 'annual',
    label: 'Annual',
    price: 'KES 2,499',
    period: '/year',
    tag: 'Save 30%',
  },
];

const PREMIUM_FEATURES = [
  { icon: 'navigate', label: 'GPS Trail Tracking', desc: 'Record hikes with live route, distance & stats' },
  { icon: 'map', label: 'Turn-by-turn Navigation', desc: 'Guided hiking with off-route alerts' },
  { icon: 'cloud-download', label: 'Offline Maps', desc: 'Download trails for areas without signal' },
  { icon: 'time', label: 'Activity History', desc: 'Save & review all your completed hikes' },
  { icon: 'trending-up', label: 'Elevation Profiles', desc: 'Detailed elevation charts for every trail' },
  { icon: 'partly-sunny', label: 'Weather Forecasts', desc: 'Live weather at trail locations' },
  { icon: 'star', label: 'Write Reviews', desc: 'Share your experience with the community' },
  { icon: 'alert-circle', label: 'Condition Reports', desc: 'Keep hikers informed about trail conditions' },
];

const POLL_INTERVAL = 4000; // 4 seconds
const MAX_POLLS = 15; // give up after 60s

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { subscribed, plan: activePlan, endDate, subscribe, verify, paymentLoading } =
    useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('plans'); // 'plans' | 'payment' | 'polling' | 'success'
  const [pollCount, setPollCount] = useState(0);
  const [checkoutId, setCheckoutId] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (subscribed && step !== 'success') {
      setStep('success');
    }
  }, [subscribed]);

  const startPolling = (id) => {
    let count = 0;
    pollRef.current = setInterval(async () => {
      count++;
      setPollCount(count);
      const result = await verify(id);
      if (result.subscribed) {
        clearInterval(pollRef.current);
        setStep('success');
      } else if (result.status === 'expired' || count >= MAX_POLLS) {
        clearInterval(pollRef.current);
        Alert.alert(
          'Payment Not Confirmed',
          count >= MAX_POLLS
            ? 'We could not confirm your payment. If you completed it, please contact support.'
            : 'Your payment was cancelled or failed. Please try again.',
          [{ text: 'OK', onPress: () => setStep('payment') }]
        );
      }
    }, POLL_INTERVAL);
  };

  const handlePay = async () => {
    if (!phone.trim()) {
      Alert.alert('Phone Required', 'Enter your M-Pesa phone number.');
      return;
    }
    const result = await subscribe(phone.trim(), selectedPlan);
    if (result.success) {
      setCheckoutId(result.checkoutRequestId);
      setStep('polling');
      startPolling(result.checkoutRequestId);
    } else {
      Alert.alert('Payment Failed', result.message);
    }
  };

  // Already subscribed
  if (step === 'success' || (subscribed && step !== 'polling')) {
    const expiry = endDate ? new Date(endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
    return (
      <View style={styles.screen}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>You're Premium!</Text>
          <Text style={styles.successSubtitle}>
            All premium features are now unlocked.{expiry ? `\nActive until ${expiry}.` : ''}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Start Exploring</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Polling for payment confirmation
  if (step === 'polling') {
    return (
      <View style={styles.screen}>
        <View style={styles.successContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.pollingTitle}>Waiting for Payment</Text>
          <Text style={styles.pollingSubtitle}>
            Check your phone and enter your M-Pesa PIN to complete the payment.
          </Text>
          <View style={styles.pollingDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.dot, { opacity: pollCount % 3 === i ? 1 : 0.3 }]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => {
              clearInterval(pollRef.current);
              setStep('payment');
            }}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Phone input step
  if (step === 'payment') {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('plans')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay with M-Pesa</Text>
        </View>

        <View style={styles.paymentBody}>
          <View style={styles.mpesaCard}>
            <View style={styles.mpesaLogoRow}>
              <View style={styles.mpesaLogo}>
                <Text style={styles.mpesaLogoText}>M</Text>
              </View>
              <View>
                <Text style={styles.mpesaName}>M-Pesa</Text>
                <Text style={styles.mpesaTagline}>Lipa Na M-Pesa</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>{plan.label} Plan</Text>
              <Text style={styles.payAmount}>{plan.price}</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0712 345 678"
            placeholderTextColor={COLORS.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={13}
          />
          <Text style={styles.inputHint}>
            A payment prompt will be sent to this number. You will need to enter your M-Pesa PIN.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, paymentLoading && styles.btnDisabled]}
            onPress={handlePay}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="phone-portrait" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Send Payment Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Default: plans selection
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={['#1B4332', '#2D6A4F']} style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.heroBadgeText}>TRAILS PREMIUM</Text>
        </View>
        <Text style={styles.heroTitle}>Unlock the full{'\n'}hiking experience</Text>
        <Text style={styles.heroSubtitle}>Everything you need for safer, smarter hikes</Text>
      </LinearGradient>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>What's included</Text>
        {PREMIUM_FEATURES.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Ionicons name={f.icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Choose a plan</Text>
        {PLANS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.planCard, selectedPlan === p.id && styles.planCardSelected]}
            onPress={() => setSelectedPlan(p.id)}
          >
            <View style={styles.planLeft}>
              <View style={[styles.radio, selectedPlan === p.id && styles.radioSelected]}>
                {selectedPlan === p.id && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.planLabel, selectedPlan === p.id && styles.planLabelSelected]}>
                {p.label}
              </Text>
              {p.tag && (
                <View style={styles.planTag}>
                  <Text style={styles.planTagText}>{p.tag}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.planPrice, selectedPlan === p.id && styles.planPriceSelected]}>
              {p.price}
              <Text style={styles.planPeriod}>{p.period}</Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {user ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('payment')}>
          <Text style={styles.primaryBtnText}>Continue with M-Pesa</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryBtnText}>Sign In to Subscribe</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.legal}>
        Subscription renews automatically. Cancel anytime before renewal.
        Payment processed via M-Pesa (Safaricom).
      </Text>

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.systemBackground,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
  },
  hero: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  heroTitle: {
    ...TYPOGRAPHY.title1,
    color: '#fff',
    lineHeight: 36,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.subhead,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  featuresSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.text,
  },
  featureDesc: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textLight,
    marginTop: 2,
  },
  plansSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9F4',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  planLabel: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  planLabelSelected: {
    color: COLORS.text,
  },
  planTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  planTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  planPrice: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textLight,
  },
  planPriceSelected: {
    color: COLORS.primary,
  },
  planPeriod: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    ...TYPOGRAPHY.headline,
    color: '#fff',
  },
  legal: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textLight,
    textAlign: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    lineHeight: 16,
  },
  // Payment step
  paymentBody: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  mpesaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  mpesaLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  mpesaLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mpesaLogoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  mpesaName: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
  },
  mpesaTagline: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textLight,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: {
    ...TYPOGRAPHY.callout,
    color: COLORS.textLight,
  },
  payAmount: {
    ...TYPOGRAPHY.title3,
    color: COLORS.primary,
  },
  inputLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.systemGray6,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  inputHint: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  // Polling step
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  successIcon: {
    marginBottom: SPACING.sm,
  },
  successTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    textAlign: 'center',
  },
  successSubtitle: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  pollingTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  pollingSubtitle: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  pollingDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  cancelLink: {
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  cancelLinkText: {
    ...TYPOGRAPHY.callout,
    color: COLORS.textLight,
    textDecorationLine: 'underline',
  },
});
