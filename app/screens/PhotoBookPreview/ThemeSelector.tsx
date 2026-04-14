import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { themes } from '../../themes';
import { COLORS } from '../../utils/colors';
import fonts from '../../utils/fonts';
import { wp, rfs } from '../../utils/reponsiveness';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelectTheme,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme</Text>
      <View style={styles.grid}>
        {themes.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
              onPress={() => onSelectTheme(theme.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.thumb,
                  { backgroundColor: theme.defaults.colors.background },
                  isSelected && styles.thumbSelected,
                ]}
              />
              <Text style={styles.cardLabel} numberOfLines={1}>
                {theme.displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: wp(4),
    backgroundColor: COLORS.lightGray,
    padding: wp(3),
    borderRadius: wp(2),
  },
  title: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    marginBottom: wp(2),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  card: {
    width: wp(18),
    alignItems: 'center',
  },
  cardSelected: {
    opacity: 1,
  },
  thumb: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  thumbSelected: {
    borderColor: COLORS.lightBlue,
    borderWidth: 3,
  },
  cardLabel: {
    fontSize: rfs(11),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginTop: wp(1),
  },
});
//