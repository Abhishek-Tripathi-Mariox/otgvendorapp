import React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';

interface CheckboxIconProps {
  checked?: boolean;
  size?: number;
}

const CheckboxIcon: React.FC<CheckboxIconProps> = ({
  checked = false,
  size = 20,
}) => {
  if (checked) {
    return (
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Rect width="20" height="20" rx={3} fill="#FFE403" />
        <Path
          d="M5.86 9.79L9.36 12.79L13.86 7.29"
          stroke="black"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x={0.5}
        y={0.5}
        width={19}
        height={19}
        rx={2.5}
        stroke="black"
        strokeWidth={1}
      />
    </Svg>
  );
};

export default CheckboxIcon;
