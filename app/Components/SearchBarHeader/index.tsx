import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {icn} from '../../assets/icons';
import {styles} from './style';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';
interface SearchBarProps {
  setSearchBarState?: any;
  value?: any;
  onChangeText?: any;
  upWardDownWardBtn?: any;
  onFocus?: any;
}
const SearchBarHeader: React.FC<SearchBarProps> = ({
  setSearchBarState,
  value,
  onChangeText,
  onFocus,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity onPress={() => setSearchBarState(false)}>
        <Image source={icn.backArrowIcn} style={styles.backArrowStyle} />
      </TouchableOpacity>
      <TextInput
        placeholder="Search here"
        placeholderTextColor={'#00000040'}
        style={styles.searchBarInputStyle}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
      />

      {value ? (
        <>
          <TouchableOpacity style={{marginRight: wp(2)}}>
            <Image
              source={icn.downWardScrollBtn}
              style={styles.upWardBtnStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={icn.upWardScrollBtn} style={styles.upWardBtnStyle} />
          </TouchableOpacity>
        </>
      ) : (
        <Image source={icn.searchIcn} style={styles.searchIcnStyle} />
      )}
    </View>
  );
};

export default SearchBarHeader;
