import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {BANNER_HEIGHT} from '../constants';

interface PageBannerProps {
  text?: string;
  onPress?: () => void;
}

const PageBanner: React.FC<PageBannerProps> = ({text, onPress}) => {
  return (
    <TouchableOpacity style={styles.bannerContainer} onPress={onPress}>
      <Text style={styles.bannerText}>{text || '+'}</Text>
    </TouchableOpacity>
  );
};

export default PageBanner;

const styles = StyleSheet.create({
  bannerContainer: {
    // padding: 10,
    height: BANNER_HEIGHT,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    // marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  bannerText: {
    color: '#000',
  },
});
