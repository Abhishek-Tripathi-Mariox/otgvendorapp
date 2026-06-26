import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface InventoryIconProps {
  size?: number;
  color?: string;
}

const InventoryIcon: React.FC<InventoryIconProps> = ({size = 20, color = '#4A5565'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.653 1.666H3.331c-.833 0-1.665.75-1.665 1.665v2.507c0 .6.358 1.116.833 1.407v9.409c0 .916.916 1.665 1.665 1.665h11.657c.75 0 1.665-.75 1.665-1.665V7.245c.475-.291.833-.808.833-1.407V3.331c0-.916-.833-1.665-1.665-1.665zm-4.163 9.992H7.494V9.992h4.996v1.666zm4.163-5.829H3.331V3.331h13.322v2.498z"
      fill={color}
    />
  </Svg>
);

export default InventoryIcon;
