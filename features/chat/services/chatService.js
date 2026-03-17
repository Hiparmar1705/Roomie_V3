const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// demo conversations live here until backend chat is added
let mockConversations = [
  {
    id: 'c1',
    listingId: '1',
    listingTitle: 'Cozy Room near UNBC',
    landlordName: 'Alex Carter',
    landlordIdentifier: '2505551098',
    updatedAt: '2026-03-12T16:40:00.000Z',
  },
  {
    id: 'c2',
    listingId: '2',
    listingTitle: 'Spacious Basement Suite',
    landlordName: 'Priya Singh',
    landlordIdentifier: '2505552331',
    updatedAt: '2026-03-10T11:15:00.000Z',
  },
];

const mockMessagesByConversation = {
  c1: [
    {
      id: 'm1',
      senderType: 'landlord',
      senderName: 'Alex Carter',
      text: 'Hi, this room is still available for April.',
      createdAt: '2026-03-12T16:30:00.000Z',
    },
    {
      id: 'm2',
      senderType: 'student',
      senderName: 'You',
      text: 'Great, can I schedule a viewing this week?',
      createdAt: '2026-03-12T16:35:00.000Z',
    },
    {
      id: 'm3',
      senderType: 'landlord',
      senderName: 'Alex Carter',
      text: 'Yes, Thursday evening works.',
      createdAt: '2026-03-12T16:40:00.000Z',
    },
  ],
  c2: [
    {
      id: 'm4',
      senderType: 'landlord',
      senderName: 'Priya Singh',
      text: 'The suite includes laundry and internet.',
      createdAt: '2026-03-10T11:05:00.000Z',
    },
    {
      id: 'm5',
      senderType: 'student',
      senderName: 'You',
      text: 'Thanks for sharing. I will confirm by tonight.',
      createdAt: '2026-03-10T11:15:00.000Z',
    },
  ],
};

const buildUserKey = (user) => {
  if (!user?.identifier || !user?.role) {
    return null;
  }

  return `${user.role}:${user.identifier}`;
};

const findConversationByListingAndUser = ({ listingId, requesterIdentifier }) =>
  mockConversations.find(
    (conversation) =>
      conversation.listingId === listingId &&
      conversation.requesterIdentifier === requesterIdentifier
  );

export const getConversations = async (user) => {
  await delay();
  const currentIdentifier = user?.identifier;

  // seeded conversations stay visible, while student-made ones are scoped per requester
  return mockConversations
    .filter(
      (conversation) =>
        !conversation.requesterIdentifier || conversation.requesterIdentifier === currentIdentifier
    )
    .map((conversation) => {
      const messages = mockMessagesByConversation[conversation.id] || [];
      const lastMessage = messages[messages.length - 1];
      return {
        ...conversation,
        lastMessageText: lastMessage?.text || 'No messages yet.',
        lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
      };
    })
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
};

export const getConversationById = async (conversationId, user) => {
  await delay(60);
  const conversation = mockConversations.find(
    (item) =>
      item.id === conversationId &&
      (!item.requesterIdentifier || item.requesterIdentifier === user?.identifier)
  );
  return conversation ? { ...conversation } : null;
};

export const getMessages = async (conversationId, user) => {
  await delay(80);
  const conversation = mockConversations.find((item) => item.id === conversationId);
  if (!conversation || (conversation.requesterIdentifier && conversation.requesterIdentifier !== user?.identifier)) {
    return [];
  }

  return (mockMessagesByConversation[conversationId] || []).map((item) => ({ ...item }));
};

export const ensureConversationForListing = async ({
  listingId,
  listingTitle,
  landlordName,
  landlordIdentifier,
  requesterIdentifier,
}) => {
  await delay(60);

  const existing = findConversationByListingAndUser({ listingId, requesterIdentifier });
  if (existing) {
    return { ...existing };
  }

  // create the chat the first time a student taps contact landlord
  const newConversationId = `c${Date.now()}`;
  const newConversation = {
    id: newConversationId,
    listingId,
    listingTitle,
    landlordName,
    landlordIdentifier,
    requesterIdentifier,
    updatedAt: new Date().toISOString(),
  };

  mockConversations = [newConversation, ...mockConversations];
  mockMessagesByConversation[newConversationId] = [
    {
      id: `m${Date.now()}`,
      senderType: 'system',
      senderName: 'Roomie',
      text: `Conversation started for "${listingTitle}". Demo messaging is enabled on the frontend.`,
      createdAt: new Date().toISOString(),
    },
  ];

  return { ...newConversation };
};

export const sendMessage = async ({ conversationId, text, user }) => {
  await delay(60);

  const trimmedText = text.trim();
  if (!trimmedText) {
    return null;
  }

  const conversation = mockConversations.find(
    (item) =>
      item.id === conversationId &&
      (!item.requesterIdentifier || item.requesterIdentifier === user?.identifier)
  );

  if (!conversation) {
    return null;
  }

  const createdMessage = {
    id: `m${Date.now()}`,
    senderType: user?.role === 'Landlord' ? 'landlord' : 'student',
    senderName: user?.displayName || 'You',
    text: trimmedText,
    createdAt: new Date().toISOString(),
    createdByKey: buildUserKey(user),
  };

  // push the message into the same in-memory thread so chat list and room stay in sync
  const nextMessages = [...(mockMessagesByConversation[conversationId] || []), createdMessage];
  mockMessagesByConversation[conversationId] = nextMessages;
  conversation.updatedAt = createdMessage.createdAt;

  return { ...createdMessage };
};

export const clearChatDataForUser = async (user) => {
  await delay(40);

  const createdByKey = buildUserKey(user);
  const requesterIdentifier = user?.identifier;

  if (!createdByKey && !requesterIdentifier) {
    return;
  }

  const removableConversationIds = mockConversations
    .filter((conversation) => conversation.requesterIdentifier === requesterIdentifier)
    .map((conversation) => conversation.id);

  // remove student-started demo chats on logout so each session starts fresh
  mockConversations = mockConversations.filter(
    (conversation) => conversation.requesterIdentifier !== requesterIdentifier
  );

  removableConversationIds.forEach((conversationId) => {
    delete mockMessagesByConversation[conversationId];
  });

  Object.keys(mockMessagesByConversation).forEach((conversationId) => {
    mockMessagesByConversation[conversationId] = (mockMessagesByConversation[conversationId] || []).filter(
      (message) => message.createdByKey !== createdByKey
    );
  });
};
