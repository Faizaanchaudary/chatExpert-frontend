import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {styles} from './style';
import {icn} from '../../assets/icons';
interface EditPhotoIconsProps {
  item?: any;
  onPress?: () => void;
}
const EditPhotoIcons: React.FC<EditPhotoIconsProps> = ({item, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={item.source} style={styles.imageStyle} />
    </TouchableOpacity>
  );
};

export default EditPhotoIcons;
