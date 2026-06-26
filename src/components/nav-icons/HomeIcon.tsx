import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
}

const HomeIcon: React.FC<HomeIconProps> = ({size = 20, color = '#4A5565'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M8.327 16.653V11.657h3.33v4.996h4.164V9.992h2.498L9.992 2.498 1.666 9.992h2.498v6.661h4.163z"
      fill={color}
    />
  </Svg>
);

export default HomeIcon;
