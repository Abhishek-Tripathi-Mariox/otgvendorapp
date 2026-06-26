import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface ChevronDownIconProps {
  size?: number;
  color?: string;
}

const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
  size = 12,
  color = 'rgba(0,0,0,0.54)',
}) => {
  return (
    <Svg width={size} height={size * (8 / 12)} viewBox="0 0 12 8" fill="none">
      <Path
        d="M10.588 0L5.999 4.579L1.41 0L0 1.41L5.999 7.408L11.997 1.41L10.588 0Z"
        fill={color}
      />
    </Svg>
  );
};

export default ChevronDownIcon;
