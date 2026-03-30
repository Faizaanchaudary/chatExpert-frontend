import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../utils/colors';
import fonts from '../../utils/fonts';
import { wp, rfs } from '../../utils/reponsiveness';

interface TitleData {
  text: string;
  bold: boolean;
  italic: boolean;
}

interface CustomTitles {
  years: Record<string, TitleData>;
  months: Record<string, TitleData>;
}

interface TitleEditorModalProps {
  visible: boolean;
  onClose: () => void;
  customTitles: CustomTitles;
  onSave: (titles: CustomTitles) => void;
  messages: any[]; // Messages to extract years/months from
}

export const TitleEditorModal: React.FC<TitleEditorModalProps> = ({
  visible,
  onClose,
  customTitles,
  onSave,
  messages,
}) => {
  const [editedTitles, setEditedTitles] = useState<CustomTitles>(customTitles);
  const [activeTab, setActiveTab] = useState<'years' | 'months'>('years');

  // Extract unique years and months from messages
  const extractYearsAndMonths = () => {
    const yearsSet = new Set<number>();
    const monthsSet = new Set<string>();

    messages.forEach((msg) => {
      const dateStr = msg.date || msg.sendingTime || '';
      if (!dateStr) return;

      // Parse DD/MM/YYYY format
      let date: Date;
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          date = new Date(year, month, day);
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }

      if (!isNaN(date.getTime())) {
        yearsSet.add(date.getFullYear());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(monthKey);
      }
    });

    return {
      years: Array.from(yearsSet).sort(),
      months: Array.from(monthsSet).sort(),
    };
  };

  const { years, months: monthKeys } = extractYearsAndMonths();

  // Convert month keys to display format
  const months = monthKeys.map((key) => {
    const [year, month] = key.split('-');
    const monthNum = parseInt(month, 10);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return {
      key,
      label: `${monthNames[monthNum - 1]} ${year}`,
    };
  });

  const handleTextChange = (type: 'years' | 'months', key: string, text: string) => {
    console.log('✏️ Text changed:', { type, key, text });
    setEditedTitles((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: {
          text,
          bold: prev[type][key]?.bold || false,
          italic: prev[type][key]?.italic || false,
        },
      },
    }));
  };

  const handleToggleBold = (type: 'years' | 'months', key: string) => {
    setEditedTitles((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: {
          text: prev[type][key]?.text || '',
          bold: !prev[type][key]?.bold,
          italic: prev[type][key]?.italic || false,
        },
      },
    }));
  };

  const handleToggleItalic = (type: 'years' | 'months', key: string) => {
    setEditedTitles((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: {
          text: prev[type][key]?.text || '',
          bold: prev[type][key]?.bold || false,
          italic: !prev[type][key]?.italic,
        },
      },
    }));
  };

  const handleSave = () => {
    console.log('💾 Saving titles:', JSON.stringify(editedTitles, null, 2));
    onSave(editedTitles);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Year/Month Titles</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'years' && styles.activeTab]}
              onPress={() => setActiveTab('years')}
            >
              <Text style={[styles.tabText, activeTab === 'years' && styles.activeTabText]}>
                Years
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'months' && styles.activeTab]}
              onPress={() => setActiveTab('months')}
            >
              <Text style={[styles.tabText, activeTab === 'months' && styles.activeTabText]}>
                Months
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {activeTab === 'years' ? (
              <>
                {years.map((year) => {
                  const yearKey = year.toString();
                  const titleData = editedTitles.years[yearKey] || { text: '', bold: false, italic: false };
                  return (
                    <View key={yearKey} style={styles.itemContainer}>
                      <Text style={styles.itemLabel}>{year}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Add custom title..."
                        value={titleData.text}
                        onChangeText={(text) => handleTextChange('years', yearKey, text)}
                      />
                      <View style={styles.styleButtons}>
                        <TouchableOpacity
                          style={[styles.styleButton, titleData.bold && styles.styleButtonActive]}
                          onPress={() => handleToggleBold('years', yearKey)}
                        >
                          <Text style={[styles.styleButtonText, titleData.bold && styles.styleButtonTextActive]}>
                            B
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.styleButton, titleData.italic && styles.styleButtonActive]}
                          onPress={() => handleToggleItalic('years', yearKey)}
                        >
                          <Text style={[styles.styleButtonText, titleData.italic && styles.styleButtonTextActive, { fontStyle: 'italic' }]}>
                            I
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                {months.map((month) => {
                  const titleData = editedTitles.months[month.key] || { text: '', bold: false, italic: false };
                  return (
                    <View key={month.key} style={styles.itemContainer}>
                      <Text style={styles.itemLabel}>{month.label}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Add custom title..."
                        value={titleData.text}
                        onChangeText={(text) => handleTextChange('months', month.key, text)}
                      />
                      <View style={styles.styleButtons}>
                        <TouchableOpacity
                          style={[styles.styleButton, titleData.bold && styles.styleButtonActive]}
                          onPress={() => handleToggleBold('months', month.key)}
                        >
                          <Text style={[styles.styleButtonText, titleData.bold && styles.styleButtonTextActive]}>
                            B
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.styleButton, titleData.italic && styles.styleButtonActive]}
                          onPress={() => handleToggleItalic('months', month.key)}
                        >
                          <Text style={[styles.styleButtonText, titleData.italic && styles.styleButtonTextActive, { fontStyle: 'italic' }]}>
                            I
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white2,
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  closeButton: {
    fontSize: rfs(24),
    color: COLORS.textGray,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: wp(3),
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.lightBlue,
  },
  tabText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
  },
  activeTabText: {
    color: COLORS.lightBlue,
    fontFamily: fonts.POPPINS.SemiBold,
  },
  content: {
    padding: wp(4),
    maxHeight: 400,
  },
  itemContainer: {
    marginBottom: wp(4),
  },
  itemLabel: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    marginBottom: wp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: wp(2),
    padding: wp(2.5),
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    backgroundColor: '#fff',
    marginBottom: wp(2),
  },
  styleButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  styleButton: {
    width: wp(10),
    height: wp(10),
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: wp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white2,
  },
  styleButtonActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.lightBlue,
  },
  styleButtonText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
  },
  styleButtonTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: wp(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: wp(3),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textGray,
  },
  saveButton: {
    flex: 1,
    paddingVertical: wp(3),
    borderRadius: wp(2),
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: '#fff',
  },
});
