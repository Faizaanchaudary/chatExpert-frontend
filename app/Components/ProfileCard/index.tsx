import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {icn} from '../../assets/icons';
import {styles} from './style';
interface ProfileCardProps {
  text?: any;
  source?: any;
  red?: any;
  rightIcn?: any;
  onPress?: () => void;
}
const ProfileCard: React.FC<ProfileCardProps> = ({
  text,
  source,
  red,
  rightIcn,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.mainContainer} onPress={onPress}>
      <Image source={source} style={styles.iconStyle} />
      <Text style={red ? styles.textStyle2 : styles.textStyle}>{text}</Text>
      {rightIcn && (
        <Image source={icn.rightArrowIcn} style={styles.arrowIcnStyle} />
      )}
    </TouchableOpacity>
  );
};

export default ProfileCard;
