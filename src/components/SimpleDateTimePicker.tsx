import React, {useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// A lightweight, dependency-free date/time picker. Avoids the native
// @react-native-community/datetimepicker so it works without a native rebuild.
//   mode="date" -> onConfirm("DD/MM/YYYY")
//   mode="time" -> onConfirm("HH:MM AM/PM")

type Mode = 'date' | 'time';

interface Props {
  visible: boolean;
  mode: Mode;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

const Column: React.FC<{
  data: (string | number)[];
  selected: string | number;
  onSelect: (v: any) => void;
  width: number;
}> = ({data, selected, onSelect, width}) => (
  <ScrollView
    style={{maxHeight: 220, width}}
    showsVerticalScrollIndicator={false}>
    {data.map(item => {
      const active = String(item) === String(selected);
      return (
        <TouchableOpacity
          key={String(item)}
          onPress={() => onSelect(item)}
          style={{
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: active ? '#E48714' : 'transparent',
          }}>
          <Text
            style={{
              fontFamily: active ? 'Poppins-SemiBold' : 'Poppins-Regular',
              fontSize: 16,
              color: active ? '#FFFFFF' : '#404040',
            }}>
            {typeof item === 'number' ? pad(item) : item}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const SimpleDateTimePicker: React.FC<Props> = ({
  visible,
  mode,
  onClose,
  onConfirm,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const days = useMemo(
    () => Array.from({length: 31}, (_, i) => i + 1),
    [],
  );
  const months = useMemo(
    () => Array.from({length: 12}, (_, i) => i + 1),
    [],
  );
  const years = useMemo(
    () => Array.from({length: 3}, (_, i) => currentYear + i),
    [currentYear],
  );
  const hours = useMemo(
    () => Array.from({length: 12}, (_, i) => i + 1),
    [],
  );
  const minutes = useMemo(
    () => Array.from({length: 60}, (_, i) => i),
    [],
  );

  const [day, setDay] = useState(now.getDate());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(currentYear);

  const [hour, setHour] = useState(((now.getHours() + 11) % 12) + 1);
  const [minute, setMinute] = useState(now.getMinutes());
  const [meridiem, setMeridiem] = useState(now.getHours() >= 12 ? 'PM' : 'AM');

  const handleConfirm = () => {
    if (mode === 'date') {
      onConfirm(`${pad(day)}/${pad(month)}/${year}`);
    } else {
      onConfirm(`${pad(hour)}:${pad(minute)} ${meridiem}`);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <TouchableOpacity activeOpacity={1}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#404040',
                marginBottom: 12,
              }}>
              {mode === 'date' ? 'Select Dispatch Date' : 'Select Dispatch Time'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 8,
              }}>
              {mode === 'date' ? (
                <>
                  <Column data={days} selected={day} onSelect={setDay} width={70} />
                  <Column
                    data={months}
                    selected={month}
                    onSelect={setMonth}
                    width={70}
                  />
                  <Column
                    data={years}
                    selected={year}
                    onSelect={setYear}
                    width={90}
                  />
                </>
              ) : (
                <>
                  <Column data={hours} selected={hour} onSelect={setHour} width={70} />
                  <Column
                    data={minutes}
                    selected={minute}
                    onSelect={setMinute}
                    width={70}
                  />
                  <Column
                    data={['AM', 'PM']}
                    selected={meridiem}
                    onSelect={setMeridiem}
                    width={70}
                  />
                </>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 16,
              }}>
              <TouchableOpacity onPress={onClose} style={{paddingVertical: 8, paddingHorizontal: 16}}>
                <Text style={{fontFamily: 'Poppins-Regular', fontSize: 14, color: '#6a7282'}}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  backgroundColor: '#E48714',
                }}>
                <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#FFFFFF'}}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default SimpleDateTimePicker;
