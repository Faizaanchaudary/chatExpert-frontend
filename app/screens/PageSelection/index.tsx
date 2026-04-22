import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../utils/colors';
import { hp, wp, rfs } from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import { createPhotoBook } from '../../services/photoBookApi';
import { useSelector } from 'react-redux';

interface PageSelectionProps {
  navigation?: any;
  route?: any;
}

const PageSelection: React.FC<PageSelectionProps> = ({ navigation, route }) => {
  const { format, bookspecs, chatId, books } = route?.params || {};
  const [pageCount, setPageCount] = useState(30);
  const [basePrice, setBasePrice] = useState(29.99);
  const [totalPrice, setTotalPrice] = useState(29.99);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: any) => state?.user?.token);

  useEffect(() => {
    // Set base price based on format
    if (format === 'standard_14_8x21') {
      setBasePrice(34.99);
      setTotalPrice(34.99);
    } else {
      setBasePrice(29.99);
      setTotalPrice(29.99);
    }
  }, [format]);

  useEffect(() => {
    // Calculate price when page count changes
    const additionalPages = Math.max(0, pageCount - 30);
    const pricePerPage = format === 'standard_14_8x21' ? 0.60 : 0.50;
    const additionalPrice = additionalPages * pricePerPage;
    setTotalPrice(basePrice + additionalPrice);
  }, [pageCount, basePrice, format]);

  const handleContinue = async () => {
    if (!chatId) {
      Alert.alert('Error', 'Chat ID is required');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please log in to continue');
      navigation.navigate('LogIn');
      return;
    }

    setLoading(true);
    try {
      // NEW: Pass books metadata if available (for multi-book support)
      const response = await createPhotoBook(chatId, format, pageCount, books);
      const photoBook = response.data.data;
      const photoBookId = photoBook._id;

      // Navigate to Preview so user can select theme, customize, and generate PDF
      navigation.navigate('PhotoBookPreview', {
        photoBookId,
        chatId,
        format,
        pageCount,
        totalPrice: photoBook.totalPrice,
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || 'Failed to create photo book';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        text="Select Pages"
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose Number of Pages</Text>
        <Text style={styles.subtitle}>
          Minimum: 30 pages | Maximum: 200 pages
        </Text>

        {/* NEW: Multi-book indicator */}
        {books && books.length > 0 && (
          <View style={styles.multiBooksAlert}>
            <Text style={styles.multiBooksTitle}>📚 Multi-Book Order</Text>
            <Text style={styles.multiBooksText}>
              Your chat will be split into {books.length} books:
            </Text>
            {books.map((book: any) => (
              <Text key={book.bookNumber} style={styles.bookItem}>
                • Book {book.bookNumber}: ~{book.estimatedPages} pages
              </Text>
            ))}
            <Text style={styles.multiBooksNote}>
              You'll be able to preview and order all books together.
            </Text>
          </View>
        )}

        <View style={styles.sliderContainer}>
          <Text style={styles.pageCountText}>{pageCount} pages</Text>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={200}
            step={1}
            value={pageCount}
            onValueChange={setPageCount}
            minimumTrackTintColor={COLORS.lightBlue}
            maximumTrackTintColor={COLORS.lightGray}
            thumbTintColor={COLORS.lightBlue}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.labelText}>30</Text>
            <Text style={styles.labelText}>200</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Base Price (30 pages):</Text>
          <Text style={styles.priceValue}>${basePrice.toFixed(2)}</Text>
        </View>

        {pageCount > 30 && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>
              Additional Pages ({pageCount - 30}):
            </Text>
            <Text style={styles.priceValue}>
              ${((pageCount - 30) * (format === 'standard_14_8x21' ? 0.60 : 0.50)).toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price:</Text>
          <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
        </View>

        <CustomButton
          text={loading ? 'Creating...' : 'Continue'}
          onPress={handleContinue}
          animating={loading}
          disable={loading}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: wp(5),
  },
  title: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginBottom: hp(3),
  },
  sliderContainer: {
    marginVertical: hp(3),
  },
  pageCountText: {
    fontSize: rfs(32),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.lightBlue,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  slider: {
    width: '100%',
    height: hp(4),
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  labelText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  priceLabel: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  priceValue: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 2,
    borderTopColor: COLORS.lightBlue,
  },
  totalLabel: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
  },
  totalValue: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.lightBlue,
  },
  // NEW: Multi-book alert styles
  multiBooksAlert: {
    backgroundColor: '#E3F2FD',
    borderRadius: wp(2),
    padding: wp(4),
    marginVertical: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightBlue,
  },
  multiBooksTitle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(0.5),
  },
  multiBooksText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    marginBottom: hp(1),
  },
  bookItem: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginLeft: wp(2),
    marginBottom: hp(0.5),
  },
  multiBooksNote: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Italic,
    color: COLORS.textGray,
    marginTop: hp(1),
  },
});

export default PageSelection;
