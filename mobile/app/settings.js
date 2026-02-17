import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';
import useOfflineStore from '../store/offlineStore';
import { changePassword, deleteAccount } from '../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

const MAP_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'satellite', label: 'Satellite' },
  { value: 'terrain', label: 'Terrain' },
];

const UNIT_OPTIONS = [
  { value: 'km', label: 'Kilometers' },
  { value: 'mi', label: 'Miles' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, update, logout } = useAuthStore();
  const { units, mapType, notifications, setSetting, resetSettings } = useSettingsStore();
  const offlineTrails = useOfflineStore((s) => s.offlineTrails);

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Change password state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      await update({ name: trimmed });
      setEditingName(false);
    } catch {
      Alert.alert('Error', 'Could not update name');
    }
    setSavingName(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      return Alert.alert('Error', 'Please fill in all password fields');
    }
    if (newPw.length < 6) {
      return Alert.alert('Error', 'New password must be at least 6 characters');
    }
    if (newPw !== confirmPw) {
      return Alert.alert('Error', 'New passwords do not match');
    }
    setSavingPw(true);
    try {
      await changePassword(currentPw, newPw);
      Alert.alert('Success', 'Password updated');
      setShowPassword(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not change password');
    }
    setSavingPw(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await logout();
              router.replace('/');
            } catch {
              Alert.alert('Error', 'Could not delete account');
            }
          },
        },
      ],
    );
  };

  const handleClearCache = () => {
    const count = Object.keys(offlineTrails).length;
    if (count === 0) {
      return Alert.alert('Cache Empty', 'No offline trails to clear');
    }
    Alert.alert(
      'Clear Offline Cache',
      `Remove ${count} downloaded trail${count > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const { removeTrail } = useOfflineStore.getState();
            for (const id of Object.keys(offlineTrails)) {
              await removeTrail(id);
            }
            Alert.alert('Done', 'Offline cache cleared');
          },
        },
      ],
    );
  };

  const handleResetSettings = () => {
    Alert.alert('Reset Settings', 'Restore all settings to defaults?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetSettings },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── App Preferences ── */}
      <Text style={styles.sectionHeader}>APP PREFERENCES</Text>

      <View style={styles.group}>
        {/* Units */}
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="speedometer-outline" size={20} color={COLORS.systemBlue} />
          </View>
          <Text style={styles.rowLabel}>Distance Units</Text>
          <View style={styles.segmented}>
            {UNIT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segBtn, units === opt.value && styles.segBtnActive]}
                onPress={() => setSetting('units', opt.value)}
              >
                <Text style={[styles.segText, units === opt.value && styles.segTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.separator} />

        {/* Map type */}
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="map-outline" size={20} color={COLORS.systemGreen} />
          </View>
          <Text style={styles.rowLabel}>Map Type</Text>
          <View style={styles.segmented}>
            {MAP_TYPES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segBtn, mapType === opt.value && styles.segBtnActive]}
                onPress={() => setSetting('mapType', opt.value)}
              >
                <Text style={[styles.segText, mapType === opt.value && styles.segTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.separator} />

        {/* Notifications */}
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.systemRed} />
          </View>
          <Text style={[styles.rowLabel, { flex: 1 }]}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={(v) => setSetting('notifications', v)}
            trackColor={{ true: COLORS.tint }}
          />
        </View>
      </View>

      {/* ── Data & Storage ── */}
      <Text style={styles.sectionHeader}>DATA &amp; STORAGE</Text>

      <View style={styles.group}>
        <TouchableOpacity style={styles.row} onPress={handleClearCache}>
          <View style={styles.rowIcon}>
            <Ionicons name="trash-outline" size={20} color={COLORS.systemOrange} />
          </View>
          <Text style={styles.rowLabel}>Clear Offline Cache</Text>
          <Text style={styles.rowDetail}>
            {Object.keys(offlineTrails).length} trail{Object.keys(offlineTrails).length !== 1 ? 's' : ''}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.tertiaryLabel} />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleResetSettings}>
          <View style={styles.rowIcon}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.systemPurple} />
          </View>
          <Text style={styles.rowLabel}>Reset to Defaults</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.tertiaryLabel} />
        </TouchableOpacity>
      </View>

      {/* ── Account (only if logged in) ── */}
      {user && (
        <>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>

          <View style={styles.group}>
            {/* Edit name */}
            {editingName ? (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={nameValue}
                  onChangeText={setNameValue}
                  placeholder="Your name"
                  autoFocus
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName} disabled={savingName}>
                  {savingName ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditingName(false);
                    setNameValue(user.name);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.row} onPress={() => setEditingName(true)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="person-outline" size={20} color={COLORS.tint} />
                </View>
                <Text style={styles.rowLabel}>Name</Text>
                <Text style={styles.rowDetail}>{user.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.tertiaryLabel} />
              </TouchableOpacity>
            )}

            <View style={styles.separator} />

            {/* Change password (only for local accounts) */}
            {user.provider === 'local' && (
              <>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <View style={styles.rowIcon}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.systemIndigo} />
                  </View>
                  <Text style={styles.rowLabel}>Change Password</Text>
                  <Ionicons
                    name={showPassword ? 'chevron-up' : 'chevron-forward'}
                    size={18}
                    color={COLORS.tertiaryLabel}
                  />
                </TouchableOpacity>

                {showPassword && (
                  <View style={styles.passwordSection}>
                    <TextInput
                      style={styles.pwInput}
                      placeholder="Current password"
                      secureTextEntry
                      value={currentPw}
                      onChangeText={setCurrentPw}
                      placeholderTextColor={COLORS.placeholderText}
                    />
                    <TextInput
                      style={styles.pwInput}
                      placeholder="New password"
                      secureTextEntry
                      value={newPw}
                      onChangeText={setNewPw}
                      placeholderTextColor={COLORS.placeholderText}
                    />
                    <TextInput
                      style={styles.pwInput}
                      placeholder="Confirm new password"
                      secureTextEntry
                      value={confirmPw}
                      onChangeText={setConfirmPw}
                      placeholderTextColor={COLORS.placeholderText}
                    />
                    <TouchableOpacity
                      style={styles.changePwBtn}
                      onPress={handleChangePassword}
                      disabled={savingPw}
                    >
                      {savingPw ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text style={styles.changePwText}>Update Password</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.separator} />
              </>
            )}
          </View>

          {/* Danger zone */}
          <Text style={styles.sectionHeader}>DANGER ZONE</Text>

          <View style={styles.group}>
            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleDeleteAccount}>
              <View style={styles.rowIcon}>
                <Ionicons name="warning-outline" size={20} color={COLORS.systemRed} />
              </View>
              <Text style={[styles.rowLabel, { color: COLORS.systemRed }]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.tertiaryLabel} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.footer}>Trails v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  content: {
    paddingBottom: 60,
  },
  sectionHeader: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.secondaryLabel,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md + SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  group: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
    gap: SPACING.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.label,
    flex: 1,
  },
  rowDetail: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryLabel,
    marginRight: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
    marginLeft: 56,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.tertiarySystemFill,
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm - 1,
  },
  segBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.secondaryLabel,
  },
  segTextActive: {
    color: COLORS.label,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.tertiarySystemFill,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.label,
  },
  saveBtn: {
    backgroundColor: COLORS.tint,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveBtnText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  cancelBtnText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.systemRed,
  },
  passwordSection: {
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  pwInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.tertiarySystemFill,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.label,
  },
  changePwBtn: {
    backgroundColor: COLORS.systemIndigo,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  changePwText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
  footer: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.tertiaryLabel,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
