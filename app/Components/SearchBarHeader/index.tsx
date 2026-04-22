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
  onFocus?: any;
  onPressNext?: () => void;
  onPressPrev?: () => void;
  matchCount?: number;
  currentMatch?: number;
}
const SearchBarHeader: React.FC<SearchBarProps> = ({
  setSearchBarState,
  value,
  onChangeText,
  onFocus,
  onPressNext,
  onPressPrev,
  matchCount = 0,
  currentMatch = 0,
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
          {matchCount > 0 && (
            <Text style={styles.matchCountText}>
              {currentMatch}/{matchCount}
            </Text>
          )}
          <TouchableOpacity 
            style={{marginRight: wp(2)}}
            onPress={onPressNext}
            disabled={matchCount === 0}>
            <Image
              source={icn.downWardScrollBtn}
              style={[
                styles.upWardBtnStyle,
                matchCount === 0 && styles.disabledButton
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressPrev}
            disabled={matchCount === 0}>
            <Image 
              source={icn.upWardScrollBtn} 
              style={[
                styles.upWardBtnStyle,
                matchCount === 0 && styles.disabledButton
              ]} 
            />
          </TouchableOpacity>
        </>
      ) : (
        <Image source={icn.searchIcn} style={styles.searchIcnStyle} />
      )}
    </View>
  );
};

export default SearchBarHeader;
