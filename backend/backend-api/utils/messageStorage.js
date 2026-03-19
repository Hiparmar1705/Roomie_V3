/**
 * MESSAGE STORAGE - Database Operations for Messages
 */

const fs = require('fs').promises;
const path = require('path');

const MESSAGES_TABLE = path.join(__dirname, '../db/message.json');

const ensureDatabaseDirectory = async () => {
  const dbDir = path.dirname(MESSAGES_TABLE);
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
};

const readMessages = async () => {
  try {
    await ensureDatabaseDirectory();
    const data = await fs.readFile(MESSAGES_TABLE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeMessages = async (messages) => {
  await ensureDatabaseDirectory();
  await fs.writeFile(MESSAGES_TABLE, JSON.stringify(messages, null, 2), 'utf8');
};

const saveMessage = async (message) => {
  const messages = await readMessages();
  messages.push(message);
  await writeMessages(messages);
  return message;
};

const getMessagesByConversationId = async (conversationId) => {
  const messages = await readMessages();
  return messages.filter(message => message.conversationId === conversationId);
};

const getMessagesByUserKey = async (createdByKey) => {
  const messages = await readMessages();
  return messages.filter(message => message.createdByKey === createdByKey);
};

const deleteMessagesByUserKey = async (createdByKey) => {
  const messages = await readMessages();
  const filteredMessages = messages.filter(message => message.createdByKey !== createdByKey);
  await writeMessages(filteredMessages);
  return messages.length - filteredMessages.length;
};

module.exports = {
  saveMessage,
  getMessagesByConversationId,
  getMessagesByUserKey,
  deleteMessagesByUserKey
};