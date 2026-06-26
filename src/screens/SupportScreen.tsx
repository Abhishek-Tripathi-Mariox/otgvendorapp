import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {useSidebar} from '../components/SidebarProvider';
import LiveChatBotModal from '../components/LiveChatBotModal';
import {
  MenuIcon,
  PhoneIcon,
  EmailIcon,
  ChatBubbleIcon,
  CloudUploadBigIcon,
} from '../assets/dashboard/icons';
import NotificationBell from '../components/NotificationBell';
import {
  HelpSettings,
  SupportTicket,
  createSupportTicket,
  fetchHelpSettings,
  fetchSupportTickets,
} from '../services/vendorService';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

interface SupportCardProps {
  icon: React.ReactNode;
  accent: string;
  title: string;
  primary: string;
  secondary: string;
  cta: string;
  onPress: () => void;
}

const SupportCard: React.FC<SupportCardProps> = ({
  icon,
  accent,
  title,
  primary,
  secondary,
  cta,
  onPress,
}) => (
  <View
    className="bg-white rounded-2xl p-4"
    style={{
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
      gap: 12,
    }}>
    <View className="flex-row items-center" style={{gap: 12}}>
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{backgroundColor: `${accent}22`}}>
        {icon}
      </View>
      <View style={{flex: 1, gap: 2}}>
        <Text
          className="text-[16px] leading-[24px] text-primary"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          {title}
        </Text>
        <Text
          className="text-[14px] leading-[20px]"
          style={{fontFamily: 'Poppins-SemiBold', color: accent}}>
          {primary}
        </Text>
        <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
          {secondary}
        </Text>
      </View>
    </View>
    <TouchableOpacity
      className="rounded-xl items-center justify-center"
      style={{height: 42, backgroundColor: accent}}
      activeOpacity={0.8}
      onPress={onPress}>
      <Text
        className="text-[14px] leading-[20px] text-white"
        style={{fontFamily: 'Poppins-SemiBold'}}>
        {cta}
      </Text>
    </TouchableOpacity>
  </View>
);

const ISSUE_TYPES = [
  'Payment Issue',
  'Order Dispute',
  'QC Rejection',
  'Dispatch Problem',
  'Other',
];

type TicketTab = 'All' | 'Disputes';

const STATUS_BADGE: Record<
  SupportTicket['status'],
  {label: string; bg: string; color: string}
> = {
  open: {label: 'Open', bg: 'rgba(228,135,20,0.13)', color: '#e48714'},
  in_progress: {
    label: 'In Progress',
    bg: 'rgba(33,150,243,0.13)',
    color: '#2196f3',
  },
  resolved: {
    label: 'Resolved',
    bg: 'rgba(34,197,94,0.15)',
    color: '#166534',
  },
  closed: {label: 'Closed', bg: '#e5e7eb', color: '#4a5565'},
};

const formatTicketDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Format an Indian mobile number for tel/display: returns "+91 98765 43210".
const formatPhoneDisplay = (m?: string | null): string => {
  if (!m) return '';
  const digits = String(m).replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return m;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const stripPhone = (m?: string | null): string =>
  String(m || '').replace(/\D/g, '');

const SupportScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const [chatOpen, setChatOpen] = useState(false);
  const [issueTypeOpen, setIssueTypeOpen] = useState(false);
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [fileAttached, setFileAttached] = useState(false);
  const [help, setHelp] = useState<HelpSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [ticketTab, setTicketTab] = useState<TicketTab>('All');

  const loadTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      setTicketsError(null);
      const data = await fetchSupportTickets();
      setTickets(data);
    } catch (err: any) {
      setTicketsError(
        err?.response?.data?.message || err?.message || 'Failed to load tickets',
      );
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHelp = async () => {
      try {
        const data = await fetchHelpSettings();
        if (!cancelled) setHelp(data);
      } catch {
        // fall back to defaults below
      }
    };

    loadHelp();
    loadTickets();
    return () => {
      cancelled = true;
    };
  }, [loadTickets]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadTickets();
    });
    return unsubscribe;
  }, [navigation, loadTickets]);

  const visibleTickets =
    ticketTab === 'Disputes'
      ? tickets.filter(
          t => (t.issueType || '').toLowerCase() === 'order dispute',
        )
      : tickets;

  const canSubmit = !!issueType && description.trim().length > 0 && !submitting;

  const phone = help?.mobile || '1800-123-4567';
  const phoneDisplay = formatPhoneDisplay(help?.mobile) || phone;
  const email = help?.email || 'support@otg.com';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createSupportTicket({
        issueType,
        description: description.trim(),
      });
      setIssueType('');
      setDescription('');
      setFileAttached(false);
      loadTickets();
      Alert.alert('Submitted', 'Your issue has been submitted to support.', [
        {text: 'OK'},
      ]);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Could not submit issue. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#404040"
        translucent={false}
      />

      {/* Top Bar */}
      <View
        className="flex-row items-center justify-between px-4 bg-primary"
        style={{
          height: 56,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}>
        <View className="flex-row items-center" style={{gap: 12}}>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center rounded-lg"
            activeOpacity={0.7}
            onPress={openSidebar}>
            <MenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center" style={{gap: 8}}>
            <View
              className="w-8 h-8 rounded-[10px]"
              style={{overflow: 'hidden'}}>
              <Image
                source={otgLogo}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-[16px] leading-[24px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Support
            </Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 120, gap: 16}}>
        {/* Title */}
        <View style={{gap: 4}}>
          <Text
            className="text-[22px] leading-[30px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Support & Disputes
          </Text>
          <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
            Get help from OTG support team
          </Text>
        </View>

        {/* Contact Cards */}
        <SupportCard
          icon={<PhoneIcon size={24} color="#2196f3" />}
          accent="#2196f3"
          title="Call Us"
          primary={phoneDisplay}
          secondary="Mon-Sat, 9AM - 6PM"
          cta="Call Now"
          onPress={() => Linking.openURL(`tel:${stripPhone(phone) || phone}`)}
        />
        <SupportCard
          icon={<EmailIcon size={24} color="#e48714" />}
          accent="#e48714"
          title="Email Support"
          primary={email}
          secondary="Response in 24 hours"
          cta="Send Email"
          onPress={() => Linking.openURL(`mailto:${email}`)}
        />
        <SupportCard
          icon={<ChatBubbleIcon size={24} color="#22c55e" />}
          accent="#22c55e"
          title="Live Chat"
          primary="Chat with OTG Assist"
          secondary="Instant replies · 24/7 bot"
          cta="Start Chat"
          onPress={() => setChatOpen(true)}
        />
        {help?.whatsappNumber ? (
          <SupportCard
            icon={<ChatBubbleIcon size={24} color="#25d366" />}
            accent="#25d366"
            title="WhatsApp"
            primary={formatPhoneDisplay(help.whatsappNumber)}
            secondary="Message us on WhatsApp"
            cta="Open WhatsApp"
            onPress={() =>
              Linking.openURL(`https://wa.me/91${stripPhone(help.whatsappNumber)}`)
            }
          />
        ) : null}

        {/* My Tickets / Disputes */}
        <View
          className="bg-white rounded-2xl p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 4,
            gap: 12,
          }}>
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[18px] leading-[27px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              My Tickets
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={loadTickets}>
              <Text
                className="text-[13px]"
                style={{
                  fontFamily: 'Poppins-Medium',
                  color: '#2196f3',
                }}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View
            className="flex-row rounded-xl"
            style={{backgroundColor: '#f3f4f6', padding: 4}}>
            {(['All', 'Disputes'] as TicketTab[]).map(tab => {
              const active = ticketTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  className="flex-1 items-center justify-center rounded-lg"
                  style={{
                    paddingVertical: 8,
                    backgroundColor: active ? '#fff' : 'transparent',
                  }}
                  activeOpacity={0.7}
                  onPress={() => setTicketTab(tab)}>
                  <Text
                    className="text-[13px]"
                    style={{
                      fontFamily: active
                        ? 'Poppins-SemiBold'
                        : 'Poppins-Regular',
                      color: active ? '#404040' : '#6a7282',
                    }}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          {ticketsLoading ? (
            <View className="items-center" style={{paddingVertical: 16}}>
              <ActivityIndicator color="#404040" />
            </View>
          ) : ticketsError ? (
            <View className="items-center" style={{paddingVertical: 12, gap: 6}}>
              <Text className="font-poppins-regular text-[13px] text-[#c10007] text-center">
                {ticketsError}
              </Text>
              <TouchableOpacity
                className="rounded-lg bg-primary px-3 py-2"
                activeOpacity={0.7}
                onPress={loadTickets}>
                <Text
                  className="text-white text-[12px]"
                  style={{fontFamily: 'Poppins-Medium'}}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : visibleTickets.length === 0 ? (
            <Text className="font-poppins-regular text-[13px] text-[#6a7282] text-center py-3">
              {ticketTab === 'Disputes'
                ? 'No disputes raised yet.'
                : 'No tickets yet. Raise an issue below.'}
            </Text>
          ) : (
            <View style={{gap: 10}}>
              {visibleTickets.map(ticket => {
                const badge = STATUS_BADGE[ticket.status];
                return (
                  <View
                    key={ticket._id}
                    className="rounded-xl"
                    style={{
                      backgroundColor: '#f9fafb',
                      padding: 12,
                      gap: 6,
                    }}>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-[14px] leading-[20px] text-primary"
                        style={{fontFamily: 'Poppins-SemiBold'}}>
                        {ticket.ticketCode || ticket._id.slice(-6).toUpperCase()}
                      </Text>
                      <View
                        className="rounded-full px-2 py-1"
                        style={{backgroundColor: badge.bg}}>
                        <Text
                          className="text-[11px] leading-[14px]"
                          style={{
                            fontFamily: 'Poppins-SemiBold',
                            color: badge.color,
                          }}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>
                    {ticket.issueType ? (
                      <Text
                        className="text-[12px] leading-[16px]"
                        style={{
                          fontFamily: 'Poppins-Medium',
                          color: '#4a5565',
                        }}>
                        {ticket.issueType}
                      </Text>
                    ) : null}
                    <Text
                      className="font-poppins-regular text-[13px] leading-[18px] text-[#4a5565]"
                      numberOfLines={2}>
                      {ticket.message}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="font-poppins-regular text-[11px] text-[#6a7282]">
                        {formatTicketDate(ticket.createdAt)}
                      </Text>
                      {ticket.replies && ticket.replies.length > 0 ? (
                        <Text
                          className="text-[11px]"
                          style={{
                            fontFamily: 'Poppins-Medium',
                            color: '#2196f3',
                          }}>
                          {ticket.replies.length}{' '}
                          {ticket.replies.length === 1 ? 'reply' : 'replies'}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Raise an Issue */}
        <View
          className="bg-white rounded-2xl p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 4,
            gap: 16,
          }}>
          <Text
            className="text-[18px] leading-[27px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Raise an Issue
          </Text>

          {/* Issue Type */}
          <View style={{gap: 8}}>
            <Text
              className="text-[14px] leading-[20px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Issue Type <Text style={{color: '#ef4444'}}>*</Text>
            </Text>
            <TouchableOpacity
              className="rounded-xl px-4 flex-row items-center justify-between"
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#d1d5db',
              }}
              activeOpacity={0.7}
              onPress={() => setIssueTypeOpen(v => !v)}>
              <Text
                className="text-[14px] leading-[20px]"
                style={{
                  fontFamily: 'Poppins-Regular',
                  color: issueType ? '#404040' : '#9ca3af',
                }}>
                {issueType || 'Select issue type'}
              </Text>
              <Text
                className="text-[14px]"
                style={{fontFamily: 'Poppins-SemiBold', color: '#6a7282'}}>
                {issueTypeOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {issueTypeOpen && (
              <View
                className="rounded-xl bg-white"
                style={{borderWidth: 1, borderColor: '#e5e7eb'}}>
                {ISSUE_TYPES.map((opt, idx) => (
                  <TouchableOpacity
                    key={opt}
                    className="px-4 py-3"
                    style={{
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: '#f3f4f6',
                    }}
                    activeOpacity={0.6}
                    onPress={() => {
                      setIssueType(opt);
                      setIssueTypeOpen(false);
                    }}>
                    <Text
                      className="font-poppins-regular text-[14px] leading-[20px] text-primary">
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={{gap: 8}}>
            <Text
              className="text-[14px] leading-[20px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Description <Text style={{color: '#ef4444'}}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-[14px] text-primary"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                fontFamily: 'Poppins-Regular',
                minHeight: 110,
                textAlignVertical: 'top',
              }}
              placeholder="Describe the issue in detail..."
              placeholderTextColor="#9ca3af"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Upload Proof */}
          <View style={{gap: 8}}>
            <Text
              className="text-[14px] leading-[20px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Upload Proof
            </Text>
            <TouchableOpacity
              className="rounded-xl items-center justify-center"
              style={{
                borderWidth: 1.5,
                borderColor: '#d1d5db',
                borderStyle: 'dashed',
                paddingVertical: 20,
                gap: 8,
              }}
              activeOpacity={0.7}
              onPress={() => setFileAttached(true)}>
              <CloudUploadBigIcon size={32} color="#9ca3af" />
              <Text className="font-poppins-regular text-[13px] leading-[18px] text-[#6a7282]">
                {fileAttached
                  ? '1 file attached'
                  : 'Tap to upload photo or document'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            className="rounded-xl items-center justify-center"
            style={{
              height: 50,
              backgroundColor: canSubmit ? '#ffe403' : '#fef3c7',
            }}
            disabled={!canSubmit}
            activeOpacity={0.8}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#404040" />
            ) : (
              <Text
                className="text-[15px] leading-[22px]"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  color: canSubmit ? '#404040' : '#a16207',
                }}>
                Submit Issue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <LiveChatBotModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <BottomNavBar activeTab="Home" />
    </View>
  );
};

export default SupportScreen;
