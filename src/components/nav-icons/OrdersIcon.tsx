import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface OrdersIconProps {
  size?: number;
  color?: string;
}

const OrdersIcon: React.FC<OrdersIconProps> = ({size = 20, color = '#4A5565'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5.828 14.988a1.665 1.665 0 100 3.33 1.665 1.665 0 000-3.33zM.832 1.666v1.665h1.665l2.998 6.32-1.124 2.03a1.64 1.64 0 00-.209.8c0 .915.75 1.665 1.665 1.665h9.992V12.49H6.178a.213.213 0 01-.209-.208l.025-.1.75-1.357h6.203a1.66 1.66 0 001.457-.858l2.981-5.404a.42.42 0 00.083-.3.833.833 0 00-.833-.832H4.337l-.782-1.665H.832zm13.322 13.322a1.665 1.665 0 100 3.33 1.665 1.665 0 000-3.33z"
      fill={color}
    />
  </Svg>
);

export default OrdersIcon;
