import { sanitizePhone } from '../../../shared/utils/validation';
import { ROOM_TYPES } from '../constants/listings';
import { USER_ROLES } from '../../../shared/constants/roles';
import { apiRequest } from '../../../shared/services/apiClient';

const normalizePrice = (value = '') =>
  Number(String(value).replace(/[^0-9.]/g, '')) || 0;

const normalizeIdentifierForRole = ({ identifier = '', role }) => {
  if (role === USER_ROLES.LANDLORD) {
    return sanitizePhone(identifier);
  }
  return identifier.trim().toLowerCase();
};

// this key lets us scope mock data to one user session without a backend
const buildOwnerKey = ({ identifier, role }) => {
  if (!identifier || !role) {
    return null;
  }
  return `${role}:${normalizeIdentifierForRole({ identifier, role })}`;
};

export const getListings = async () => {
  try {
    const result = await apiRequest('/listings');
    return result.data;
  } catch (error) {
    console.error('Get listings error:', error);
    throw error;
  }
};

export const getListingsCreatedByUser = async (user) => {
  try {
    const userKey = buildOwnerKey({
      identifier: user?.identifier,
      role: user?.role,
    });

    const result = await apiRequest(`/listings/user?createdByKey=${encodeURIComponent(userKey)}`);
    return result.data;
  } catch (error) {
    console.error('Get user listings error:', error);
    throw error;
  }
};

export const getListingById = async (listingId) => {
  try {
    const result = await apiRequest(`/listings/${listingId}`);
    return result.data;
  } catch (error) {
    console.error('Get listing by ID error:', error);
    throw error;
  }
};

export const createListing = async (payload) => {
  try {
    const cleanPrice = normalizePrice(payload.price);

    const listingData = {
      title: payload.title.trim(),
      price: `$${cleanPrice}/mo`,
      priceAmount: cleanPrice,
      imageUrl: payload.imageUrl,
      type: payload.type,
      description: payload.description.trim(),
      location: payload.location.trim(),
      distanceKm: Number(payload.distanceKm),
      landlordName: payload.landlordName || 'New Landlord',
      landlordIdentifier: payload.landlordIdentifier || '0000000000',
      createdByIdentifier: normalizeIdentifierForRole({
        identifier: payload.createdByIdentifier,
        role: payload.createdByRole,
      }),
      createdByRole: payload.createdByRole,
    };

    const result = await apiRequest('/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    return result.data;
  } catch (error) {
    console.error('Create listing error:', error);
    throw error;
  }
};

export const getFavoriteIds = async (user) => {
  if (!user?.identifier) {
    return [];
  }

  const result = await apiRequest(`/listings/favorites?userIdentifier=${encodeURIComponent(user.identifier)}`);
  return result.data;
};

export const toggleFavorite = async (listingId, user) => {
  if (!user?.identifier) {
    return false;
  }

  const result = await apiRequest(`/listings/${listingId}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userIdentifier: user.identifier,
    }),
  });

  return result.data.isFavorited;
};

export const isFavorite = async (listingId, user) => {
  const favoriteIds = await getFavoriteIds(user);
  return favoriteIds.includes(listingId);
};

export const getFavoriteListings = async (user) => {
  if (!user?.identifier) {
    return [];
  }

  const result = await apiRequest(
    `/listings/favorites/listings?userIdentifier=${encodeURIComponent(user.identifier)}`
  );
  return result.data;
};

export const removeListingsByUser = async (user) => {
  try {
    const userKey = buildOwnerKey({
      identifier: user?.identifier,
      role: user?.role,
    });

    const result = await apiRequest(`/listings/user?createdByKey=${encodeURIComponent(userKey)}`, {
      method: 'DELETE',
    });

    return result.message;
  } catch (error) {
    console.error('Remove listings error:', error);
    throw error;
  }
};

export const filterListings = ({ listings, search, type, maxPrice, maxDistance }) => {
  const normalizedSearch = search.trim().toLowerCase();
  const parsedMaxPrice = Number(maxPrice);
  const parsedMaxDistance = Number(maxDistance);

  // all search and filter logic stays here so screens only pass raw values in
  return listings.filter((item) => {
    const itemPrice = item.priceAmount || normalizePrice(item.price);
    // empty search should still show everything unless another filter hides it
    const matchesSearch =
      !normalizedSearch ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      (item.location || '').toLowerCase().includes(normalizedSearch) ||
      item.price.includes(normalizedSearch);

    const matchesType = type === ROOM_TYPES.ALL || item.type === type;
    const matchesPrice = !parsedMaxPrice || itemPrice <= parsedMaxPrice;
    const matchesDistance = !parsedMaxDistance || Number(item.distanceKm) <= parsedMaxDistance;

    return matchesSearch && matchesType && matchesPrice && matchesDistance;
  });
};
