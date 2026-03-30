import {StyleSheet} from 'react-native';
import {rhp, rwp} from '../../utils/reponsiveness';

export const styles = StyleSheet.create({
  mainContainer: {},
  imageStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',

  },
});
