import React from 'react';
import Svg, {Path, G} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const MenuIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17.995h17.996v-2H3v2zm0-5h17.996v-2H3v2zm0-6.998v2h17.996v-2H3z" fill={color} />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={color}
    />
  </Svg>
);

export const CartIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5.828 14.988a1.665 1.665 0 100 3.33 1.665 1.665 0 000-3.33zM.832 1.666v1.665h1.665l2.998 6.32-1.124 2.03a1.64 1.64 0 00-.209.8c0 .915.75 1.665 1.665 1.665h9.992V12.49H6.178a.213.213 0 01-.209-.208l.025-.1.75-1.357h6.203a1.66 1.66 0 001.457-.858l2.981-5.404a.42.42 0 00.083-.3.833.833 0 00-.833-.832H4.337l-.782-1.665H.832zm13.322 13.322a1.665 1.665 0 100 3.33 1.665 1.665 0 000-3.33z"
      fill={color}
    />
  </Svg>
);

export const CartIcon24: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42a.25.25 0 01-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0021 4.5a1 1 0 00-1-1H5.21l-.94-1.5H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      fill={color}
    />
  </Svg>
);

export const SyncIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M9.991 3.33V.832L6.661 4.163l3.33 3.33V4.995c2.756 0 4.996 2.24 4.996 4.996 0 .841-.208 1.64-.583 2.331l1.216 1.216c.65-1.024 1.032-2.24 1.032-3.547 0-3.68-2.98-6.661-6.661-6.661zm0 11.657c-2.756 0-4.996-2.24-4.996-4.996 0-.841.208-1.64.583-2.331L4.363 6.444c-.65 1.024-1.033 2.24-1.033 3.547 0 3.68 2.981 6.661 6.661 6.661v2.498l3.33-3.33-3.33-3.331v2.498z"
      fill={color}
    />
  </Svg>
);

export const TruckIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.652 6.661h-2.498V3.33H2.497c-.916 0-1.665.75-1.665 1.665v9.159h1.665a2.493 2.493 0 004.996 0h4.996a2.493 2.493 0 004.996 0h1.665V9.991l-2.498-3.33zM4.995 15.403a1.249 1.249 0 110-2.498 1.249 1.249 0 010 2.498zm11.24-7.494l1.633 2.082h-3.714V7.91h2.082zm-1.249 7.494a1.249 1.249 0 110-2.498 1.249 1.249 0 010 2.498z"
      fill={color}
    />
  </Svg>
);

export const PaymentCheckIcon: React.FC<IconProps> = ({size = 20, color = '#00A63E'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.653 3.33H3.331c-.924 0-1.657.741-1.657 1.665v9.992c0 .924.733 1.665 1.657 1.665h13.322c.924 0 1.665-.741 1.665-1.665V4.995c0-.924-.741-1.665-1.665-1.665zm0 11.657H3.331V9.991h13.322v4.996zm0-8.327H3.331V4.995h13.322v1.665z"
      fill={color}
    />
  </Svg>
);

export const QcPendingIcon: React.FC<IconProps> = ({size = 20, color = '#E48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.154 9.991c-2.298 0-4.163 1.865-4.163 4.163s1.865 4.163 4.163 4.163 4.163-1.865 4.163-4.163-1.865-4.163-4.163-4.163zm1.374 6.12l-1.79-1.79v-2.665h.833v2.323l1.54 1.54-.583.592zM14.987 2.497h-2.648c-.35-.966-1.266-1.665-2.348-1.665s-1.998.699-2.348 1.665H4.995c-.916 0-1.665.75-1.665 1.665v12.49c0 .916.75 1.665 1.665 1.665h5.088a6.59 6.59 0 01-1.183-1.665H4.995V4.163h1.666v2.498h6.66V4.163h1.666v4.23c.591.083 1.15.258 1.665.499V4.163c0-.916-.749-1.665-1.665-1.665zm-4.996 1.665a.833.833 0 110-1.665.833.833 0 010 1.665z"
      fill={color}
    />
  </Svg>
);

export const DispatchCheckIcon: React.FC<IconProps> = ({size = 20, color = '#00A63E'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M9.992 1.666a8.326 8.326 0 100 16.653 8.326 8.326 0 000-16.653zm-1.665 12.49l-4.163-4.164 1.174-1.174 2.989 2.981 6.32-6.32 1.174 1.182-7.494 7.494z"
      fill={color}
    />
  </Svg>
);

export const InTransitTruckIcon: React.FC<IconProps> = ({size = 20, color = '#155DFC'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.652 6.661h-2.498V3.33H2.497c-.916 0-1.665.75-1.665 1.665v9.159h1.665a2.493 2.493 0 004.996 0h4.996a2.493 2.493 0 004.996 0h1.665V9.991l-2.498-3.33zm-.416 1.249l1.632 2.081h-3.714V7.91h2.082zM4.995 14.987a.833.833 0 110-1.666.833.833 0 010 1.666zm1.849-2.498a2.502 2.502 0 00-3.697 0H2.497V4.995h9.992v7.494H6.844zm8.143 2.498a.833.833 0 110-1.666.833.833 0 010 1.666z"
      fill={color}
    />
  </Svg>
);

export const DelayedIcon: React.FC<IconProps> = ({size = 20, color = '#E7000B'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <G>
      <Path
        d="M9.991 4.988l6.27 10.833H3.721L9.991 4.988zm0-3.322L.832 17.486h18.318L9.991 1.666z"
        fill={color}
      />
      <Path d="M10.824 13.322H9.158v1.665h1.666v-1.665zm0-4.996H9.158v4.163h1.666V8.326z" fill={color} />
    </G>
  </Svg>
);

export const DashboardGridIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M2.5 2.5h6.25v6.25H2.5V2.5zm8.75 0h6.25v6.25h-6.25V2.5zM2.5 11.25h6.25v6.25H2.5v-6.25zm8.75 0h6.25v6.25h-6.25v-6.25z"
      fill={color}
    />
  </Svg>
);

export const InventoryBoxIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.667 5l-6.667-3.333L3.333 5v10L10 18.333 16.667 15V5zM10 3.542l5.042 2.525L10 8.592 4.958 6.067 10 3.542zM5 7.583l4.167 2.084v6.458L5 14.042V7.583zm5.833 8.542V9.667L15 7.583v6.459l-4.167 2.083z"
      fill={color}
    />
  </Svg>
);

export const PaymentsCardIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.667 3.333H3.333c-.925 0-1.658.742-1.658 1.667L1.667 15c0 .925.741 1.667 1.666 1.667h13.334c.925 0 1.666-.742 1.666-1.667V5c0-.925-.741-1.667-1.666-1.667zm0 11.667H3.333v-5h13.334v5zm0-8.333H3.333V5h13.334v1.667z"
      fill={color}
    />
  </Svg>
);

export const InvoiceDocIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M11.667 1.667H5c-.917 0-1.658.75-1.658 1.666L3.333 16.667c0 .916.742 1.666 1.659 1.666h10.008c.917 0 1.667-.75 1.667-1.666V6.667l-5-5zM13.333 15H6.667v-1.667h6.666V15zm0-3.333H6.667V10h6.666v1.667zM10.833 7.5V2.917L15.417 7.5h-4.584z"
      fill={color}
    />
  </Svg>
);

export const SupportHelpIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 1.667a8.333 8.333 0 100 16.666 8.333 8.333 0 000-16.666zm.833 14.166H9.167v-1.666h1.666v1.666zm1.725-6.458l-.75.767c-.6.608-.975 1.108-.975 2.358H9.167v-.417c0-.916.375-1.75.975-2.358l1.033-1.05A1.65 1.65 0 0011.667 7.5 1.667 1.667 0 008.333 7.5H6.667a3.333 3.333 0 116.666 0c0 .733-.3 1.4-.775 1.875z"
      fill={color}
    />
  </Svg>
);

export const PersonIcon: React.FC<IconProps> = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 10a3.333 3.333 0 100-6.667A3.333 3.333 0 0010 10zm0 1.667c-2.225 0-6.667 1.116-6.667 3.333v1.667h13.334V15c0-2.217-4.442-3.333-6.667-3.333z"
      fill={color}
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      fill={color}
    />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({size = 24, color = '#2196f3'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51M16.4 17.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57a.84.84 0 00-.31-.05c-.26 0-.51.1-.71.29l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1z"
      fill={color}
    />
  </Svg>
);

export const EmailIcon: React.FC<IconProps> = ({size = 24, color = '#e48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill={color}
    />
  </Svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({size = 24, color = '#22c55e'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"
      fill={color}
    />
  </Svg>
);

export const CloudUploadBigIcon: React.FC<IconProps> = ({size = 32, color = '#9ca3af'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
      fill={color}
    />
  </Svg>
);

export const SendIcon: React.FC<IconProps> = ({size = 20, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
  </Svg>
);

export const BotIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-.5-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
      fill={color}
    />
  </Svg>
);

export const ToolsIcon: React.FC<IconProps> = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13.78 15.168l2.12-2.121 5.995 5.995-2.121 2.12-5.994-5.994zm3.716-5.171c1.93 0 3.5-1.57 3.5-3.5 0-.58-.16-1.12-.41-1.6l-2.7 2.7-1.49-1.49 2.7-2.7c-.48-.25-1.02-.41-1.6-.41-1.93 0-3.5 1.57-3.5 3.5 0 .41.08.8.21 1.16l-1.85 1.85-1.78-1.78.71-.71-1.41-1.41 2.12-2.12a2.996 2.996 0 00-4.24 0l-3.54 3.54 1.41 1.41h-2.82l-.71.71 3.54 3.54.71-.71V9.147l1.41 1.41.71-.71 1.78 1.78-7.41 7.408 2.12 2.12 11.378-11.177c.36.13.75.21 1.16.21z"
      fill={color}
    />
  </Svg>
);
