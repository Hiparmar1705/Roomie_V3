import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../../auth/hooks/useAuth';
import * as listingService from '../services/listingService';
import { sanitizePhone, validateListingForm } from '../../../shared/utils/validation';
import { ROOM_TYPES } from '../constants/listings';
import { USER_ROLES } from '../../../shared/constants/roles';

export default function AddScreen() {
  const { user } = useAuth();
  const isLandlord = user?.role === USER_ROLES.LANDLORD;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState(ROOM_TYPES.SHARED);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setType(ROOM_TYPES.SHARED);
    setDescription('');
    setLocation('');
    setDistanceKm('');
    setSelectedImage(null);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCreateListing = async () => {
    // keep the payload close to the form fields so this screen is easy to trace
    const payload = {
      title,
      price,
      type,
      description,
      location,
      distanceKm,
      imageUrl: selectedImage,
    };

    const validation = validateListingForm(payload);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    setSubmitting(true);
    // this posts into the frontend mock store, not a real backend yet
    await listingService.createListing({
      ...payload,
      landlordName: user?.displayName || 'Landlord',
      landlordIdentifier: user?.role === USER_ROLES.LANDLORD ? sanitizePhone(user.identifier) : '0000000000',
      createdByIdentifier: user?.identifier,
      createdByRole: user?.role,
    });
    setSubmitting(false);

    Alert.alert('Listing Posted', 'Your listing is now available in Home.');
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Create</Text>
        <Text style={styles.title}>Post a listing</Text>
        <Text style={styles.subtitle}>
          Share the essentials students care about most: price, location, commute, and photos.
        </Text>

        {!isLandlord ? (
          <View style={styles.studentNotice}>
            <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
            <Text style={styles.studentNoticeTitle}>Listing creation is for landlords</Text>
            <Text style={styles.studentNoticeText}>
              Students can browse, save, and message about listings, but only landlord accounts can post them.
            </Text>
          </View>
        ) : (
          <View style={styles.formCard}>
            {/* landlords can type the room type directly for flexibility during demos */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Cozy room near campus"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Price (monthly CAD)</Text>
            <TextInput
              style={styles.input}
              placeholder="650"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Room Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Shared, Private Room, Basement, Full Suite"
              placeholderTextColor={colors.textMuted}
              value={type}
              onChangeText={setType}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Describe amenities, lease details, and move-in date."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="College Heights, Prince George"
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Distance from UNBC (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="2.5"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={distanceKm}
              onChangeText={setDistanceKm}
            />

            <CustomButton title="Upload Photo" variant="outline" onPress={pickImage} style={styles.uploadButton} />

            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={28} color={colors.textMuted} />
                <Text style={styles.placeholderImageText}>No photo selected yet</Text>
              </View>
            )}

            <CustomButton
              title={submitting ? 'Posting...' : 'Post Listing'}
              onPress={handleCreateListing}
              disabled={submitting}
              style={styles.submitButton}
            />
          </View>
        )}
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
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
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
    marginBottom: 8,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
  },
  studentNotice: {
    backgroundColor: colors.primarySoft,
    borderRadius: 22,
    padding: 20,
  },
  studentNoticeTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  studentNoticeText: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  uploadButton: {
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 16,
  },
  placeholderImage: {
    height: 170,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderImageText: {
    marginTop: 8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 4,
    height: 54,
    borderRadius: 14,
  },
});
