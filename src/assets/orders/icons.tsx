import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const SearchIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M12.9167 11.6667H12.2583L12.025 11.4417C12.8417 10.4917 13.3333 9.25833 13.3333 7.91667C13.3333 4.925 10.9083 2.5 7.91667 2.5C4.925 2.5 2.5 4.925 2.5 7.91667C2.5 10.9083 4.925 13.3333 7.91667 13.3333C9.25833 13.3333 10.4917 12.8417 11.4417 12.025L11.6667 12.2583V12.9167L15.8333 17.075L17.075 15.8333L12.9167 11.6667ZM7.91667 11.6667C5.84167 11.6667 4.16667 9.99167 4.16667 7.91667C4.16667 5.84167 5.84167 4.16667 7.91667 4.16667C9.99167 4.16667 11.6667 5.84167 11.6667 7.91667C11.6667 9.99167 9.99167 11.6667 7.91667 11.6667Z"
      fill={color}
    />
  </Svg>
);

export const FilterIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4.16667 3.33333H15.8333L10.8333 9.16667V15L9.16667 15.8333V9.16667L4.16667 3.33333Z"
      fill={color}
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({size = 24, color = '#9ca3af'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.29 6.71a.996.996 0 000 1.41L13.17 12l-3.88 3.88a.996.996 0 101.41 1.41l4.59-4.59a.996.996 0 000-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"
      fill={color}
    />
  </Svg>
);

export const StatusDot: React.FC<IconProps> = ({size = 10, color = '#e48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <Circle cx={5} cy={5} r={5} fill={color} />
  </Svg>
);

export const OrdersMenuIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17.9952H20.9958V15.9957H3V17.9952ZM3 12.9964H20.9958V10.9969H3V12.9964ZM3 5.99805V7.99758H20.9958V5.99805H3Z"
      fill={color}
    />
  </Svg>
);

export const BackArrowIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.9963 10.9984H7.82911L13.4178 5.40967L11.9981 4L4 11.9981L11.9981 19.9963L13.4078 18.5866L7.82911 12.9979H19.9963V10.9984Z"
      fill={color}
    />
  </Svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"
      fill={color}
    />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
      fill={color}
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({size = 20, color = '#fb2c36'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M15 5.83L14.17 5 10 9.17 5.83 5 5 5.83 9.17 10 5 14.17l.83.83L10 10.83 14.17 15l.83-.83L10.83 10 15 5.83z"
      fill={color}
    />
  </Svg>
);

export const AcceptCheckIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M7.49426 13.4636L4.02218 9.99148L2.83984 11.1655L7.49426 15.8199L17.4859 5.82831L16.3119 4.6543L7.49426 13.4636Z"
      fill={color}
    />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill={color}
    />
  </Svg>
);

export const DownloadIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
      fill={color}
    />
  </Svg>
);

export const OrdersBellIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.9981 21.9954C13.0979 21.9954 13.9977 21.0957 13.9977 19.9959H9.9986C9.9986 21.0957 10.8884 21.9954 11.9981 21.9954ZM17.9967 15.9969V10.998C17.9967 7.92873 16.3571 5.35933 13.4978 4.67949V3.99965C13.4978 3.16984 12.8279 2.5 11.9981 2.5C11.1683 2.5 10.4985 3.16984 10.4985 3.99965V4.67949C7.62915 5.35933 5.99953 7.91874 5.99953 10.998V15.9969L4 17.9964V18.9961H19.9963V17.9964L17.9967 15.9969Z"
      fill={color}
    />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({size = 32, color = '#6a7282'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
      fill={color}
    />
    <Circle cx={12} cy={12} r={3} fill="#fff" />
  </Svg>
);

export const CloudUploadIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
      fill={color}
    />
  </Svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({size = 48, color = '#22c55e'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Path
      d="M9.55 15.2L6.2 11.85l-1.17 1.17L9.55 17.55 19.55 7.55l-1.17-1.18z"
      fill="#fff"
    />
  </Svg>
);

export const XCircleIcon: React.FC<IconProps> = ({size = 48, color = '#ef4444'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Path
      d="M16.24 7.76l-1.06-1.06L12 9.88 8.82 6.7 7.76 7.76 10.94 10.94l-3.18 3.18 1.06 1.06L12 12.0l3.18 3.18 1.06-1.06-3.18-3.18z"
      fill="#fff"
    />
  </Svg>
);

export const QrCodeIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 19h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z"
      fill={color}
    />
  </Svg>
);

export const TruckIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
      fill={color}
    />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({size = 20, color = '#6a7282'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
      fill={color}
    />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({size = 20, color = '#6a7282'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill={color}
    />
  </Svg>
);

export const PersonIcon: React.FC<IconProps> = ({size = 20, color = '#e48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
  </Svg>
);

export const PencilIcon: React.FC<IconProps> = ({size = 16, color = '#6a7282'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill={color}
    />
  </Svg>
);

export const ChevronDownSmallIcon: React.FC<IconProps> = ({size = 16, color = '#6a7282'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
      fill={color}
    />
  </Svg>
);
