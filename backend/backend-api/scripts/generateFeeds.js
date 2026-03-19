const fs = require('fs').promises;
const path = require('path');

const names = [
  "Alex Morgan", "Blake Cooper", "Casey Kim", "Drew Parker", "Eva Santos",
  "Finn O'Brien", "Grace Liu", "Hannah Wright", "Ian Foster", "Jade Rivera",
  "Kai Nakamura", "Luna Patel", "Maya Singh", "Noah Bennett", "Owen Clark",
  "Piper Davis", "Quinn Evans", "Riley Garcia", "Sage Harris", "Tyler Jackson",
  "Uma Khan", "Vera Lewis", "Will Mitchell", "Xara Nguyen", "Yuki Park",
  "Zoe Ramirez", "Aria Stewart", "Blake Turner", "Cora White", "Dex Young",
  "Ella Zhang", "Felix Adams", "Gia Baker", "Hugo Carter", "Iris Diaz",
  "Jax Edwards", "Kira Flores", "Leo Green", "Mia Hall", "Nico Irwin",
  "Olive Jones", "Pax Kelly", "Quinn Lee", "Remy Martinez", "Sage Nelson",
  "Tess O'Connor", "Uriah Perez", "Violet Quinn", "Wren Roberts", "Xara Smith",
  "Yara Taylor", "Zane Underwood", "Ava Vega", "Ben Wallace", "Cleo Xavier",
  "Dane York", "Echo Zane", "Faye Abbott", "Gus Bell", "Hope Cross",
  "Ivy Dale", "Jett Ellis", "Kora Fox", "Lane Grant", "Mira Hill",
  "Nova Ingram", "Onyx James", "Pia King", "Quinn Lane", "Rex Moore",
  "Sia North", "Tate Owens", "Uma Price", "Vex Reed", "Willa Scott",
  "Xara Tate", "Yuki Vance", "Zara Wells", "Ace York", "Bree Zane",
  "Cade Allen", "Dove Bell", "Eve Cross", "Fox Dale", "Gale Ellis",
  "Hope Fox", "Iris Grant", "Jade Hill", "Kai Ingram", "Luna James",
  "Maya King", "Noah Lane", "Owen Moore", "Piper North", "Quinn Owens"
];

const topics = [
  { caption: "Morning coffee vibes", text: "Starting the day right with a perfect cup of coffee. Nothing beats the aroma of freshly brewed beans! #coffee #morning #vibes", tags: ["coffee", "morning", "vibes"] },
  { caption: "Weekend adventures", text: "Making the most of the weekend! Exploring new places and creating memories. Life is about the journey! #weekend #adventure #explore", tags: ["weekend", "adventure", "explore"] },
  { caption: "Sunset magic", text: "Golden hour never disappoints. The sky painted in hues of orange and pink is pure magic! #sunset #goldenhour #photography", tags: ["sunset", "goldenhour", "photography"] },
  { caption: "Foodie moment", text: "Delicious meal at a local restaurant. Good food, good company, good vibes! #foodie #dining #yum", tags: ["foodie", "dining", "yum"] },
  { caption: "Workout complete", text: "Just finished an amazing workout session. Feeling energized and ready to take on the day! #fitness #workout #health", tags: ["fitness", "workout", "health"] },
  { caption: "Book recommendation", text: "Just finished reading an incredible book. Highly recommend it to anyone looking for a great read! #books #reading #recommendation", tags: ["books", "reading", "recommendation"] },
  { caption: "Music discovery", text: "Found an amazing new artist today. Music has the power to change your mood instantly! #music #discovery #newartist", tags: ["music", "discovery", "newartist"] },
  { caption: "Pet love", text: "Spending quality time with my furry friend. Pets bring so much joy to our lives! #pets #love #companion", tags: ["pets", "love", "companion"] },
  { caption: "Art creation", text: "Working on a new art project. Expressing creativity is so therapeutic! #art #creative #project", tags: ["art", "creative", "project"] },
  { caption: "Garden update", text: "My plants are thriving! Gardening is such a rewarding hobby. #gardening #plants #green", tags: ["gardening", "plants", "green"] },
  { caption: "Travel memories", text: "Looking back at photos from an amazing trip. Travel opens your mind and heart! #travel #memories #wanderlust", tags: ["travel", "memories", "wanderlust"] },
  { caption: "Tech innovation", text: "Fascinated by the latest tech developments. The future is exciting! #technology #innovation #future", tags: ["technology", "innovation", "future"] },
  { caption: "Yoga session", text: "Morning yoga practice complete. Finding balance and peace within. #yoga #mindfulness #peace", tags: ["yoga", "mindfulness", "peace"] },
  { caption: "Local market", text: "Exploring the local farmers market. Fresh produce and community vibes! #market #local #fresh", tags: ["market", "local", "fresh"] },
  { caption: "Rainy day cozy", text: "Perfect weather for staying in with a good book and hot tea. Cozy vibes! #rainyday #cozy #relax", tags: ["rainyday", "cozy", "relax"] },
  { caption: "Concert night", text: "Amazing live music performance tonight! The energy was incredible! #concert #music #live", tags: ["concert", "music", "live"] },
  { caption: "Cooking experiment", text: "Tried a new recipe today. Sometimes the best meals come from experimentation! #cooking #recipe #experiment", tags: ["cooking", "recipe", "experiment"] },
  { caption: "Nature walk", text: "Long walk in nature to clear the mind. Fresh air and beautiful scenery! #nature #walk #mindfulness", tags: ["nature", "walk", "mindfulness"] },
  { caption: "Friendship moments", text: "Quality time with friends. These are the moments that matter most! #friends #qualitytime #memories", tags: ["friends", "qualitytime", "memories"] },
  { caption: "Learning journey", text: "Learning something new every day. Growth mindset is everything! #learning #growth #mindset", tags: ["learning", "growth", "mindset"] }
];

function generateUsername(name) {
  const parts = name.toLowerCase().split(' ');
  const variations = [
    `${parts[0]}_${parts[1]}`,
    `${parts[0]}${parts[1][0]}`,
    `${parts[0]}_${Math.floor(Math.random() * 1000)}`,
    `${parts[1]}_${parts[0]}`,
    `${parts[0]}${parts[1]}`
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

function generateDateTime(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  return date.toISOString();
}

async function generateFeeds() {
  const feedsFile = path.join(__dirname, '../db/feed.json');
  
  // Read existing feeds
  let existingFeeds = [];
  try {
    const data = await fs.readFile(feedsFile, 'utf8');
    existingFeeds = JSON.parse(data);
  } catch (error) {
    console.log('Creating new feeds file...');
  }

  // Generate new feeds to reach 100 total
  const needed = 100 - existingFeeds.length;
  const newFeeds = [];

  for (let i = 0; i < needed; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const id = Date.now() + i;
    const imgNum = existingFeeds.length + i + 1;
    
    newFeeds.push({
      id: id.toString(),
      avatar: `https://i.pravatar.cc/150?img=${(imgNum % 70) + 1}`,
      name: name,
      username: generateUsername(name),
      image: `https://picsum.photos/400/400?random=${imgNum}`,
      caption: topic.caption,
      text: topic.text,
      datetime: generateDateTime(Math.floor(Math.random() * 90))
    });
  }

  // Combine existing and new feeds
  const allFeeds = [...existingFeeds, ...newFeeds];

  // Write to file
  await fs.writeFile(feedsFile, JSON.stringify(allFeeds, null, 2));
  console.log(`Generated ${needed} new feeds. Total feeds: ${allFeeds.length}`);
}

generateFeeds().catch(console.error);
