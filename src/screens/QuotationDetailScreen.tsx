import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {BackArrowIcon, StatusDot} from '../assets/orders/icons';
import {
  fetchAssignedQuotation,
  VendorQuotation,
  QuotationStatus,
} from '../services/quotations';

const STATUS_CONFIG: Record<
  QuotationStatus,
  {label: string; textColor: string; bgColor: string; dotColor: string}
> = {
  new: {
    label: 'New',
    textColor: '#1976d2',
    bgColor: 'rgba(25,118,210,0.13)',
    dotColor: '#1976d2',
  },
  quoted: {
    label: 'Quoted',
    textColor: '#e48714',
    bgColor: 'rgba(228,135,20,0.13)',
    dotColor: '#e48714',
  },
  accepted: {
    label: 'Accepted',
    textColor: '#15803d',
    bgColor: 'rgba(21,128,61,0.13)',
    dotColor: '#15803d',
  },
  rejected: {
    label: 'Rejected',
    textColor: '#b91c1c',
    bgColor: 'rgba(185,28,28,0.13)',
    dotColor: '#b91c1c',
  },
  expired: {
    label: 'Expired',
    textColor: '#6b7280',
    bgColor: 'rgba(107,114,128,0.13)',
    dotColor: '#6b7280',
  },
};

const formatINR = (n?: number | null): string =>
  n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`;

const Field: React.FC<{label: string; value?: string | null}> = ({
  label,
  value,
}) => {
  if (!value) return null;
  return (
    <View style={{marginBottom: 12}}>
      <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
        {label}
      </Text>
      <Text
        className="text-[15px] leading-[22px] text-primary"
        style={{fontFamily: 'Poppins-Medium'}}>
        {value}
      </Text>
    </View>
  );
};

const SectionCard: React.FC<{title: string; children: React.ReactNode}> = ({
  title,
  children,
}) => (
  <View
    className="bg-white rounded-2xl mb-3 px-5 pt-4 pb-4"
    style={{
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    }}>
    <Text
      className="text-[15px] leading-[22px] text-primary mb-3"
      style={{fontFamily: 'Poppins-SemiBold'}}>
      {title}
    </Text>
    {children}
  </View>
);

const QuotationDetailScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const id: string = route?.params?.id;
  const [quotation, setQuotation] = useState<VendorQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAssignedQuotation(id);
      setQuotation(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load quotation',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const config = quotation
    ? STATUS_CONFIG[quotation.status] || STATUS_CONFIG.new
    : null;

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#404040"
        translucent={false}
      />

      {/* Top Bar */}
      <View
        className="flex-row items-center px-4 bg-primary"
        style={{
          height: 56,
          gap: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}>
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center rounded-lg"
          activeOpacity={0.7}
          onPress={() => navigation?.goBack()}>
          <BackArrowIcon size={24} color="#fff" />
        </TouchableOpacity>
        <Text
          className="text-[16px] leading-[24px] text-white"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Quotation Details
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#404040" />
        </View>
      ) : error || !quotation ? (
        <View
          className="flex-1 items-center justify-center"
          style={{gap: 12, padding: 24}}>
          <Text className="font-poppins-regular text-[14px] text-[#c10007] text-center">
            {error || 'Quotation not found'}
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-4 py-2"
            activeOpacity={0.7}
            onPress={load}>
            <Text
              className="text-white text-[14px]"
              style={{fontFamily: 'Poppins-Medium'}}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          style={{backgroundColor: '#f9fafb'}}
          contentContainerStyle={{padding: 16, paddingBottom: 32}}>
          {/* Header card: code + status */}
          <View
            className="bg-white rounded-2xl mb-3 px-5 pt-4 pb-4 flex-row items-center justify-between"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 4,
            }}>
            <View>
              <Text
                className="text-[20px] leading-[28px] text-primary"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                {quotation.quotationCode}
              </Text>
              <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282] mt-1">
                Requested {new Date(quotation.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {config && (
              <View className="flex-row items-center" style={{gap: 8}}>
                <StatusDot size={10} color={config.dotColor} />
                <View
                  className="rounded-full px-3 py-1"
                  style={{backgroundColor: config.bgColor}}>
                  <Text
                    className="text-[12px] leading-[16px]"
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      color: config.textColor,
                    }}>
                    {config.label}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Customer */}
          <SectionCard title="Customer">
            <Field label="Name" value={quotation.name || quotation.user?.name} />
            <Field
              label="Type"
              value={
                quotation.customerType
                  ? quotation.customerType.charAt(0).toUpperCase() +
                    quotation.customerType.slice(1)
                  : undefined
              }
            />
            <Field label="Company" value={quotation.company} />
            {quotation.mobile ? (
              <View style={{marginBottom: 12}}>
                <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                  Mobile
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${quotation.mobile}`)}
                  activeOpacity={0.7}>
                  <Text
                    className="text-[15px] leading-[22px] text-[#1976d2]"
                    style={{fontFamily: 'Poppins-Medium'}}>
                    {quotation.mobile}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <Field label="Email" value={quotation.email} />
            <Field label="Address" value={quotation.address} />
            <Field label="Landmark" value={quotation.landmark} />
          </SectionCard>

          {/* Items */}
          <SectionCard title="Requirement">
            {Array.isArray(quotation.items) && quotation.items.length > 0 ? (
              quotation.items.map((it, idx) => (
                <View
                  key={idx}
                  className="flex-row"
                  style={{
                    paddingVertical: 8,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: '#f3f4f6',
                  }}>
                  <Text
                    className="font-poppins-regular text-[13px] text-[#9ca3af]"
                    style={{width: 22}}>
                    {idx + 1}.
                  </Text>
                  <View style={{flex: 1}}>
                    <Text
                      className="text-[14px] leading-[20px] text-primary"
                      style={{fontFamily: 'Poppins-SemiBold'}}>
                      {it.materialName ||
                        it.subCategoryName ||
                        it.categoryName ||
                        'Material'}
                    </Text>
                    {(it.categoryName || it.subCategoryName) && (
                      <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                        {[it.categoryName, it.subCategoryName]
                          .filter(Boolean)
                          .join(' › ')}
                      </Text>
                    )}
                    {it.note ? (
                      <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#4a5565] mt-1">
                        {it.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="font-poppins-regular text-[13px] text-[#4a5565] ml-2">
                    {it.quantity || '?'}
                    {it.unit ? ` ${it.unit}` : ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="font-poppins-regular text-[14px] text-[#4a5565]">
                {quotation.materialRequirement ||
                  [
                    quotation.category,
                    quotation.quantity
                      ? `${quotation.quantity}${
                          quotation.unit ? ` ${quotation.unit}` : ''
                        }`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') ||
                  'No itemised details provided.'}
              </Text>
            )}
          </SectionCard>

          {/* Admin quote */}
          {(quotation.quotedPrice != null || quotation.adminNotes) && (
            <SectionCard title="Admin Quote">
              <View style={{marginBottom: 8}}>
                <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                  Quoted Price
                </Text>
                <Text
                  className="text-[22px] leading-[30px]"
                  style={{fontFamily: 'Poppins-SemiBold', color: '#e48714'}}>
                  {formatINR(quotation.quotedPrice)}
                </Text>
              </View>
              {quotation.quotedValidTill ? (
                <Field
                  label="Valid Till"
                  value={new Date(
                    quotation.quotedValidTill,
                  ).toLocaleDateString()}
                />
              ) : null}
              <Field label="Notes" value={quotation.adminNotes} />
            </SectionCard>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default QuotationDetailScreen;
