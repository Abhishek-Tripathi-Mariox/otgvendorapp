import React from 'react';
import Svg, {Path, G, Defs, ClipPath, Rect} from 'react-native-svg';

interface UploadIconProps {
  size?: number;
}

const UploadIcon: React.FC<UploadIconProps> = ({size = 35}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 35 35" fill="none">
      <G clipPath="url(#clip0)">
        <Path
          d="M28.213 14.639C27.222 9.608 22.804 5.832 17.497 5.832C13.283 5.832 9.623 8.223 7.801 11.723C3.412 12.189 0 15.907 0 20.413C0 25.239 3.922 29.161 8.748 29.161H27.703C31.727 29.161 34.993 25.895 34.993 21.871C34.993 18.021 32.004 14.901 28.213 14.639ZM20.413 18.955V24.787H14.581V18.955H10.206L17.497 11.664L24.787 18.955H20.413Z"
          fill="#99A1AF"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width={35} height={35} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default UploadIcon;
