import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface ProfileIconProps {
  size?: number;
  color?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({size = 20, color = '#4A5565'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M9.991 9.991a3.33 3.33 0 100-6.661 3.33 3.33 0 000 6.661zm0 1.665c-2.223 0-6.661 1.116-6.661 3.331v1.665h13.322v-1.665c0-2.215-4.438-3.33-6.661-3.33z"
      fill={color}
    />
  </Svg>
);

export default ProfileIcon;
