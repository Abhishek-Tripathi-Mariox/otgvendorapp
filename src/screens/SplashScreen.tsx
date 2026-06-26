import React, {useEffect} from 'react';
import {View, ImageBackground, StatusBar, Dimensions} from 'react-native';
import Logo from '../assets/Logo';
import {useAppDispatch} from '../store';
import {setLoading} from '../store';
import {
  getStoredToken,
  getStoredVendor,
  fetchMe,
  saveSession,
  clearSession,
  onboardingRoute,
} from '../services/auth';

const splashBg = require('../assets/images/splash-bg.png');

const SplashScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {width} = Dimensions.get('window');

  const logoSize = width * 0.43;

  useEffect(() => {
    const init = async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 1500));

      let target:
        | 'Login'
        | 'Dashboard'
        | 'RegistrationStep1'
        | 'RegistrationStep2'
        | 'RegistrationStep3' = 'Login';
      try {
        const token = await getStoredToken();
        if (token) {
          const cached = await getStoredVendor();
          let vendor = cached;
          try {
            const fresh = await fetchMe();
            vendor = fresh;
            await saveSession(token, fresh);
          } catch (e: any) {
            if (e?.response?.status === 401) {
              await clearSession();
              vendor = null;
            }
          }
          if (vendor) {
            target = onboardingRoute(vendor);
          }
        }
      } catch {
        // ignore and fall through to Login
      }

      dispatch(setLoading(false));
      navigation?.replace(target);
    };

    init();
  }, [dispatch, navigation]);

  return (
    <View className="flex-1 bg-primary">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#404040"
        translucent
      />
      <ImageBackground
        source={splashBg}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{opacity: 0.2}}>
        <View className="flex-1 items-center justify-center">
          <Logo width={logoSize} height={logoSize * (149 / 185)} />
        </View>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;
