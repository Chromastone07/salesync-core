import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import Constants from 'expo-constants';
import { brandConfig } from '@/brand.config';

const isExpoGo = Constants.appOwnership === 'expo';

export function BannerAd() {
  const [GAM, setGAM] = useState<any>(null);

  useEffect(() => {
    if (!isExpoGo && brandConfig.enableAds) {
      try {
        const ads = require('react-native-google-mobile-ads');
        setGAM(ads);
      } catch (e) {
        console.warn("Failed to load Google Ads", e);
      }
    }
  }, []);

  if (!brandConfig.enableAds) return null;

  if (isExpoGo) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 50, backgroundColor: '#E8E0D6' }}>
        <Text style={{ color: '#78716C', fontSize: 12, fontFamily: 'Inter_500Medium' }}>[Banner Ad Placeholder (Expo Go)]</Text>
      </View>
    );
  }

  if (!GAM) return null;

  const adUnitId = __DEV__ ? GAM.TestIds.BANNER : (Platform.OS === 'ios' ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-3940256099942544/6300978111');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <GAM.BannerAd
        unitId={adUnitId}
        size={GAM.BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error: any) => {
          console.error('Ad failed to load: ', error);
        }}
      />
    </View>
  );
}
