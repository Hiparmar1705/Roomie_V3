import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../shared/constants/colors';
import MessageBubble from '../components/MessageBubble';
import * as chatService from '../services/chatService';
import CustomButton from '../../../shared/components/CustomButton';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ChatScreen({ route }) {
  const { conversationId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversation = async () => {
    // load both the chat shell and the message list together for one screen refresh
    const [conversationResponse, messagesResponse] = await Promise.all([
      chatService.getConversationById(conversationId, user),
      chatService.getMessages(conversationId, user),
    ]);

    setConversation(conversationResponse);
    setMessages(messagesResponse);
  };

  useEffect(() => {
    loadConversation();
  }, [conversationId, user]);

  const handleSend = async () => {
    if (!draft.trim()) {
      return;
    }

    setSending(true);
    await chatService.sendMessage({
      conversationId,
      text: draft,
      user,
    });
    setDraft('');
    setSending(false);
    // reload after sending so the demo behaves like a tiny realtime loop
    loadConversation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listing}>{conversation?.listingTitle || 'Conversation'}</Text>
        <Text style={styles.readOnly}>Demo messaging is enabled on the frontend.</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.composer}>
        <View style={styles.inputWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Send a demo message..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
          />
        </View>
        <CustomButton
          title={sending ? 'Sending...' : 'Send'}
          onPress={handleSend}
          disabled={sending || !draft.trim()}
          style={styles.sendButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  listing: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  readOnly: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  sendButton: {
    height: 48,
    borderRadius: 14,
  },
});
