/**
 * CONVERSATION STORAGE - Database Operations for Conversations
 */

const fs = require('fs').promises;
const path = require('path');

const CONVERSATIONS_TABLE = path.join(__dirname, '../db/conversation.json');

const ensureDatabaseDirectory = async () => {
  const dbDir = path.dirname(CONVERSATIONS_TABLE);
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
};

const readConversations = async () => {
  try {
    await ensureDatabaseDirectory();
    const data = await fs.readFile(CONVERSATIONS_TABLE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeConversations = async (conversations) => {
  await ensureDatabaseDirectory();
  await fs.writeFile(CONVERSATIONS_TABLE, JSON.stringify(conversations, null, 2), 'utf8');
};

const saveConversation = async (conversation) => {
  const conversations = await readConversations();
  conversations.push(conversation);
  await writeConversations(conversations);
  return conversation;
};

const findConversationById = async (id) => {
  const conversations = await readConversations();
  return conversations.find(conversation => conversation.id === id);
};

const findConversationByListingAndRequester = async (listingId, requesterIdentifier) => {
  const conversations = await readConversations();
  return conversations.find(conversation => 
    conversation.listingId === listingId && 
    conversation.requesterIdentifier === requesterIdentifier
  );
};

const getConversationsByUserIdentifier = async (userIdentifier) => {
  const conversations = await readConversations();
  return conversations.filter(conversation => 
    !conversation.requesterIdentifier || 
    conversation.requesterIdentifier === userIdentifier ||
    conversation.landlordIdentifier === userIdentifier
  );
};

const updateConversation = async (id, updates) => {
  const conversations = await readConversations();
  const conversationIndex = conversations.findIndex(conversation => conversation.id === id);
  if (conversationIndex === -1) {
    return null;
  }
  
  Object.keys(updates).forEach(field => {
    conversations[conversationIndex][field] = updates[field];
  });
  
  await writeConversations(conversations);
  return conversations[conversationIndex];
};

module.exports = {
  saveConversation,
  findConversationById,
  findConversationByListingAndRequester,
  getConversationsByUserIdentifier,
  updateConversation
};
