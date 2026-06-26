import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {MenuIcon} from '../assets/dashboard/icons';
import NotificationBell from '../components/NotificationBell';
import {useSidebar} from '../components/SidebarProvider';
import {
  SearchIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  CementIcon,
  SteelIcon,
  BricksIcon,
  SandIcon,
  WrenchIcon,
  ShieldIcon,
} from '../assets/inventory/icons';
import {
  fetchCategories,
  fetchInventorySummary,
  Category,
  CategorySummary,
} from '../services/catalog';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

interface PaletteEntry {
  borderColor: string;
  iconBg: string;
  barColor: string;
  Icon: React.FC<{size?: number; color?: string}>;
  iconColor: string;
}

// Curated palette matched against well-known category names. Unknown
// categories fall back to a rotating set so they all look distinct.
const KNOWN_PALETTE: Record<string, PaletteEntry> = {
  cement: {
    borderColor: '#e48714',
    iconBg: 'rgba(228,135,20,0.13)',
    barColor: '#e48714',
    Icon: CementIcon,
    iconColor: '#e48714',
  },
  steel: {
    borderColor: '#404040',
    iconBg: 'rgba(64,64,64,0.13)',
    barColor: '#404040',
    Icon: SteelIcon,
    iconColor: '#404040',
  },
  bricks: {
    borderColor: '#e48714',
    iconBg: 'rgba(228,135,20,0.13)',
    barColor: '#e48714',
    Icon: BricksIcon,
    iconColor: '#e48714',
  },
  sand: {
    borderColor: '#ffe403',
    iconBg: 'rgba(255,228,3,0.13)',
    barColor: '#ffe403',
    Icon: SandIcon,
    iconColor: '#ca8a04',
  },
  tools: {
    borderColor: '#404040',
    iconBg: 'rgba(64,64,64,0.13)',
    barColor: '#404040',
    Icon: WrenchIcon,
    iconColor: '#404040',
  },
  safety: {
    borderColor: '#e48714',
    iconBg: 'rgba(228,135,20,0.13)',
    barColor: '#e48714',
    Icon: ShieldIcon,
    iconColor: '#e48714',
  },
};

const FALLBACK_PALETTE: PaletteEntry[] = [
  KNOWN_PALETTE.cement,
  KNOWN_PALETTE.steel,
  KNOWN_PALETTE.bricks,
  KNOWN_PALETTE.sand,
  KNOWN_PALETTE.tools,
  KNOWN_PALETTE.safety,
];

const paletteFor = (name: string, index: number): PaletteEntry => {
  const key = name.toLowerCase();
  for (const known of Object.keys(KNOWN_PALETTE)) {
    if (key.includes(known)) return KNOWN_PALETTE[known];
  }
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
};

interface UICategory {
  category: Category;
  summary?: CategorySummary;
  palette: PaletteEntry;
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 5,
};

interface StatPillProps {
  label: string;
  value: number;
  bg: string;
  labelColor: string;
  valueColor: string;
}

const StatPill: React.FC<StatPillProps> = ({
  label,
  value,
  bg,
  labelColor,
  valueColor,
}) => (
  <View
    className="flex-1 rounded-xl items-center justify-center"
    style={{backgroundColor: bg, paddingVertical: 8, paddingHorizontal: 8}}>
    <Text
      className="font-poppins-regular text-[12px] leading-[16px]"
      style={{color: labelColor}}>
      {label}
    </Text>
    <Text
      className="text-[16px] leading-[24px] text-center"
      style={{fontFamily: 'Poppins-Bold', color: valueColor}}>
      {value}
    </Text>
  </View>
);

const CategoryCard: React.FC<{
  item: UICategory;
  onPress?: () => void;
}> = ({item, onPress}) => {
  const {Icon} = item.palette;
  const available = item.summary?.available ?? 0;
  const products = item.summary?.totalProducts ?? 0;
  const unit = item.summary?.unit || 'Items';
  const progress = products > 0 ? Math.min(1, available / Math.max(1, products * 10)) : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white rounded-2xl mb-4"
      style={{
        borderLeftWidth: 3.5,
        borderLeftColor: item.palette.borderColor,
        padding: 16,
        ...CARD_SHADOW,
      }}>
      {/* Header row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{gap: 12}}>
          <View
            className="items-center justify-center rounded-xl"
            style={{width: 48, height: 48, backgroundColor: item.palette.iconBg}}>
            <Icon size={24} color={item.palette.iconColor} />
          </View>
          <View>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {item.category.name}
            </Text>
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              {unit}
            </Text>
          </View>
        </View>
        <ChevronRightIcon size={24} color="#9ca3af" />
      </View>

      {/* Stat pills */}
      <View className="flex-row mt-3" style={{gap: 12}}>
        <StatPill
          label="Available"
          value={available}
          bg="#f0fdf4"
          labelColor="#008236"
          valueColor="#00a63e"
        />
        <StatPill
          label="Products"
          value={products}
          bg="#f9fafb"
          labelColor="#4a5565"
          valueColor="#404040"
        />
      </View>

      {/* Status row */}
      <View className="mt-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#4a5565]">
            Inventory Status
          </Text>
          {products > 0 && (
            <View className="flex-row items-center" style={{gap: 4}}>
              <TrendingUpIcon size={14} color="#00a63e" />
              <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#00a63e]">
                In stock
              </Text>
            </View>
          )}
        </View>
        <View
          className="w-full rounded-full overflow-hidden"
          style={{height: 8, backgroundColor: '#e5e7eb'}}>
          <View
            style={{
              height: 8,
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: item.palette.barColor,
              borderRadius: 9999,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const InventoryScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [cats, summary] = await Promise.all([
        fetchCategories(),
        fetchInventorySummary().catch(() => [] as CategorySummary[]),
      ]);
      setCategories(cats);
      setSummaries(summary);
    } catch (err: any) {
      console.log('Inventory load error:', err?.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  // Refetch when returning to screen
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => load(false));
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }, [load]);

  const uiCategories: UICategory[] = useMemo(() => {
    const byId = new Map<string, CategorySummary>();
    summaries.forEach(s => byId.set(String(s._id), s));
    return categories.map((c, idx) => ({
      category: c,
      summary: byId.get(String(c._id)),
      palette: paletteFor(c.name, idx),
    }));
  }, [categories, summaries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return uiCategories;
    return uiCategories.filter(c =>
      c.category.name.toLowerCase().includes(q),
    );
  }, [query, uiCategories]);

  const totalMaterials = summaries.reduce(
    (sum, s) => sum + (s.totalQuantity || 0),
    0,
  );

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
              Inventory
            </Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {/* Search */}
      <View
        className="bg-white px-4 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}>
        <View
          className="flex-row items-center rounded-xl"
          style={{
            height: 50,
            borderWidth: 1,
            borderColor: '#d1d5dc',
            paddingHorizontal: 12,
            gap: 10,
          }}>
          <SearchIcon size={20} color="#404040" />
          <TextInput
            className="flex-1 text-[16px] text-primary"
            style={{fontFamily: 'Poppins-Regular', padding: 0}}
            placeholder="Search categories..."
            placeholderTextColor="rgba(64,64,64,0.5)"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Summary cards */}
        <View className="flex-row mb-4" style={{gap: 12}}>
          <View
            className="flex-1 rounded-2xl"
            style={{
              backgroundColor: '#ffe403',
              paddingVertical: 16,
              paddingHorizontal: 16,
              ...CARD_SHADOW,
            }}>
            <Text
              className="text-[12px] leading-[16px] text-primary"
              style={{fontFamily: 'Poppins-Medium', opacity: 0.8}}>
              Total Categories
            </Text>
            <Text
              className="text-[30px] leading-[36px] text-primary"
              style={{fontFamily: 'Poppins-Bold'}}>
              {categories.length}
            </Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl"
            style={{
              paddingVertical: 16,
              paddingHorizontal: 16,
              ...CARD_SHADOW,
            }}>
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#4a5565]">
              Total Materials
            </Text>
            <Text
              className="text-[30px] leading-[36px] text-primary"
              style={{fontFamily: 'Poppins-Bold'}}>
              {totalMaterials}
            </Text>
          </View>
        </View>

        {/* Section heading + Add action */}
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-[18px] leading-[27px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Categories
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('AddNewMaterial')}
            className="rounded-xl items-center justify-center bg-[#e48714]"
            style={{paddingHorizontal: 12, height: 32}}>
            <Text
              className="text-[12px] leading-[16px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              + Add Material
            </Text>
          </TouchableOpacity>
        </View>

        {loading && categories.length === 0 ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#404040" />
            <Text
              className="mt-3 text-[14px] text-[#6a7282]"
              style={{fontFamily: 'Poppins-Regular'}}>
              Loading categories...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Text
              className="text-[14px] text-[#6a7282]"
              style={{fontFamily: 'Poppins-Regular'}}>
              {query ? 'No categories match your search' : 'No categories found'}
            </Text>
          </View>
        ) : (
          filtered.map(item => (
            <CategoryCard
              key={item.category._id}
              item={item}
              onPress={() =>
                navigation?.navigate('AddNewMaterial', {
                  presetCategoryId: item.category._id,
                })
              }
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Inventory" />
    </View>
  );
};

export default InventoryScreen;
