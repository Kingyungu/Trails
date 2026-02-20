import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide when you create an account (name, email address, and password), and information generated when you use the app — including GPS route data, hike statistics, photos you upload, reviews, and condition reports.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide and improve the Trails service: to show nearby trails, record your activity history, display reviews, and (if you opt in) send push notifications about trail conditions.',
  },
  {
    title: '3. Location Data',
    body: 'With your permission, we access your device location to show nearby trails and record GPS routes during hikes. Location data is only transmitted to our server when you save a completed hike. We do not track your location in the background unless you explicitly start a tracking session.',
  },
  {
    title: '4. Photos',
    body: 'Photos you upload for reviews or your profile avatar are stored on our servers and may be visible to other users. Do not upload photos containing sensitive personal information.',
  },
  {
    title: '5. Data Sharing',
    body: 'We do not sell your personal data. We do not share your data with third parties except as required to operate the service (e.g., cloud infrastructure providers) or as required by law.',
  },
  {
    title: '6. Data Retention',
    body: 'Your data is retained as long as your account is active. You may delete your account at any time from the Settings screen, which permanently removes all associated data from our systems.',
  },
  {
    title: '7. Security',
    body: 'Passwords are hashed using bcrypt and never stored in plain text. Authentication tokens are stored in your device\'s encrypted secure storage. We use HTTPS for all data in transit.',
  },
  {
    title: '8. Children',
    body: 'Trails is not directed at children under 13. We do not knowingly collect personal information from children under 13.',
  },
  {
    title: '9. Changes',
    body: 'We may update this policy from time to time. We will notify you of significant changes via the app or by email.',
  },
  {
    title: '10. Contact',
    body: 'If you have questions about this Privacy Policy, contact us at privacy@trails.app.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.updated}>Last updated: February 2026</Text>

      <Text style={styles.intro}>
        Trails ("we", "our", "us") is committed to protecting your privacy. This policy explains
        what information we collect, how we use it, and your rights regarding your data.
      </Text>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  updated: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
    marginBottom: SPACING.sm,
  },
  intro: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  sectionBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    lineHeight: 22,
  },
});
