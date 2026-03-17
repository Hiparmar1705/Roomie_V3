import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../../auth/hooks/useAuth';
import * as chatService from '../../chat/services/chatService';
import * as listingService from '../services/listingService';
import { STACK_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLES } from '../../../shared/constants/roles';

export default function DetailScreen({ route, navigation }) {
  const { room } = route.params;
  const { user } = useAuth();
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!isStudent) {
        setIsFavorite(false);
        return;
      }

      const favorite = await listingService.isFavorite(room.id, user);
      setIsFavorite(favorite);
    };

    loadFavoriteStatus();
  }, [isStudent, room.id, user]);

  const openMap = () => {
    // maps opens outside the app so we keep this dead simple
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.location)}`;
    Linking.openURL(url);
  };

  const handleToggleFavorite = async () => {
    if (!isStudent) {
      return;
    }

    const nextFavorite = await listingService.toggleFavorite(room.id, user);
    setIsFavorite(nextFavorite);
  };

  const handleContactLandlord = async () => {
    // first tap creates a demo conversation if one does not exist yet
    const conversation = await chatService.ensureConversationForListing({
      listingId: room.id,
      listingTitle: room.title,
      landlordName: room.landlordName,
      landlordIdentifier: room.landlordIdentifier,
      requesterIdentifier: user?.identifier || 'guest',
    });

    if (!conversation) {
      Alert.alert('Unable to open chat', 'Please try again.');
      return;
    }

    navigation.navigate(STACK_ROUTES.CHAT_ROOM, {
      conversationId: conversation.id,
      landlordName: conversation.landlordName,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: room.imageUrl }} style={styles.image} />
      {isStudent && (
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isFavorite ? colors.primaryDark : colors.textSecondary}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>Listing Details</Text>
          <Text style={styles.kicker}>{room.type}</Text>
        </View>
        <Text style={styles.price}>{room.price}</Text>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.meta}>{`${room.type} • ${room.distanceKm} km from UNBC`}</Text>
        <Text style={styles.location}>{room.location}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{room.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord</Text>
          <Text style={styles.landlord}>{room.landlordName}</Text>
        </View>

        <TouchableOpacity style={styles.mapButton} onPress={openMap}>
          <Ionicons name="location" size={20} color={colors.white} />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>

        <CustomButton title="Contact Landlord" onPress={handleContactLandlord} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  image: { width: '100%', height: 250 },
  favoriteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  kickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  price: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  title: { fontSize: 22, fontWeight: '600', marginVertical: 8, color: colors.textPrimary },
  meta: { fontSize: 14, color: colors.textSecondary },
  location: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  section: { marginVertical: 18 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.textPrimary },
  desc: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  landlord: { fontSize: 16, color: colors.textPrimary },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapButtonText: { color: colors.white, fontWeight: 'bold', marginLeft: 10 },
});
