import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {CloseIcon, BotIcon, SendIcon} from '../assets/dashboard/icons';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  time: string;
}

const INITIAL: Message[] = [
  {
    id: '1',
    text: "Hi! I'm OTG Assist, your support bot. How can I help you today?",
    sender: 'bot',
    time: 'now',
  },
  {
    id: '2',
    text: 'You can ask me about orders, payments, QC, dispatch, or refunds.',
    sender: 'bot',
    time: 'now',
  },
];

const botReply = (text: string): string => {
  const q = text.toLowerCase();
  if (/hi|hello|hey/.test(q)) {
    return 'Hello! What would you like help with — orders, payments, QC, or something else?';
  }
  if (/order|track/.test(q)) {
    return 'You can view and track all your orders from the Orders tab. For a specific order, open it to see status and timeline.';
  }
  if (/payment|paid|settle/.test(q)) {
    return 'Payments are settled within 7 working days after delivery. Check the Payments screen for pending and completed settlements.';
  }
  if (/refund|return/.test(q)) {
    return 'Refunds are processed within 5–7 business days after approval. Please raise an issue with the order ID so our team can review.';
  }
  if (/qc|quality/.test(q)) {
    return 'For QC uploads, open the order from the Orders screen and tap QC Upload. Make sure photos are clear and well-lit.';
  }
  if (/dispatch|delivery|ship/.test(q)) {
    return 'Once QC is approved, you can schedule dispatch from the order detail page. A driver will be auto-assigned.';
  }
  if (/invoice|bill/.test(q)) {
    return 'Invoices are generated automatically after dispatch. You can download them from the Invoices screen.';
  }
  if (/agent|human|person/.test(q)) {
    return 'Sure — a support agent will get back to you shortly. Meanwhile, you can raise an issue from the Support screen for faster tracking.';
  }
  if (/thank/.test(q)) {
    return "You're welcome! Is there anything else I can help with?";
  }
  return 'I can help with orders, payments, QC, dispatch, invoices, and refunds. A support agent will get back to you shortly if you need more detail.';
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LiveChatBotModal: React.FC<Props> = ({visible, onClose}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
    }
  }, [visible, messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text,
      sender: 'user',
      time: now,
    };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply: Message = {
        id: `b-${Date.now()}`,
        text: botReply(text),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(m => [...m, reply]);
    }, 600);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-4 bg-primary"
            style={{
              height: 64,
              paddingTop: 8,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 5,
            }}>
            <View className="flex-row items-center" style={{gap: 12}}>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{backgroundColor: '#ffe403'}}>
                <BotIcon size={22} color="#404040" />
              </View>
              <View>
                <Text
                  className="text-[16px] leading-[24px] text-white"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  OTG Assist
                </Text>
                <View className="flex-row items-center" style={{gap: 6}}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#22c55e',
                    }}
                  />
                  <Text
                    className="text-[12px] leading-[16px] text-white"
                    style={{fontFamily: 'Poppins-Regular', opacity: 0.85}}>
                    Online · Bot
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              className="w-9 h-9 items-center justify-center rounded-lg"
              activeOpacity={0.7}
              onPress={onClose}>
              <CloseIcon size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            style={{backgroundColor: '#f9fafb'}}
            contentContainerStyle={{padding: 16, gap: 12}}>
            {messages.map(m => {
              const isBot = m.sender === 'bot';
              return (
                <View
                  key={m.id}
                  className="flex-row"
                  style={{
                    justifyContent: isBot ? 'flex-start' : 'flex-end',
                  }}>
                  {isBot && (
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-2"
                      style={{backgroundColor: '#ffe403'}}>
                      <BotIcon size={18} color="#404040" />
                    </View>
                  )}
                  <View
                    className="rounded-2xl px-4 py-3"
                    style={{
                      maxWidth: '75%',
                      backgroundColor: isBot ? '#fff' : '#404040',
                      borderWidth: isBot ? 1 : 0,
                      borderColor: '#e5e7eb',
                      borderTopLeftRadius: isBot ? 4 : 16,
                      borderTopRightRadius: isBot ? 16 : 4,
                    }}>
                    <Text
                      className="text-[14px] leading-[20px]"
                      style={{
                        fontFamily: 'Poppins-Regular',
                        color: isBot ? '#404040' : '#fff',
                      }}>
                      {m.text}
                    </Text>
                    <Text
                      className="text-[10px] leading-[14px] mt-1"
                      style={{
                        fontFamily: 'Poppins-Regular',
                        color: isBot ? '#9ca3af' : 'rgba(255,255,255,0.7)',
                        textAlign: isBot ? 'left' : 'right',
                      }}>
                      {m.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Input */}
          <View
            className="flex-row items-center px-4 py-3 bg-white"
            style={{
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              gap: 8,
            }}>
            <View
              className="flex-1 flex-row items-center rounded-full px-4"
              style={{
                height: 44,
                backgroundColor: '#f3f4f6',
              }}>
              <TextInput
                className="flex-1 text-[14px] text-primary"
                style={{fontFamily: 'Poppins-Regular', height: 44}}
                placeholder="Type a message..."
                placeholderTextColor="#9ca3af"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={send}
                returnKeyType="send"
              />
            </View>
            <TouchableOpacity
              className="w-11 h-11 items-center justify-center rounded-full"
              style={{backgroundColor: '#ffe403'}}
              activeOpacity={0.8}
              onPress={send}>
              <SendIcon size={20} color="#404040" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LiveChatBotModal;
