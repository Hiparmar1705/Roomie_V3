import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../shared/constants/colors';

function SupportItem({ icon, title, description, onPress }) {
  return (
    <TouchableOpacity style={styles.supportItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primaryDark} />
      </View>
      <View style={styles.supportCopy}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SupportScreen() {
  const showDemoAlert = (title) => {
    // support actions are placeholders until a real support channel exists
    Alert.alert(title, 'This is a frontend demo support option. Backend/helpdesk wiring can be added later.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Support</Text>
        <Text style={styles.title}>Customer Support</Text>
        <Text style={styles.subtitle}>Need help with listings, messages, or your account? Start from one of these options.</Text>

        <View style={styles.card}>
          <SupportItem
            icon="mail-outline"
            title="Email Support"
            description="Reach out for account and listing questions."
            onPress={() => showDemoAlert('Email Support')}
          />
          <SupportItem
            icon="chatbox-ellipses-outline"
            title="Active Chat Request"
            description="Open a demo support request for fast help."
            onPress={() => showDemoAlert('Active Chat Request')}
          />
          <SupportItem
            icon="help-circle-outline"
            title="FAQ & Guidance"
            description="Review quick answers to common Roomie questions."
            onPress={() => showDemoAlert('FAQ & Guidance')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 10,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportCopy: {
    flex: 1,
    paddingRight: 10,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  supportDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
