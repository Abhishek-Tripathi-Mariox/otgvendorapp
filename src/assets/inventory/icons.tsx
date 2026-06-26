import React from 'react';
import Svg, {Path, G, Defs, ClipPath, Rect, Circle} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const BackArrowIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.9963 10.9984H7.82911L13.4178 5.40967L11.9981 4L4 11.9981L11.9981 19.9963L13.4078 18.5866L7.82911 12.9979H19.9963V10.9984Z"
      fill={color}
    />
  </Svg>
);

export const SaveCheckIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M7.49426 13.4636L4.02218 9.99148L2.83984 11.1655L7.49426 15.8199L17.4859 5.82831L16.3119 4.6543L7.49426 13.4636Z"
      fill={color}
    />
  </Svg>
);

export const CloudUploadLargeIcon: React.FC<IconProps> = ({size = 40, color = '#99A1AF'}) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <G clipPath="url(#clip0_cloud)">
      <Path
        d="M32.2376 16.7269C31.1047 10.9791 26.0566 6.66406 19.9923 6.66406C15.1775 6.66406 10.9958 9.39634 8.91323 13.3948C3.8985 13.9279 0 18.1763 0 23.3243C0 28.8389 4.48161 33.3205 9.99615 33.3205H31.6545C36.2527 33.3205 39.9846 29.5886 39.9846 24.9903C39.9846 20.592 36.5693 17.0267 32.2376 16.7269ZM23.3244 21.6583V28.3224H16.6602V21.6583H11.6622L19.9923 13.3282L28.3224 21.6583H23.3244Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_cloud">
        <Rect width={size} height={size} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const DropdownArrowIcon: React.FC<IconProps> = ({size = 24, color = 'rgba(0,0,0,0.54)'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.99805 9.99805L11.9969 14.9969L16.9957 9.99805H6.99805Z"
      fill={color}
    />
  </Svg>
);

export const InventoryMenuIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17.9952H20.9958V15.9957H3V17.9952ZM3 12.9964H20.9958V10.9969H3V12.9964ZM3 5.99805V7.99758H20.9958V5.99805H3Z"
      fill={color}
    />
  </Svg>
);

export const InventoryBellIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.9981 21.9954C13.0979 21.9954 13.9977 21.0957 13.9977 19.9959H9.9986C9.9986 21.0957 10.8884 21.9954 11.9981 21.9954ZM17.9967 15.9969V10.998C17.9967 7.92873 16.3571 5.35933 13.4978 4.67949V3.99965C13.4978 3.16984 12.8279 2.5 11.9981 2.5C11.1683 2.5 10.4985 3.16984 10.4985 3.99965V4.67949C7.62915 5.35933 5.99953 7.91874 5.99953 10.998V15.9969L4 17.9964V18.9961H19.9963V17.9964L17.9967 15.9969Z"
      fill={color}
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.471 6.471 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill={color}
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({size = 24, color = '#9ca3af'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
      fill={color}
    />
  </Svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({size = 14, color = '#00a63e'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"
      fill={color}
    />
  </Svg>
);

export const CementIcon: React.FC<IconProps> = ({size = 24, color = '#e48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2v4h2V4h8v2h2V2H6zm-1 6a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1H5zm2 3h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
      fill={color}
    />
  </Svg>
);

export const SteelIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 4h2v16H3V4zm4 0h2v16H7V4zm4 0h2v16h-2V4zm4 0h2v16h-2V4zm4 0h2v16h-2V4z"
      fill={color}
    />
  </Svg>
);

export const BricksIcon: React.FC<IconProps> = ({size = 24, color = '#e48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="6" height="5" fill={color} />
    <Rect x="9" y="3" width="6" height="5" fill={color} />
    <Rect x="16" y="3" width="6" height="5" fill={color} />
    <Rect x="2" y="9.5" width="6" height="5" fill={color} />
    <Rect x="9" y="9.5" width="6" height="5" fill={color} />
    <Rect x="16" y="9.5" width="6" height="5" fill={color} />
    <Rect x="2" y="16" width="6" height="5" fill={color} />
    <Rect x="9" y="16" width="6" height="5" fill={color} />
    <Rect x="16" y="16" width="6" height="5" fill={color} />
  </Svg>
);

export const SandIcon: React.FC<IconProps> = ({size = 24, color = '#ca8a04'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L2 21h20L12 3zm0 4.5L18.5 19h-13L12 7.5z" fill={color} />
    <Circle cx="12" cy="15" r="1" fill={color} />
    <Circle cx="9" cy="17" r="1" fill={color} />
    <Circle cx="15" cy="17" r="1" fill={color} />
  </Svg>
);

export const WrenchIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
      fill={color}
    />
  </Svg>
);

export const ShieldIcon: React.FC<IconProps> = ({size = 24, color = '#e48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
      fill={color}
    />
  </Svg>
);
