import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface GreenTickIconProps {
  size?: number;
}

const GreenTickIcon: React.FC<GreenTickIconProps> = ({size = 64}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 5.334C17.28 5.334 5.334 17.28 5.334 32C5.334 46.719 17.28 58.665 32 58.665C46.719 58.665 58.665 46.719 58.665 32C58.665 17.28 46.719 5.334 32 5.334ZM26.666 45.332L13.334 32L17.094 28.24L26.666 37.786L46.905 17.547L50.665 21.333L26.666 45.332Z"
        fill="#00C950"
      />
    </Svg>
  );
};

export default GreenTickIcon;
