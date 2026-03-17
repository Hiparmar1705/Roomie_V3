import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../hooks/useAuth';
import { sanitizePhone, validateIdentifierForRole } from '../../../shared/utils/validation';
import { AUTH_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLE_OPTIONS, USER_ROLES } from '../../../shared/constants/roles';

export default function LoginScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { login } = useAuth();
  const [role, setRole] = useState(USER_ROLES.STUDENT);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // shorter phones get a tighter version of this layout so the footer action still fits
  const isCompactScreen = height < 850;

  const handleLogin = async () => {
    // validation happens here so the service can stay pretty reusable
    const validation = validateIdentifierForRole({ role, identifier });
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    setLoading(true);
    await login(identifier, role, password);
    setLoading(false);
  };

  const handleSignup = () => {
    // carry the picked role into signup so the next screen feels faster
    navigation.navigate(AUTH_ROUTES.SIGNUP, { role });
  };

  const isStudent = role === USER_ROLES.STUDENT;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbLarge} />
      <View style={styles.backgroundOrbSmall} />

      <KeyboardAvoidingView
        style={styles.keyboardShell}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isCompactScreen && styles.scrollContentCompact]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroSection, isCompactScreen && styles.heroSectionCompact]}>
            <View style={[styles.badge, isCompactScreen && styles.badgeCompact]}>
              <Ionicons name="home-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.badgeText}>Student Housing Network</Text>
            </View>

            <Text style={[styles.title, isCompactScreen && styles.titleCompact]}>Roomie</Text>
            <Text style={[styles.headline, isCompactScreen && styles.headlineCompact]}>
              Find your next room with less chaos.
            </Text>
            <Text style={[styles.subtitle, isCompactScreen && styles.subtitleCompact]}>
              Browse listings, save favorites, and connect with landlords in one place.
            </Text>
          </View>

          <View style={[styles.card, isCompactScreen && styles.cardCompact]}>
            <Text style={[styles.cardTitle, isCompactScreen && styles.cardTitleCompact]}>Welcome back</Text>
            <Text style={[styles.cardSubtitle, isCompactScreen && styles.cardSubtitleCompact]}>
              Choose your role to continue into the app.
            </Text>

            <View style={[styles.tabContainer, isCompactScreen && styles.tabContainerCompact]}>
              {USER_ROLE_OPTIONS.map((r) => {
                const selected = role === r;
                const iconName = r === USER_ROLES.STUDENT ? 'school-outline' : 'business-outline';

                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.tab, selected && styles.activeTab]}
                    onPress={() => setRole(r)}
                    activeOpacity={0.9}
                  >
                    <Ionicons
                      name={iconName}
                      size={16}
                      color={selected ? colors.white : colors.primaryDark}
                    />
                    <Text style={selected ? styles.activeTabText : styles.tabText}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* this field flips between email and phone based on the selected role */}
            <View style={[styles.inputBlock, isCompactScreen && styles.inputBlockCompact]}>
              <Text style={styles.inputLabel}>{isStudent ? 'UNBC Email' : 'Phone Number'}</Text>
              <View style={[styles.inputShell, isCompactScreen && styles.inputShellCompact]}>
                <Ionicons
                  name={isStudent ? 'mail-outline' : 'call-outline'}
                  size={18}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder={isStudent ? 'user@unbc.ca' : '2505551234'}
                  placeholderTextColor={colors.textMuted}
                  value={identifier}
                  onChangeText={(value) =>
                    setIdentifier(role === USER_ROLES.LANDLORD ? sanitizePhone(value) : value)
                  }
                  keyboardType={role === USER_ROLES.LANDLORD ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={[styles.inputBlock, isCompactScreen && styles.inputBlockCompact]}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputShell, isCompactScreen && styles.inputShellCompact]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="optional for now"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              {/* backend auth is not wired yet, so this stays optional for the demo */}
              <Text style={[styles.helperText, isCompactScreen && styles.helperTextCompact]}>
                you can still log in without entering a password in this demo.
              </Text>
            </View>

            <CustomButton
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, isCompactScreen && styles.loginButtonCompact]}
            />

            <View style={[styles.dividerContainer, isCompactScreen && styles.dividerContainerCompact]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.secondaryAction, isCompactScreen && styles.secondaryActionCompact]}
              onPress={handleSignup}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryActionText}>Create a new account</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F1',
  },
  keyboardShell: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  scrollContentCompact: {
    paddingVertical: 12,
  },
  backgroundOrbLarge: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D6E8C8',
  },
  backgroundOrbSmall: {
    position: 'absolute',
    bottom: 120,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E4F0DB',
  },
  heroSection: {
    marginBottom: 24,
  },
  heroSectionCompact: {
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E8F3DE',
    marginBottom: 16,
  },
  badgeCompact: {
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -1,
  },
  titleCompact: {
    fontSize: 34,
  },
  headline: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: 320,
  },
  headlineCompact: {
    marginTop: 6,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    maxWidth: 330,
  },
  subtitleCompact: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#17351D',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardCompact: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardTitleCompact: {
    fontSize: 20,
  },
  cardSubtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  cardSubtitleCompact: {
    marginTop: 4,
    marginBottom: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF3EA',
    borderRadius: 16,
    padding: 6,
    marginBottom: 18,
  },
  tabContainerCompact: {
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '700',
  },
  inputBlock: {
    marginBottom: 8,
  },
  inputBlockCompact: {
    marginBottom: 4,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  inputShellCompact: {
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  helperText: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  helperTextCompact: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 16,
  },
  loginButton: {
    height: 54,
    borderRadius: 14,
  },
  loginButtonCompact: {
    height: 50,
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dividerContainerCompact: {
    marginVertical: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 10, color: colors.textMuted, fontSize: 14 },
  secondaryAction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  secondaryActionCompact: {
    paddingTop: 2,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
