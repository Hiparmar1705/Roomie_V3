/**
 * LISTING STORAGE - Database Operations for Listings
 */

const fs = require('fs').promises;
const path = require('path');

const LISTINGS_TABLE = path.join(__dirname, '../db/listing.json');

const ensureDatabaseDirectory = async () => {
  const dbDir = path.dirname(LISTINGS_TABLE);
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
};

const readListings = async () => {
  try {
    await ensureDatabaseDirectory();
    const data = await fs.readFile(LISTINGS_TABLE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeListings = async (listings) => {
  await ensureDatabaseDirectory();
  await fs.writeFile(LISTINGS_TABLE, JSON.stringify(listings, null, 2), 'utf8');
};

const saveListing = async (listing) => {
  const listings = await readListings();
  listings.push(listing);
  await writeListings(listings);
  return listing;
};

const findListingById = async (id) => {
  const listings = await readListings();
  return listings.find(listing => listing.id === id);
};

const getAllListings = async () => {
  return await readListings();
};

const getListingsByUserKey = async (createdByKey) => {
  const listings = await readListings();
  return listings.filter(listing => listing.createdByKey === createdByKey);
};

const updateListing = async (id, updates) => {
  const listings = await readListings();
  const listingIndex = listings.findIndex(listing => listing.id === id);
  if (listingIndex === -1) {
    return null;
  }
  
  const allowedFields = ['title', 'price', 'priceAmount', 'imageUrl', 'type', 'description', 'location', 'distanceKm', 'landlordName', 'landlordIdentifier'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      listings[listingIndex][field] = updates[field];
    }
  });
  
  await writeListings(listings);
  return listings[listingIndex];
};

const deleteListingsByUserKey = async (createdByKey) => {
  const listings = await readListings();
  const filteredListings = listings.filter(listing => listing.createdByKey !== createdByKey);
  await writeListings(filteredListings);
  return listings.length - filteredListings.length;
};

module.exports = {
  saveListing,
  findListingById,
  getAllListings,
  getListingsByUserKey,
  updateListing,
  deleteListingsByUserKey
};