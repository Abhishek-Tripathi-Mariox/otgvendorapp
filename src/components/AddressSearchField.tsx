import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TextInput, Pressable, ActivityIndicator} from 'react-native';

// Free, no-API-key address search via OpenStreetMap Nominatim (same provider the
// driver/customer apps use). A picked suggestion returns the full address string
// plus coordinates so the caller can store the vendor's GeoJSON location.
type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
};

export type SelectedLocation = {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  pincode?: string;
};

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectLocation?: (loc: SelectedLocation) => void;
  placeholder?: string;
  error?: string;
};

const MIN_QUERY = 3;
// Nominatim asks for <=1 request/sec; debounce keeps us well under that.
const DEBOUNCE_MS = 600;

const AddressSearchField: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  onSelectLocation,
  placeholder = 'Search your address',
  error,
}) => {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip the search on mount and right after a pick, so a pre-filled or
  // auto-filled value doesn't fire an immediate query.
  const skipNextSearch = useRef(true);

  const runSearch = async (q: string) => {
    setLoading(true);
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=jsonv2' +
        '&addressdetails=1&limit=6&countrycodes=in&q=' +
        encodeURIComponent(q);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'OTGVendorApp/1.0 (support@otg.app)',
          'Accept-Language': 'en',
        },
      });
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = (await res.json()) as NominatimResult[];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    const q = value.trim();
    if (q.length < MIN_QUERY) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    timer.current = setTimeout(() => runSearch(q), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  const handleSelect = (item: NominatimResult) => {
    skipNextSearch.current = true;
    onChangeText(item.display_name);
    const addr = item.address || {};
    onSelectLocation?.({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      city: addr.city || addr.town || addr.village,
      state: addr.state,
      pincode: addr.postcode,
    });
    setResults([]);
    setOpen(false);
  };

  return (
    <View>
      <Text
        className="text-[14px] leading-[20px] text-[#364153] mb-2"
        style={{fontFamily: 'Poppins-SemiBold'}}>
        {label}
      </Text>
      <View
        className={`border rounded-lg px-4 min-h-[50px] flex-row items-center ${
          error ? 'border-[#fb2c36]' : 'border-[#d1d5dc]'
        }`}
        style={{gap: 8}}>
        <TextInput
          className="font-poppins-regular text-[16px] text-primary flex-1 p-0"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          placeholderTextColor="rgba(64,64,64,0.5)"
          multiline
        />
        {loading ? <ActivityIndicator size="small" color="#717182" /> : null}
      </View>

      {open && results.length > 0 ? (
        <View
          className="bg-white rounded-lg mt-1 border border-[#e5e7eb]"
          style={{overflow: 'hidden', elevation: 5}}>
          {results.map((item, idx) => (
            <Pressable
              key={item.place_id}
              onPress={() => handleSelect(item)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 11,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: '#f0f0f0',
              }}>
              <Text
                className="font-poppins-regular text-[13px] text-[#364153]"
                numberOfLines={2}
                style={{lineHeight: 18}}>
                {item.display_name}
              </Text>
            </Pressable>
          ))}
          <Text
            className="font-poppins-regular text-[10px] text-[#9ca3af]"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#fafafa',
            }}>
            Powered by OpenStreetMap
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text
          className="font-poppins-regular text-[12px] text-[#fb2c36] mt-1"
          style={{lineHeight: 16}}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default AddressSearchField;
