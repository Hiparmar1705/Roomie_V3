import { apiRequest } from '../../../shared/services/apiClient';

const buildUserKey = (user) => {
  if (!user?.identifier || !user?.role) {
    return null;
  }

  return `${user.role}:${user.identifier}`;
};

export const getConversations = async (user) => {
  try {
    const result = await apiRequest(`/chat/conversations?userIdentifier=${encodeURIComponent(user.identifier)}`);
    return result.data;
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
};

export const getConversationById = async (conversationId, user) => {
  try {
    const result = await apiRequest(
      `/chat/conversations/${conversationId}?userIdentifier=${encodeURIComponent(user.identifier)}`
    );
    return result.data;
  } catch (error) {
    console.error('Get conversation by ID error:', error);
    throw error;
  }
};

export const getMessages = async (conversationId, user) => {
  try {
    const result = await apiRequest(
      `/chat/conversations/${conversationId}/messages?userIdentifier=${encodeURIComponent(user.identifier)}`
    );
    return result.data;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

export const ensureConversationForListing = async ({
  listingId,
  listingTitle,
  landlordName,
  landlordIdentifier,
  requesterIdentifier,
  requesterName,
}) => {
  try {
    const result = await apiRequest('/chat/conversations/ensure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId,
        listingTitle,
        landlordName,
        landlordIdentifier,
        requesterIdentifier,
        requesterName,
      }),
    });

    return result.data;
  } catch (error) {
    console.error('Ensure conversation error:', error);
    throw error;
  }
};

export const sendMessage = async ({ conversationId, text, user }) => {
  try {
    const messageData = {
      conversationId,
      senderType: user.role === 'Landlord' ? 'landlord' : 'student',
      senderName: user.displayName || 'You',
      text: text.trim(),
      createdByKey: buildUserKey(user),
    };

    const result = await apiRequest('/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    return result.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

export const clearChatDataForUser = async (user) => {
  try {
    const userKey = buildUserKey(user);
    const result = await apiRequest(`/chat/data?userKey=${encodeURIComponent(userKey)}`, {
      method: 'DELETE',
    });

    return result.message;
  } catch (error) {
    console.error('Clear chat data error:', error);
    throw error;
  }
};
