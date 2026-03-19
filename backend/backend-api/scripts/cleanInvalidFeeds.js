/**
 * Script to clean feeds with invalid image URLs
 * Removes feeds where:
 * - image field is missing
 * - image is empty string
 * - image is not a valid URL format
 * - image URL is from example.com (placeholder)
 */

const fs = require('fs').promises;
const path = require('path');

const FEEDS_FILE = path.join(__dirname, '../db/feed.json');

/**
 * Check if a URL is valid format
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    // Must be http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // Check if it's a placeholder/example URL
    if (urlObj.hostname.includes('example.com')) {
      return false;
    }
    return true;
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

async function cleanFeeds() {
  try {
    console.log('Reading feeds file...');
    const data = await fs.readFile(FEEDS_FILE, 'utf8');
    const feeds = JSON.parse(data);
    
    console.log(`Total feeds before cleaning: ${feeds.length}`);
    
    // Filter out feeds with invalid image URLs
    const validFeeds = feeds.filter(feed => {
      const image = feed.image;
      
      if (!isValidUrl(image)) {
        console.log(`Removing feed ID ${feed.id}: Invalid image URL - ${image || 'missing'}`);
        return false;
      }
      
      return true;
    });
    
    const removedCount = feeds.length - validFeeds.length;
    
    console.log(`Removed ${removedCount} feeds with invalid images`);
    console.log(`Valid feeds remaining: ${validFeeds.length}`);
    
    // Write cleaned feeds back to file
    await fs.writeFile(FEEDS_FILE, JSON.stringify(validFeeds, null, 2), 'utf8');
    
    console.log('✅ Feeds cleaned successfully!');
    
    return {
      total: feeds.length,
      removed: removedCount,
      remaining: validFeeds.length
    };
  } catch (error) {
    console.error('❌ Error cleaning feeds:', error);
    throw error;
  }
}

// Run the script
cleanFeeds()
  .then(result => {
    console.log('\n📊 Summary:');
    console.log(`   Total: ${result.total}`);
    console.log(`   Removed: ${result.removed}`);
    console.log(`   Remaining: ${result.remaining}`);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
