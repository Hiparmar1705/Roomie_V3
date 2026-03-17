import { DATA } from '../data/mockProperties';
import { sanitizePhone } from '../../../shared/utils/validation';
import { ROOM_TYPES } from '../constants/listings';
import { USER_ROLES } from '../../../shared/constants/roles';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

// this is the frontend-only listing store used until real api work is plugged in
let listingStore = DATA.map((item) => ({ ...item }));
// each user gets their own saved set so students do not share bookmarks
const favoriteIdsByUserKey = new Map();

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

const getUserFavoriteSet = (user) => {
  const userKey = buildOwnerKey({
    identifier: user?.identifier,
    role: user?.role,
  });

  if (!userKey) {
    return null;
  }

  if (!favoriteIdsByUserKey.has(userKey)) {
    favoriteIdsByUserKey.set(userKey, new Set());
  }

  return favoriteIdsByUserKey.get(userKey);
};

export const getListings = async () => {
  await delay();
  return listingStore.map((item) => ({ ...item }));
};

export const getListingsCreatedByUser = async (user) => {
  await delay(40);
  const ownerKey = buildOwnerKey({
    identifier: user?.identifier,
    role: user?.role,
  });

  if (!ownerKey) {
    return [];
  }

  return listingStore
    .filter((item) => item.createdByKey === ownerKey)
    .map((item) => ({ ...item }));
};

export const getListingById = async (listingId) => {
  await delay(50);
  const listing = listingStore.find((item) => item.id === listingId);
  return listing ? { ...listing } : null;
};

export const createListing = async (payload) => {
  await delay();

  const cleanPrice = normalizePrice(payload.price);
  const createdByKey = buildOwnerKey({
    identifier: payload.createdByIdentifier,
    role: payload.createdByRole,
  });

  const listing = {
    id: String(Date.now()),
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
    createdByKey,
  };

  // new posts go to the top so landlords see them right away on home
  listingStore = [listing, ...listingStore];
  return { ...listing };
};

export const getFavoriteIds = async (user) => {
  await delay(30);
  const favoriteSet = getUserFavoriteSet(user);
  return favoriteSet ? Array.from(favoriteSet) : [];
};

export const toggleFavorite = async (listingId, user) => {
  await delay(40);
  const favoriteSet = getUserFavoriteSet(user);
  if (!favoriteSet) {
    return false;
  }

  if (favoriteSet.has(listingId)) {
    favoriteSet.delete(listingId);
    return false;
  }

  favoriteSet.add(listingId);
  return true;
};

export const isFavorite = async (listingId, user) => {
  await delay(20);
  const favoriteSet = getUserFavoriteSet(user);
  return favoriteSet ? favoriteSet.has(listingId) : false;
};

export const getFavoriteListings = async (user) => {
  await delay(50);
  const favoriteSet = getUserFavoriteSet(user);
  if (!favoriteSet) {
    return [];
  }

  return listingStore
    .filter((item) => favoriteSet.has(item.id))
    .map((item) => ({ ...item }));
};

export const removeListingsByUser = async (user) => {
  await delay(40);
  const ownerKey = buildOwnerKey({
    identifier: user?.identifier,
    role: user?.role,
  });

  if (!ownerKey) {
    return;
  }

  const removedIds = listingStore
    .filter((item) => item.createdByKey === ownerKey)
    .map((item) => item.id);

  // landlord-created demo listings disappear after that landlord logs out
  listingStore = listingStore.filter((item) => item.createdByKey !== ownerKey);

  favoriteIdsByUserKey.forEach((favoriteSet) => {
    removedIds.forEach((listingId) => {
      favoriteSet.delete(listingId);
    });
  });
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
