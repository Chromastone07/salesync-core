import React from 'react';
import { View, Text } from 'react-native';
import { brandConfig } from '@/brand.config';

export function BannerAd() {
  if (!brandConfig.enableAds) return null;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 50, backgroundColor: '#E8E0D6' }}>
      <Text style={{ color: '#78716C', fontSize: 12, fontFamily: 'Inter_500Medium' }}>[Banner Ad Placeholder (Web)]</Text>
    </View>
  );
}
