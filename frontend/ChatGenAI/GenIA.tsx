import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SESSION_ID = 'user-123';

type MessageType = 'text' | 'image';

interface Message {
  id: number;
  role: 'user' | 'ai';
  type: MessageType;
  text: string;
}

interface ChatResponse {
  type: MessageType;
  reply: string;
}

const GenIA: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) {
      Alert.alert('Please write your message');
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await fetch('http://127.0.0.1:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: SESSION_ID,
        }),
      });

      const data: ChatResponse = await res.json();

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        type: data.type,
        text: data.reply,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sending message');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.input}
          />

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>

        <FlatList<Message>
          data={messages}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBox,
                {
                  alignSelf:
                    item.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor:
                    item.role === 'user' ? '#DCF8C6' : '#EEE',
                },
              ]}
            >
              {item.type === 'text' && <Text>{item.text}</Text>}

              {item.type === 'image' && (
                <Image source={{ uri: item.text }} style={styles.image} />
              )}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default GenIA;


const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  sendButton: {
    width: '20%',
    height: 38,
    backgroundColor: '#cf2e2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    borderRadius: 10,
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageBox: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
});
