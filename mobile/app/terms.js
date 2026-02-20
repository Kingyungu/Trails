import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const SECTIONS = [
  {
    title: '1. Acceptance',
    body: 'By using Trails, you agree to these Terms of Service. If you do not agree, do not use the app.',
  },
  {
    title: '2. Use of the Service',
    body: 'Trails is provided for personal, non-commercial use. You agree not to misuse the service — including attempting to gain unauthorised access, submitting false trail conditions, or using the app in ways that could harm other users.',
  },
  {
    title: '3. User Content',
    body: 'You are responsible for content you submit (reviews, photos, condition reports). By submitting content you grant Trails a licence to display it within the app. Do not submit content that is false, harmful, or infringes third-party rights.',
  },
  {
    title: '4. Trail Safety',
    body: 'Trail information in this app is provided for general guidance only. Conditions change rapidly. Always check official sources before a hike, carry appropriate equipment, and hike within your ability. Trails is not responsible for accidents, injuries, or losses arising from use of trail information.',
  },
  {
    title: '5. GPS Accuracy',
    body: 'GPS data is inherently approximate. Navigation features are aids, not replacements for proper maps and navigation skills. Do not rely solely on the app for safety-critical navigation.',
  },
  {
    title: '6. Account',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately if you suspect unauthorised access to your account.',
  },
  {
    title: '7. Termination',
    body: 'We reserve the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Trails is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.',
  },
  {
    title: '9. Changes',
    body: 'We may update these terms. Continued use of the app after changes constitutes acceptance of the updated terms.',
  },
  {
    title: '10. Contact',
    body: 'Questions about these Terms? Contact us at legal@trails.app.',
  },
];

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.updated}>Last updated: February 2026</Text>

      <Text style={styles.intro}>
        Please read these Terms of Service carefully before using the Trails app.
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
