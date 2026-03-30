import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';
import fonts from '../../utils/fonts';
import { wp, rfs } from '../../utils/reponsiveness';
import { ThemeConfigOverrides } from '../../themes/types';

interface OptionsPanelProps {
  overrides: ThemeConfigOverrides;
  onDateFormatChange: (value: 'full' | 'timeOnly' | 'hidden') => void;
  onShowPageNumbersChange: (value: boolean) => void;
  onSenderLabelStyleChange: (value: 'name' | 'initial' | 'hidden') => void;
  onFontFamilyChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
  onMessageBoldChange: (value: boolean) => void;
  onMessageItalicChange: (value: boolean) => void;
  onImageLayoutChange: (value: 'fullPage' | 'grid' | 'maxGrid') => void;
  onDateStyleChange: (value: 'short' | 'long' | 'dayName') => void;
  onDateLanguageChange: (value: 'en' | 'fr' | 'es') => void;
  onEditTitles: () => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  overrides,
  onDateFormatChange,
  onShowPageNumbersChange,
  onSenderLabelStyleChange,
  onFontFamilyChange,
  onFontSizeChange,
  onMessageBoldChange,
  onMessageItalicChange,
  onImageLayoutChange,
  onDateStyleChange,
  onDateLanguageChange,
  onEditTitles,
}) => {
  const dateFormat = overrides.dateFormat ?? 'full';
  const showPageNumbers = overrides.showPageNumbers ?? true;
  const senderLabelStyle = overrides.senderLabelStyle ?? 'name';
  const fontFamily = overrides.fontFamily ?? 'Georgia';
  const fontSize = overrides.fontSize ?? 11;
  const messageBold = overrides.messageBold ?? false;
  const messageItalic = overrides.messageItalic ?? false;
  const imageLayout = overrides.imageLayout ?? 'fullPage';
  const dateStyle = overrides.dateStyle ?? 'long';
  const dateLanguage = overrides.dateLanguage ?? 'en';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Options</Text>

      <Text style={styles.label}>Date & time</Text>
      <View style={styles.row}>
        {(['full', 'timeOnly', 'hidden'] as const).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionChip, dateFormat === opt && styles.optionChipActive]}
            onPress={() => onDateFormatChange(opt)}
          >
            <Text
              style={[
                styles.optionChipText,
                dateFormat === opt && styles.optionChipTextActive,
              ]}
            >
              {opt === 'full' ? 'Full' : opt === 'timeOnly' ? 'Time only' : 'Hidden'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {dateFormat === 'full' && (
        <>
          <Text style={styles.label}>Date options</Text>
          
          <Text style={styles.subLabel}>Date style</Text>
          <View style={styles.row}>
            {(['short', 'long', 'dayName'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionChip, dateStyle === opt && styles.optionChipActive]}
                onPress={() => onDateStyleChange(opt)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    dateStyle === opt && styles.optionChipTextActive,
                  ]}
                >
                  {opt === 'short' ? '2/17/26' : opt === 'long' ? 'Feb 17, 2026' : 'Monday, Feb 17'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Date language</Text>
          <View style={styles.row}>
            {([
              { value: 'en', label: '🇬🇧 English' },
              { value: 'fr', label: '🇫🇷 French' },
              { value: 'es', label: '🇪🇸 Spanish' },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionChip, dateLanguage === opt.value && styles.optionChipActive]}
                onPress={() => onDateLanguageChange(opt.value)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    dateLanguage === opt.value && styles.optionChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.editTitlesButton} onPress={onEditTitles}>
            <Text style={styles.editTitlesButtonText}>✏️ Edit Year/Month Titles</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Page numbers</Text>
        <Switch
          value={showPageNumbers}
          onValueChange={onShowPageNumbersChange}
          trackColor={{ false: COLORS.lightGray, true: COLORS.lightBlue }}
          thumbColor="#fff"
        />
      </View>

      <Text style={styles.label}>Sender label</Text>
      <View style={styles.row}>
        {(['name', 'initial', 'hidden'] as const).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionChip, senderLabelStyle === opt && styles.optionChipActive]}
            onPress={() => onSenderLabelStyleChange(opt)}
          >
            <Text
              style={[
                styles.optionChipText,
                senderLabelStyle === opt && styles.optionChipTextActive,
              ]}
            >
              {opt === 'name' ? 'Name' : opt === 'initial' ? 'Initial' : 'Hidden'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Text size</Text>
      <View style={styles.row}>
        {[9, 10, 11, 12, 14, 16].map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.optionChip, fontSize === size && styles.optionChipActive]}
            onPress={() => onFontSizeChange(size)}
          >
            <Text
              style={[
                styles.optionChipText,
                fontSize === size && styles.optionChipTextActive,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Font family</Text>
      <View style={styles.row}>
        {[
          { value: 'Georgia', label: 'Georgia' },
          { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
          { value: 'Times New Roman, Times, serif', label: 'Times' },
          { value: 'Courier New, Courier, monospace', label: 'Courier' },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionChip, fontFamily === opt.value && styles.optionChipActive]}
            onPress={() => onFontFamilyChange(opt.value)}
          >
            <Text
              style={[
                styles.optionChipText,
                fontFamily === opt.value && styles.optionChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Text style</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.optionChip, messageBold && styles.optionChipActive]}
          onPress={() => onMessageBoldChange(!messageBold)}
        >
          <Text style={[styles.optionChipText, messageBold && styles.optionChipTextActive]}>
            Bold
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionChip, messageItalic && styles.optionChipActive]}
          onPress={() => onMessageItalicChange(!messageItalic)}
        >
          <Text style={[styles.optionChipText, messageItalic && styles.optionChipTextActive]}>
            Italic
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Image layout</Text>
      <View style={styles.row}>
        {(['fullPage', 'grid', 'maxGrid'] as const).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionChip, imageLayout === opt && styles.optionChipActive]}
            onPress={() => onImageLayoutChange(opt)}
          >
            <Text
              style={[
                styles.optionChipText,
                imageLayout === opt && styles.optionChipTextActive,
              ]}
            >
              {opt === 'fullPage' ? 'Full Page' : opt === 'grid' ? 'Grid' : 'Max Grid'}
            </Text>
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    marginBottom: wp(2),
  },
  label: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginBottom: wp(1),
  },
  subLabel: {
    fontSize: rfs(11),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginBottom: wp(1),
    marginTop: wp(1),
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2), marginBottom: wp(3) },
  optionChip: {
    paddingHorizontal: wp(3),
    paddingVertical: wp(1.5),
    borderRadius: wp(2),
    backgroundColor: COLORS.white2,
  },
  optionChipActive: {
    backgroundColor: COLORS.lightBlue,
  },
  optionChipText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  optionChipTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(3),
  },
  editTitlesButton: {
    marginTop: wp(2),
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.lightBlue,
    borderRadius: wp(2),
    alignItems: 'center',
  },
  editTitlesButtonText: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.SemiBold,
    color: '#fff',
  },
});
