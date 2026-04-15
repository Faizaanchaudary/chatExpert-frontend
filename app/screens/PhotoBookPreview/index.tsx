import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import { COLORS } from '../../utils/colors';
import { hp, wp, rfs } from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {
  generatePhotoBookPdf,
  getPhotoBookById,
  updatePhotoBookThemeConfig,
  PhotoBook,
} from '../../services/photoBookApi';
import { createGelatoOrder } from '../../services/photoBookApi';
import { getMessagesByChat } from '../../services/chatApi';
import { useAppDispatch, useAppSelector } from '../../store/Store';
import {
  setThemeConfigForProject,
  loadThemeConfigForProject,
  setSavingTheme,
} from '../../store/Slice/themeConfigSlice';
import { updateBookUploadStatus } from '../../store/Slice/chatSlice';
import { themes, resolveThemeConfig, getTheme, ThemeConfigStored } from '../../themes';
import { BookPreviewPages } from './BookPreviewPages';
import { ThemeSelector } from './ThemeSelector';
import { OptionsPanel } from './OptionsPanel';
import { TitleEditorModal } from './TitleEditorModal';
import { IMessage } from '../../interfaces/IMessage';
import { filterSystemMessages } from '../../utils/systemMessageFilter';

const A5_ASPECT = 210 / 148;

interface PhotoBookPreviewProps {
  navigation?: any;
  route?: any;
}

const PhotoBookPreview: React.FC<PhotoBookPreviewProps> = ({
  navigation,
  route,
}) => {
  const { photoBookId, format, pageCount, totalPrice, chatId } =
    route?.params || {};
  
  const [photoBook, setPhotoBook] = useState<PhotoBook | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewAreaWidth, setPreviewAreaWidth] = useState<number>(0);
  const [titleEditorVisible, setTitleEditorVisible] = useState(false);
  
  // NEW: Multi-book support
  const [currentBookNumber, setCurrentBookNumber] = useState(1);
  const [totalBooks, setTotalBooks] = useState(1);

  const token = useAppSelector((state: any) => state?.user?.token);
  const user = useAppSelector((state: any) => state?.user?.user);
  const currentAddress = useAppSelector(
    (state: any) => state?.user?.currentAddress
  );
  const themeConfigState = useAppSelector((state: any) =>
    photoBookId ? state?.themeConfig?.byPhotoBookId?.[photoBookId] : null
  );
  const savingTheme = useAppSelector(
    (state: any) => state?.themeConfig?.savingPhotoBookId
  );
  const reduxChatId = useAppSelector((state: any) => state?.chats?.currentChat?._id);
  const reduxMessages = useAppSelector((state: any) => state?.chats?.chatMessages) as
    | IMessage[]
    | undefined;
  // NEW: Get book upload status from Redux
  const bookUploadStatus = useAppSelector(
    (state: any) => state?.chats?.bookUploadStatus?.[chatId] || {}
  );
  const bookMessages = useAppSelector(
    (state: any) => state?.chats?.bookMessages?.[chatId] || {}
  );
  const dispatch = useAppDispatch();

  const themeId = themeConfigState?.themeId ?? 'classic';
  const overrides = themeConfigState?.overrides ?? {};
  const resolvedConfig = resolveThemeConfig(themeId, overrides);

  // NEW: Load books metadata from photoBook
  useEffect(() => {
    if (photoBook?.books && photoBook.books.length > 0) {
      setTotalBooks(photoBook.books.length);
    }
  }, [photoBook]);

  // NEW: Check if all books are uploaded
  const allBooksUploaded = React.useMemo(() => {
    if (!photoBook?.books || photoBook.books.length === 0) return true; // Single book
    
    return photoBook.books.every((book: any) => {
      const status = bookUploadStatus[book.bookNumber];
      return status && status.status === 'completed';
    });
  }, [photoBook, bookUploadStatus]);

  // NEW: Filter messages for current book
  const currentBookMessages = React.useMemo(() => {
    console.log(`🔍 Book ${currentBookNumber}: photoBook.books length:`, photoBook?.books?.length || 0);
    
    if (!photoBook?.books || photoBook.books.length === 0) {
      console.log('🔍 Single book mode - returning all messages');
      return messages; // Single book - show all messages
    }
    
    // Multi-book: Try to get messages from Redux first
    const bookMsgs = bookMessages[currentBookNumber];
    
    if (bookMsgs && bookMsgs.length > 0) {
      console.log(`🔍 Book ${currentBookNumber}: Using Redux messages (${bookMsgs.length} messages)`);
      return bookMsgs;
    }
    
    // Fallback: filter from all messages (if not in Redux yet)
    const book = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
    
    if (!book) {
      console.log(`🔍 Book ${currentBookNumber}: Not found!`);
      return [];
    }
    
    let startIndex = 0;
    for (let i = 0; i < currentBookNumber - 1; i++) {
      startIndex += photoBook.books[i].messageCount;
    }
    const endIndex = startIndex + book.messageCount;
    
    console.log(`🔍 Book ${currentBookNumber}: Slicing ${startIndex}-${endIndex} (${endIndex - startIndex} messages)`);
    const slicedMessages = messages.slice(startIndex, endIndex);
    
    return slicedMessages;
  }, [messages, photoBook, currentBookNumber, bookMessages]);

  // Add console logs for page calculation comparison
  React.useEffect(() => {
    if (currentBookMessages && currentBookMessages.length > 0) {
      const previewPageCount = pageCount || photoBook?.pageCount || 30;
      console.log(`📄 PAGE CALCULATION COMPARISON:`);
      console.log(`📄 Book ${currentBookNumber}: ${currentBookMessages.length} messages`);
      console.log(`📄 Preview showing: ${previewPageCount} pages`);
      console.log(`📄 Route pageCount:`, pageCount);
      console.log(`📄 PhotoBook pageCount:`, photoBook?.pageCount);
      
      if (photoBook?.books && photoBook.books.length > 0) {
        const currentBook = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
        if (currentBook) {
          console.log(`📄 Book metadata estimatedPages: ${currentBook.estimatedPages}`);
          console.log(`📄 Book metadata messageCount: ${currentBook.messageCount}`);
        }
      }
    }
  }, [currentBookMessages, currentBookNumber, pageCount, photoBook]);

  const loadPhotoBook = useCallback(async () => {
    if (!photoBookId) return;
    try {
      const response = await getPhotoBookById(photoBookId);
      const data = response.data?.data ?? response.data;
      setPhotoBook(data);
      if (data?.theme_config) {
        dispatch(
          loadThemeConfigForProject({
            photoBookId,
            themeConfig: {
              themeId: data.theme_config.themeId,
              overrides: data.theme_config.overrides || {},
            },
          })
        );
      }
      if (data?.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (e) {
      Alert.alert('Error', 'Failed to load photo book');
    }
  }, [photoBookId, dispatch]);

  const loadMessages = useCallback(async () => {
    const cid = chatId || (photoBook as PhotoBook)?.chatId;
    if (!cid) return;
    try {
      // Prefer Redux messages to guarantee deterministic order in UI.
      const resolvedCid =
        typeof cid === 'object' ? (cid as any)?._id : cid;
      if (
        reduxChatId &&
        resolvedCid &&
        reduxChatId === resolvedCid &&
        Array.isArray(reduxMessages) &&
        reduxMessages.length > 0
      ) {
        setMessages(filterSystemMessages(reduxMessages));
        return;
      }

      const response = await getMessagesByChat(
        typeof cid === 'object' ? (cid as any)?._id : cid,
        { limit: 2000 }
      );
      const data = response.data?.data ?? response.data;
      const arr = Array.isArray(data) ? data : [];
      setMessages(filterSystemMessages(arr));
    } catch {
      setMessages([]);
    }
  }, [chatId, photoBook, reduxChatId, reduxMessages]);

  useEffect(() => {
    loadPhotoBook();
  }, [photoBookId]);

  useEffect(() => {
    if (photoBook?.chatId) {
      const cid = typeof photoBook.chatId === 'object' ? (photoBook.chatId as any)?._id : photoBook.chatId;
      if (cid) {
        // Prefer Redux messages when available for this chat.
        if (
          reduxChatId &&
          reduxChatId === cid &&
          Array.isArray(reduxMessages) &&
          reduxMessages.length > 0
        ) {
          setMessages(filterSystemMessages(reduxMessages));
          return;
        }

        getMessagesByChat(cid, { limit: 2000 })
          .then((res) => {
            const d = res.data?.data ?? res.data;
            const arr = Array.isArray(d) ? d : [];
            setMessages(filterSystemMessages(arr));
          })
          .catch(() => setMessages([]));
      }
    }
  }, [photoBook?.chatId, reduxChatId, reduxMessages]);

  useEffect(() => {
    if (loading && photoBook !== undefined) {
      setLoading(false);
    }
  }, [photoBook, loading]);

  const handleSelectTheme = (id: string) => {
    dispatch(setThemeConfigForProject({ photoBookId, themeId: id, overrides }));
  };

  const handleDateFormat = (v: 'full' | 'timeOnly' | 'hidden') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, dateFormat: v },
      })
    );
  };
  const handleShowPageNumbers = (v: boolean) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, showPageNumbers: v },
      })
    );
  };
  const handleSenderLabelStyle = (v: 'name' | 'initial' | 'hidden') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, senderLabelStyle: v },
      })
    );
  };
  const handleFontFamily = (v: string) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, fontFamily: v },
      })
    );
  };
  const handleFontSize = (v: number) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, fontSize: v },
      })
    );
  };
  const handleMessageBold = (v: boolean) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, messageBold: v },
      })
    );
  };
  const handleMessageItalic = (v: boolean) => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, messageItalic: v },
      })
    );
  };
  const handleImageLayout = (v: 'fullPage' | 'grid' | 'maxGrid') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, imageLayout: v },
      })
    );
  };
  const handleDateStyle = (v: 'short' | 'long' | 'dayName') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, dateStyle: v },
      })
    );
  };
  const handleDateLanguage = (v: 'en' | 'fr' | 'es') => {
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, dateLanguage: v },
      })
    );
  };

  const handleEditTitles = () => {
    setTitleEditorVisible(true);
  };

  // NEW: Retry upload for failed book
  const handleRetryUpload = async (bookNumber: number) => {
    Alert.alert(
      'Retry Upload',
      `Retry uploading Book ${bookNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            try {
              console.log(`🔄 Retrying Book ${bookNumber}...`);
              
              // Update status to "uploading"
              dispatch(updateBookUploadStatus({
                chatId,
                bookNumber,
                status: 'uploading',
                progress: 0,
              }));
              
              // TODO: Implement actual retry logic
              // This would need to re-fetch the book chunk data and re-upload
              // For now, just show a message
              Alert.alert('Info', 'Retry functionality will be implemented. Please restart the upload from the chat screen.');
              
              // Reset to failed state for now
              dispatch(updateBookUploadStatus({
                chatId,
                bookNumber,
                status: 'failed',
                progress: 0,
                error: 'Retry not yet implemented',
              }));
              
            } catch (error: any) {
              Alert.alert('Error', `Retry failed: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleSaveTitles = (customTitles: any) => {
    console.log('📥 Received titles in index.tsx:', JSON.stringify(customTitles, null, 2));
    dispatch(
      setThemeConfigForProject({
        photoBookId,
        themeId,
        overrides: { ...overrides, customTitles },
      })
    );
    console.log('✅ Dispatched to Redux with overrides:', { ...overrides, customTitles });
  };

  const handleGeneratePdf = async () => {
    if (!token) {
      Alert.alert('Error', 'Please log in to continue');
      navigation.navigate('LogIn');
      return;
    }
    setSaveError(null);
    setGeneratingPdf(true);
    const theme_config: ThemeConfigStored = {
      themeId,
      schemaVersion: 1,
      overrides,
    };
    try {
      dispatch(setSavingTheme(photoBookId));
      await updatePhotoBookThemeConfig(photoBookId, theme_config);
      dispatch(setSavingTheme(null));
      const response = await generatePhotoBookPdf(photoBookId);
      const updated = response.data?.data?.photoBook ?? response.data?.photoBook;
      if (updated) setPhotoBook(updated);
      await loadPhotoBook();
      
      // Check if multi-book
      const totalBooksGenerated = updated?.books?.length || 1;
      const message = totalBooksGenerated > 1
        ? `All ${totalBooksGenerated} PDFs generated successfully! You can view them below.`
        : 'PDF generated successfully! It is saved and you can view it below.';
      
      Alert.alert(
        'Success',
        message,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      dispatch(setSavingTheme(null));
      setSaveError(
        error.response?.data?.message || error.message || 'Failed to generate PDF'
      );
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to generate PDF'
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!currentAddress) {
      Alert.alert('Error', 'Please select a shipping address first');
      navigation.navigate('Addresses');
      return;
    }
    if (!photoBook?.generatedPdfUrl) {
      Alert.alert('Error', 'Please generate PDF first');
      return;
    }
    setOrdering(true);
    try {
      const shippingAddress = {
        name: `${currentAddress.first_name} ${currentAddress.last_name}`,
        addressLine1: currentAddress.address_one,
        addressLine2: currentAddress.address_two || '',
        city: currentAddress.city,
        postalCode: currentAddress.postal_code || '',
        country: currentAddress.country,
        phoneNumber: currentAddress.phone_no,
      };
      const response = await createGelatoOrder(photoBookId, shippingAddress);
      const orderData = response.data?.data ?? response.data;
      const orderId =
        orderData?.orderId ||
        orderData?.gelatoOrder?._id ||
        orderData?.gelatoOrderId ||
        orderData?.id;
      const pUrl = orderData?.previewUrl || orderData?.orderPreviewUrl;
      if (pUrl) setPreviewUrl(pUrl);
      navigation.navigate('OrderSuccess', {
        orderId: orderId || 'unknown',
        photoBookId,
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create order'
      );
    } finally {
      setOrdering(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = previewAreaWidth > 0 ? previewAreaWidth : screenWidth - wp(6);
  const previewHeight = containerWidth * A5_ASPECT;

  return (
    <View style={styles.container}>
      <CustomHeader text="Preview & Checkout" onPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <Text style={styles.title}>Book Preview</Text>

        <View style={styles.twoColumn}>
          <View style={styles.leftColumn}>
            <ThemeSelector
              selectedThemeId={themeId}
              onSelectTheme={handleSelectTheme}
            />
            <OptionsPanel
              overrides={overrides}
              onDateFormatChange={handleDateFormat}
              onShowPageNumbersChange={handleShowPageNumbers}
              onSenderLabelStyleChange={handleSenderLabelStyle}
              onFontFamilyChange={handleFontFamily}
              onFontSizeChange={handleFontSize}
              onMessageBoldChange={handleMessageBold}
              onMessageItalicChange={handleMessageItalic}
              onImageLayoutChange={handleImageLayout}
              onDateStyleChange={handleDateStyle}
              onDateLanguageChange={handleDateLanguage}
              onEditTitles={handleEditTitles}
            />
          </View>

          <View style={styles.previewSection}>
            {/* NEW: Book Selector for multi-book with upload status */}
            {totalBooks > 1 && (
              <View style={styles.bookSelector}>
                <Text style={styles.bookSelectorTitle}>Select Book:</Text>
                <View style={styles.bookButtons}>
                  {Array.from({ length: totalBooks }, (_, i) => i + 1).map(bookNum => {
                    const statusData = bookUploadStatus[bookNum] || { status: 'pending', progress: 0 };
                    const { status, progress, error } = statusData;
                    
                    const isPending = status === 'pending';
                    const isUploading = status === 'uploading';
                    const isCompleted = status === 'completed';
                    const isFailed = status === 'failed';
                    
                    return (
                      <View key={bookNum} style={styles.bookButtonContainer}>
                        <TouchableOpacity
                          style={[
                            styles.bookButton,
                            currentBookNumber === bookNum && styles.bookButtonActive,
                            !isCompleted && styles.bookButtonDisabled,
                          ]}
                          disabled={!isCompleted}
                          onPress={() => {
                            console.log(`🔍 Switching to book ${bookNum}`);
                            setCurrentBookNumber(bookNum);
                          }}
                        >
                          <Text
                            style={[
                              styles.bookButtonText,
                              currentBookNumber === bookNum && styles.bookButtonTextActive,
                              !isCompleted && styles.bookButtonTextDisabled,
                            ]}
                          >
                            Book {bookNum}
                          </Text>
                        </TouchableOpacity>
                        
                        {/* Upload Status Indicator */}
                        {isPending && (
                          <Text style={styles.uploadStatus}>⏳ Pending...</Text>
                        )}
                        {isUploading && (
                          <Text style={styles.uploadStatus}>📤 Uploading {progress}%</Text>
                        )}
                        {isCompleted && (
                          <Text style={styles.uploadStatusSuccess}>✅ Ready</Text>
                        )}
                        {isFailed && (
                          <View style={styles.failedContainer}>
                            <Text style={styles.uploadStatusFailed}>❌ Failed</Text>
                            <TouchableOpacity
                              style={styles.retryButton}
                              onPress={() => handleRetryUpload(bookNum)}
                            >
                              <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
                
                {/* Warning if not all books uploaded */}
                {!allBooksUploaded && (
                  <View style={styles.uploadWarning}>
                    <Text style={styles.uploadWarningText}>
                      ⚠️ Please wait for all books to upload before generating PDF
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            <Text style={styles.disclaimer}>
              Preview is approximate. Final PDF may have minor layout differences.
            </Text>
            <View
              style={styles.previewBoxWrapper}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0) setPreviewAreaWidth(w);
              }}
            >
            {previewUrl ? (
              <Image source={{ uri: previewUrl }} style={styles.previewImage} />
            ) : photoBook?.generatedPdfUrl ? (
              <View style={styles.a5Wrapper}>
                <View style={[styles.pdfPlaceholder, { height: previewHeight }]}>
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfText}>PDF ready (saved)</Text>
                  <Text style={styles.pdfSubtext}>Tap "View PDF" below to open and check how it looks.</Text>
                </View>
              </View>
            ) : (
              <View style={styles.a5Wrapper}>
                <View
                  style={[
                    styles.a5Container,
                    {
                      width: '100%',
                      backgroundColor: COLORS.white2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: 4,
                    },
                  ]}
                >
                  {messages.length > 0 ? (
                    <>
                      {(() => {
                        // For multi-book: use book's estimatedPages, for single book: use pageCount
                        let finalPageCount = pageCount || photoBook?.pageCount || 30;
                        
                        if (photoBook?.books && photoBook.books.length > 0) {
                          const currentBook = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
                          if (currentBook && currentBook.estimatedPages) {
                            finalPageCount = currentBook.estimatedPages;
                          }
                        }
                        
                        console.log(`📄 PASSING TO BookPreviewPages: ${currentBookMessages.length} messages, pageCount: ${finalPageCount}`);
                        return null;
                      })()}
                      <BookPreviewPages
                        messages={currentBookMessages}
                        pageCount={(() => {
                          // For multi-book: use book's estimatedPages, for single book: use pageCount
                          if (photoBook?.books && photoBook.books.length > 0) {
                            const currentBook = photoBook.books.find((b: any) => b.bookNumber === currentBookNumber);
                            if (currentBook && currentBook.estimatedPages) {
                              return currentBook.estimatedPages;
                            }
                          }
                          return pageCount || photoBook?.pageCount || 30;
                        })()}
                        resolvedConfig={resolvedConfig}
                        containerWidth={Math.max(containerWidth, 300)}
                        format={format || photoBook?.format || 'standard_14_8x21'}
                      />
                    </>
                  ) : (
                    <View style={styles.emptyPreview}>
                      <ActivityIndicator size="small" color={COLORS.lightBlue} />
                      <Text style={styles.emptyText}>Loading messages…</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            </View>
          </View>
        </View>

        {saveError ? (
          <Text style={styles.errorText}>{saveError}</Text>
        ) : null}

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Format:</Text>
            <Text style={styles.detailValue}>
              {format === 'square_14x14'
                ? 'Square (14×14 cm)'
                : 'Standard (14.8×21 cm)'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pages:</Text>
            <Text style={styles.detailValue}>{pageCount ?? photoBook?.pageCount ?? 30}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Price:</Text>
            <Text style={styles.detailValue}>
              ${(totalPrice ?? photoBook?.totalPrice ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {!photoBook?.generatedPdfUrl && (
          <CustomButton
            text={
              savingTheme
                ? 'Saving theme…'
                : generatingPdf
                ? 'Generating PDF…'
                : !allBooksUploaded
                ? 'Waiting for uploads…'
                : 'Generate PDF'
            }
            onPress={handleGeneratePdf}
            animating={savingTheme === photoBookId || generatingPdf}
            disable={savingTheme === photoBookId || generatingPdf || !allBooksUploaded}
          />
        )}
        {photoBook?.books && photoBook.books.length > 0 ? (
          // Multi-book: Show button for each book
          <>
            <View style={styles.pdfButtonsContainer}>
              {photoBook.books.map((book: any) => (
                <TouchableOpacity
                  key={book.bookNumber}
                  style={[
                    styles.viewPdfButton,
                    !book.generatedPdfUrl && styles.viewPdfButtonDisabled,
                  ]}
                  disabled={!book.generatedPdfUrl}
                  onPress={() => {
                    if (book.generatedPdfUrl) {
                      Linking.openURL(book.generatedPdfUrl).catch(() =>
                        Alert.alert('Error', 'Could not open PDF')
                      );
                    }
                  }}
                >
                  <Text style={styles.viewPdfButtonText}>
                    View Book {book.bookNumber} PDF
                    {book.status === 'generating' && ' (Generating...)'}
                    {book.status === 'failed' && ' (Failed)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <CustomButton
              text={ordering ? 'Creating Order…' : 'Create Order (All Books)'}
              onPress={handleCreateOrder}
              animating={ordering}
            />
          </>
        ) : photoBook?.generatedPdfUrl ? (
          // Single book: Show single button
          <>
            <TouchableOpacity
              style={styles.viewPdfButton}
              onPress={() => {
                const url = photoBook.generatedPdfUrl;
                if (url) Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open PDF'));
              }}
            >
              <Text style={styles.viewPdfButtonText}>View PDF</Text>
            </TouchableOpacity>
            <CustomButton
              text={ordering ? 'Creating Order…' : 'Create Order'}
              onPress={handleCreateOrder}
              animating={ordering}
            />
          </>
        ) : null}
      </ScrollView>

      <TitleEditorModal
        visible={titleEditorVisible}
        onClose={() => setTitleEditorVisible(false)}
        customTitles={overrides.customTitles || { years: {}, months: {} }}
        onSave={handleSaveTitles}
        messages={messages}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white2,
  },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: wp(3), paddingVertical: hp(2), paddingBottom: hp(6) },
  title: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(2),
  },
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp(2),
  },
  leftColumn: {
    width: '100%',
    maxWidth: 320,
    marginBottom: wp(4),
  },
  previewColumn: { flex: 1, minWidth: 200 },
  previewSection: {
    flex: 1,
    minWidth: 200,
    width: '100%',
  },
  previewBoxWrapper: {
    width: '100%',
  },
  disclaimer: {
    fontSize: rfs(11),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginBottom: hp(1),
    fontStyle: 'italic',
  },
  a5Wrapper: {
    width: '100%',
    marginBottom: hp(2),
    borderRadius: 4,
    overflow: 'hidden',
  },
  a5Container: {
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rfs(14),
    color: COLORS.textGray,
    marginTop: hp(1),
  },
  previewImage: {
    width: '100%',
    height: hp(40),
    borderRadius: wp(2),
    backgroundColor: COLORS.lightGray,
  },
  pdfPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  pdfIcon: { fontSize: rfs(48), marginBottom: hp(1) },
  pdfText: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  pdfSubtext: {
    fontSize: rfs(12),
    color: COLORS.textGray,
    marginTop: hp(1),
    textAlign: 'center',
  },
  viewPdfButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(2),
    alignItems: 'center',
  },
  viewPdfButtonText: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.lightBlue,
  },
  errorText: {
    fontSize: rfs(12),
    color: '#c00',
    marginBottom: hp(1),
  },
  detailsContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
  },
  detailLabel: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  detailValue: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  // NEW: Book selector styles
  bookSelector: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: COLORS.lightGray,
    borderRadius: wp(2),
  },
  bookSelectorTitle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    marginBottom: hp(1),
  },
  bookButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  bookButtonContainer: {
    alignItems: 'center',
  },
  bookButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    backgroundColor: COLORS.white2,
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  bookButtonActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.lightBlue,
  },
  bookButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.lightGray,
  },
  bookButtonText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  bookButtonTextActive: {
    color: COLORS.white2,
    fontFamily: fonts.POPPINS.SemiBold,
  },
  bookButtonTextDisabled: {
    color: COLORS.gray,
  },
  uploadStatus: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.gray,
    marginTop: hp(0.5),
  },
  uploadStatusSuccess: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.green,
    marginTop: hp(0.5),
  },
  uploadStatusFailed: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.red,
    marginTop: hp(0.5),
  },
  failedContainer: {
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  retryButton: {
    marginTop: hp(0.5),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    backgroundColor: COLORS.lightBlue,
    borderRadius: wp(1),
  },
  retryButtonText: {
    fontSize: rfs(10),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.white2,
  },
  uploadWarning: {
    marginTop: hp(2),
    padding: wp(2),
    backgroundColor: '#FFF3CD',
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  uploadWarningText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: '#856404',
    textAlign: 'center',
  },
  pdfButtonsContainer: {
    marginBottom: hp(2),
  },
  viewPdfButtonDisabled: {
    opacity: 0.5,
  },
});

export default PhotoBookPreview;
