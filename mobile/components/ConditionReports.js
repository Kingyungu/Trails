import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import { getTrailConditions, reportCondition } from '../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

const STATUS_CONFIG = {
  good:      { label: 'Good',      icon: 'checkmark-circle', color: COLORS.systemGreen },
  muddy:     { label: 'Muddy',     icon: 'water',            color: COLORS.systemOrange },
  overgrown: { label: 'Overgrown', icon: 'leaf',             color: COLORS.tint },
  flooded:   { label: 'Flooded',   icon: 'rainy',            color: COLORS.systemBlue },
  icy:       { label: 'Icy',       icon: 'snow',             color: COLORS.systemTeal },
  closed:    { label: 'Closed',    icon: 'close-circle',     color: COLORS.systemRed },
  caution:   { label: 'Caution',   icon: 'warning',          color: COLORS.systemYellow },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ConditionReports({ trailId, trailName }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState({ reports: [], summary: null });
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConditions();
  }, [trailId]);

  const loadConditions = async () => {
    try {
      const { data: result } = await getTrailConditions(trailId);
      setData(result);
    } catch {
      // silent
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    setSubmitting(true);
    try {
      await reportCondition({ trail: trailId, status: selectedStatus, description });
      setShowModal(false);
      setSelectedStatus(null);
      setDescription('');
      loadConditions();
      Alert.alert('Report Submitted', 'Thanks for helping fellow hikers!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not submit report');
    }
    setSubmitting(false);
  };

  const summary = data.summary;
  const summaryConfig = summary ? STATUS_CONFIG[summary.status] : null;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Trail Conditions</Text>
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => {
            if (!user) return router.push('/auth/login');
            setShowModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={16} color={COLORS.tint} />
          <Text style={styles.reportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Summary banner */}
      {summaryConfig && (
        <View style={[styles.summaryBanner, { backgroundColor: summaryConfig.color + '18' }]}>
          <Ionicons name={summaryConfig.icon} size={20} color={summaryConfig.color} />
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryStatus, { color: summaryConfig.color }]}>
              {summaryConfig.label}
            </Text>
            <Text style={styles.summaryMeta}>
              Based on {data.totalReports} recent {data.totalReports === 1 ? 'report' : 'reports'}
            </Text>
          </View>
        </View>
      )}

      {!summary && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent condition reports</Text>
        </View>
      )}

      {/* Recent reports */}
      {data.reports.slice(0, 3).map((report) => {
        const cfg = STATUS_CONFIG[report.status];
        return (
          <View key={report._id} style={styles.reportItem}>
            <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
            <View style={styles.reportContent}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportUser}>{report.user?.name || 'Hiker'}</Text>
                <Text style={styles.reportTime}>{timeAgo(report.created_at)}</Text>
              </View>
              <Text style={styles.reportStatus}>{cfg.label}</Text>
              {report.description ? (
                <Text style={styles.reportDesc}>{report.description}</Text>
              ) : null}
            </View>
          </View>
        );
      })}

      {/* Report Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Condition</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.label} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              How are conditions on {trailName}?
            </Text>

            <View style={styles.statusGrid}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.statusOption,
                    selectedStatus === key && { backgroundColor: cfg.color + '20', borderColor: cfg.color },
                  ]}
                  onPress={() => setSelectedStatus(key)}
                >
                  <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                  <Text style={[styles.statusLabel, selectedStatus === key && { color: cfg.color, fontWeight: '600' }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.descInput}
              placeholder="Add details (optional)"
              placeholderTextColor={COLORS.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.submitBtn, !selectedStatus && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!selectedStatus || submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.label,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportBtnText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryStatus: {
    ...TYPOGRAPHY.headline,
  },
  summaryMeta: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
    marginTop: 2,
  },
  emptyState: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.tertiaryLabel,
  },
  reportItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  reportContent: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportUser: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
    color: COLORS.label,
  },
  reportTime: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.tertiaryLabel,
  },
  reportStatus: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '500',
    color: COLORS.secondaryLabel,
    marginTop: 2,
  },
  reportDesc: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
    marginTop: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.systemBackground,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.secondaryLabel,
    marginBottom: SPACING.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.separator,
    backgroundColor: COLORS.secondarySystemGroupedBackground,
  },
  statusLabel: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.label,
  },
  descInput: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.label,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  submitBtn: {
    backgroundColor: COLORS.tint,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});
