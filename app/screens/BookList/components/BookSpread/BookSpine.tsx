import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface BookSpineProps {
  height: number;
  width: number;
}

export const BookSpine: React.FC<BookSpineProps> = ({ height, width }) => {
  return (
    <LinearGradient
      colors={['#3a3a3a', '#5a5a5a', '#7a7a7a', '#5a5a5a', '#3a3a3a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.spine, { height, width }]}>
      {/* Vertical lines for texture */}
      <View style={styles.lineContainer}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.line} />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  spine: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineContainer: {
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '60%',
  },
  line: {
    width: 1,
    height: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
