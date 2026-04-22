import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {icn} from '../../assets/icons';
import {styles} from './style';
import {hp, rfs, rhp, rwp, width, wp} from '../../utils/reponsiveness';

import {img} from '../../assets/img';
import moment from 'moment';
import {IMessage} from '../../interfaces/IMessage';
import MediaQR from '../MediaQR/MediaQR';
import VideoMessage from './VideoMessage';
import VoiceMessage from './VoiceMessage';
import ImageMessage from './ImageMessage';
import TextMessage from './TextMessage';

interface ChatStyleConfig {
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  senderBackground: string;
  receiverBackground: string;
  senderTextColor: string;
  receiverTextColor: string;
  chatBackground: string;
  dateFormat: string;
  hideName: boolean;
}

interface ChatCardProps {
  item: IMessage;
  index: number;
  checkPress?: () => void;
  stylesConfig: ChatStyleConfig;
  searchQuery?: string;
  isCurrentMatch?: boolean;
  isMatch?: boolean;
}

const ChatCard = forwardRef(
  ({item, checkPress, index, stylesConfig, searchQuery, isCurrentMatch, isMatch}: ChatCardProps, ref: any) => {
    const [checked, setChecked] = useState(item?.isCheck);

    useEffect(() => {
      setChecked(item?.isCheck);
    }, [item?.isCheck]);

    useImperativeHandle(ref, () => ({
      // each key is connected to `ref` as a method name
      // they can execute code directly, or call a local method
      check: () => {
        console.log('check here');
        if (checkPress) {
          console.log('check second here');
          checkPress();
          setChecked(true);
        }
      },
      uncheck: () => {
        console.log('uncheck here');
        if (checkPress) {
          checkPress();
          setChecked(false);
        }
      },
    }));

    if (item?.messageType === 'unknown') return null; // If no text or picture, return null

    const isSender = item.sender === true;

    return (
      <View
        style={[
          styles.chatContainer,
          {
            backgroundColor: stylesConfig.chatBackground,
            alignSelf: isSender ? 'flex-end' : 'flex-start',
            flexDirection: isSender ? 'row-reverse' : 'row',
            maxWidth: '85%',
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            setChecked(prev => !prev);
            checkPress?.();
          }}
          style={styles.oddContainerStyle}
          activeOpacity={0.7}>
          <Image
            source={checked ? icn.chatFillIcn : icn.chatUnFillIcn}
            style={styles.checkIcn}
          />
        </TouchableOpacity>
        <View style={{marginLeft: isSender ? 0 : wp(5), marginRight: isSender ? wp(5) : 0}}>
          {item.messageType === 'video' ? (
            <VideoMessage item={item} stylesConfig={stylesConfig} />
          ) : item.messageType === 'audio' ? (
            <VoiceMessage item={item} stylesConfig={stylesConfig} />
          ) : item.messageType === 'image' ? (
            <ImageMessage item={item} stylesConfig={stylesConfig} />
          ) : item.text ? (
            <TextMessage 
              item={item} 
              stylesConfig={stylesConfig}
              searchQuery={searchQuery}
              isCurrentMatch={isCurrentMatch}
              isMatch={isMatch}
            />
          ) : null}
        </View>
      </View>
    );
  },
);

// const ChatCard = forwardRef(
//   (
//     {
//       item,
//       checkPress,
//       index,
//       stylesConfig
//     }: ChatCardProps,
//     ref: any,
//   ) => {

//     const {
//       fontFamily,
//       fontStyle,
//       fontSize,
//       senderBackground,
//       receiverBackground,
//       senderTextColor,
//       receiverTextColor,
//       chatBackground,
//       dateFormat,
//       hideName,
//     } = stylesConfig;

//     const [checked, setChecked] = useState(item?.isCheck);
//     // const convertToStandardDateFormat = inputText => {
//     //   // Regular expressions for different date patterns
//     //   const datePatterns = [
//     //     /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))? ?([APMapm]{2})?\b/g, // d/M/yy, h:mm AM/PM (including 2-digit year)
//     //     /\b(\d{2})[\/-](\d{2})[\/-](\d{4})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))? ?([APMapm]{2})?\b/g, // DD/MM/YYYY or MM/DD/YYYY with time
//     //     /\b(\d{4})[\/-](\d{2})[\/-](\d{2})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))? ?([APMapm]{2})?\b/g, // YYYY/MM/DD with time
//     //     /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/g, // d/M/yy or MM/DD/YYYY (without time)
//     //     /\b(\d{4})[\/-](\d{2})[\/-](\d{2})\b/g, // YYYY/MM/DD (without time)
//     //   ];

//     //   let convertedText = inputText;

//     //   datePatterns.forEach(pattern => {
//     //     convertedText = convertedText.replace(pattern, match => {
//     //       // Try to parse the matched date string with specific formats
//     //       const parsedDate = moment(match, [
//     //         'M/D/YY h:mm A', // Matches '9/20/24, 1:40 PM'
//     //         'M/D/YYYY h:mm A', // Matches '9/20/2024, 1:40 PM'
//     //         'DD/MM/YYYY hh:mm:ss A',
//     //         'MM/DD/YYYY hh:mm:ss A',
//     //         'D/MM/YYYY hh:mm:ss A',
//     //         'YYYY/MM/DD hh:mm:ss A',
//     //         'DD-MM-YYYY hh:mm:ss A',
//     //         'YYYY-MM-DD hh:mm:ss A',
//     //         'DD/MM/YYYY',
//     //         'MM/DD/YYYY',
//     //         'YYYY/MM/DD',
//     //         'YYYY-MM-DD',
//     //       ]);

//     //       // If valid, format the date to DD/MM/YYYY hh:mm:ss A
//     //       if (parsedDate.isValid()) {
//     //         return parsedDate.format('DD/MM/YYYY hh:mm:ss A');
//     //       }

//     //       return match; // If parsing fails, return the original match
//     //     });
//     //   });

//     //   return convertedText;
//     // };

//     useEffect(() => {
//       setChecked(item?.isCheck);
//     }, [item?.isCheck]);

//     useImperativeHandle(ref, () => ({
//       // each key is connected to `ref` as a method name
//       // they can execute code directly, or call a local method
//       check: () => {
//         console.log('check here');
//         if (checkPress) {
//           console.log('check second here');
//           checkPress();
//           setChecked(true);
//         }
//       },
//       uncheck: () => {
//         console.log('uncheck here');
//         if (checkPress) {
//           console.log('uncheck second here', item?.senderMessage);
//           checkPress();
//           setChecked(false);
//         }
//       },
//     }));

//     if (!item?.isPicture && !item?.text) return null; // If no text or picture, return null

//     const formattedDate = useMemo(() => {
//       return moment(
//         `${item.date} ${item.sendingTime}`,
//         stylesConfig.dateFormat,
//       ).format(stylesConfig.dateFormat);
//     }, [item.date, item.sendingTime, stylesConfig.dateFormat]);

//     return (
//       <>
//         {/* {index == 3 && (
//           <Text style={styles.todayDateTextStyle}>9th Mar,2024</Text>
//         )} */}
//         <View style={[styles.chatContainer, {backgroundColor: chatBackground}]}>
//           <TouchableOpacity
//             onPress={checkPress}
//             style={!item.sender && styles.oddContainerStyle}>
//             <Image
//               source={checked ? icn.chatFillIcn : icn.chatUnFillIcn}
//               style={styles.checkIcn}
//             />
//           </TouchableOpacity>
//           {item.sender ? (
//             <View>
//               {item.text && (
//                 <View style={{marginLeft: wp(5)}}>
//                   <Text style={[styles.nameTextStyle]}>
//                     {hideName ? '' : item.senderName}
//                     <Text style={styles.dateTextStyle}>
//                       {'    '}
//                       {formattedDate == 'Invalid date'
//                         ? 'Invalid date'
//                         : formattedDate}
//                     </Text>
//                   </Text>
//                   <View
//                     style={[
//                       styles.senderTextContainer,
//                       {backgroundColor: senderBackground},
//                     ]}>
//                     <Text
//                       style={[
//                         styles.senderTextStyle,
//                         {
//                           fontSize: fontSize,
//                           color: senderTextColor,
//                           fontFamily: fontFamily,
//                           fontWeight: fontStyle == 'bold' ? 'bold' : undefined,
//                           textDecorationLine:
//                             fontStyle == 'underline' ? 'underline' : undefined,
//                           fontStyle:
//                             fontStyle == 'italic' ? 'italic' : undefined,
//                         },
//                       ]}>
//                       {item?.senderMessage}
//                     </Text>
//                   </View>
//                 </View>
//               )}
//               <View style={styles.commonPadding}>
//                 {item.video && (
//                   <View>
//                     <Text style={styles.nameTextStyle}>
//                       {item.senderName}{' '}
//                       <Text style={styles.dateTextStyle}>
//                         {'    '}
//                         {moment(
//                           item.sendingTime,
//                           'DD/MM/YYYY hh:mm:ss A',
//                         ).format(dateFormat) == 'Invalid date'
//                           ? moment(item.sendingTime, 'M/D/YY h:mm A').format(
//                               dateFormat,
//                             )
//                           : moment(
//                               item.sendingTime,
//                               'DD/MM/YYYY hh:mm:ss A',
//                             ).format(dateFormat)}
//                       </Text>
//                     </Text>
//                     <View style={styles.chatContainer}>
//                       {/* Path should come from item */}
//                       <MediaQR
//                         localPath={item.localPath}
//                         remotePath={item.remotePath}
//                         size={rhp(140)}
//                       />
//                       <ImageBackground
//                         imageStyle={styles.editImageContainer}
//                         resizeMode="cover"
//                         source={img.editImage}
//                         style={styles.editImageStyle}>
//                         <Image
//                           source={icn.playPauseIcn}
//                           style={styles.playPauseIcnStyle}
//                         />
//                       </ImageBackground>
//                     </View>
//                   </View>
//                 )}
//                 {item.localPath && (
//                   <View>
//                     <Text style={styles.nameTextStyle}>
//                       {item.senderName}{' '}
//                       <Text style={styles.dateTextStyle}>
//                         {item.sendingTime}
//                       </Text>
//                     </Text>
//                     <View style={styles.chatContainer}>
//                       <MediaQR
//                         localPath={item.localPath}
//                         remotePath={item.remotePath}
//                         size={200} // Adjust the size of the QR code
//                         color="black" // Set the QR code color
//                         backgroundColor="white" // Set the background color
//                       />

//                       {/* </ImageBackground> */}
//                     </View>
//                   </View>
//                 )}
//                 {item.voice && (
//                   <>
//                     <Text style={styles.nameTextStyle}>
//                       {item.senderName}{' '}
//                       <Text style={styles.dateTextStyle}>
//                         {item.sendingTime}
//                       </Text>
//                     </Text>
//                     <View style={styles.voiceMainContainer}>
//                       <View style={styles.voiceInnerContainer}>
//                         <Image
//                           source={icn.soundIcn}
//                           style={styles.soundIcnStyle}
//                         />

//                         <View style={styles.voiceQrContainer}>
//                           {/* Voice recording  */}
//                           <MediaQR
//                             localPath={item.localPath}
//                             remotePath={item.remotePath}
//                             size={rhp(170)}
//                           />
//                         </View>
//                       </View>
//                       <View style={styles.senderVoiceContainer}>
//                         <Text style={styles.receiverTextStyle}>Voice Here</Text>
//                       </View>
//                     </View>
//                   </>
//                 )}
//               </View>
//             </View>
//           ) : (
//             <>
//               <View style={[styles.chatContainer]}>
//                 {item.text && (
//                   <View>
//                     <Text style={styles.VoiceReceiverTextTextStyle}>
//                       {hideName ? '' : item.senderName}
//                       {'   '}
//                       <Text style={styles.dateTextStyle}>
//                         {formattedDate == 'Invalid date'
//                           ? 'Invalid date'
//                           : formattedDate}
//                       </Text>
//                     </Text>
//                     <View
//                       style={[
//                         styles.receiverTextContainer,
//                         {backgroundColor: receiverBackground},
//                       ]}>
//                       <Text
//                         style={[
//                           styles.receiverTextStyle,
//                           {
//                             fontSize: fontSize,
//                             color: receiverTextColor,
//                             fontFamily: fontFamily,
//                             fontWeight:
//                               fontStyle == 'bold' ? 'bold' : undefined,
//                             textDecorationLine:
//                               fontStyle == 'underline'
//                                 ? 'underline'
//                                 : undefined,
//                             fontStyle:
//                               fontStyle == 'italic' ? 'italic' : undefined,
//                           },
//                         ]}>
//                         {item.senderMessage}
//                       </Text>
//                     </View>
//                   </View>
//                 )}
//               </View>
//               {item.video && (
//                 <View>
//                   <Text style={styles.receiverTextTextStyle}>
//                     {item.receiverName}
//                     {'   '}
//                     <Text style={styles.dateTextStyle}>
//                       {item.receivingTime}
//                     </Text>
//                   </Text>
//                   <View style={styles.chatContainer}>
//                     <MediaQR
//                       localPath={item.localPath}
//                       remotePath={item.remotePath}
//                       size={rhp(140)}
//                     />
//                     <ImageBackground
//                       imageStyle={styles.editImageContainer}
//                       resizeMode="cover"
//                       source={img.editImage}
//                       style={styles.editImageStyle}>
//                       <Image
//                         source={icn.playPauseIcn}
//                         style={styles.playPauseIcnStyle}
//                       />
//                     </ImageBackground>
//                   </View>
//                 </View>
//               )}
//               {item.voice && (
//                 <View style={styles.voiceMainContainer}>
//                   <Text style={styles.VoiceReceiverTextTextStyle}>
//                     {item.receiverName}
//                     {'    '}
//                     <Text style={styles.dateTextStyle}>
//                       {item.receivingTime}
//                     </Text>
//                   </Text>
//                   <View style={styles.voiceInnerContainer}>
//                     <Image source={icn.soundIcn} style={styles.soundIcnStyle} />

//                     <View style={styles.voiceQrContainer}>
//                       {/* Voice note */}
//                       <MediaQR
//                         localPath={item.localPath}
//                         remotePath={item.remotePath}
//                         size={rhp(170)}
//                       />
//                     </View>
//                   </View>
//                   <View style={styles.receiverVoiceContainer}>
//                     <Text style={styles.receiverTextStyle}>Voice Here</Text>
//                   </View>
//                 </View>
//               )}
//               {item.localPath && (
//                 <View>
//                   <Text style={styles.nameTextStyle}>
//                     {item.senderName}{' '}
//                     <Text style={styles.dateTextStyle}>{item.sendingTime}</Text>
//                   </Text>
//                   <View
//                     style={[
//                       styles.chatContainer,
//                       {justifyContent: 'flex-end'},
//                     ]}>
//                     <MediaQR
//                       localPath={item.localPath}
//                       remotePath={item.remotePath}
//                       size={80} // Adjust the size of the QR code
//                       color="black" // Set the QR code color
//                       backgroundColor="white" // Set the background color
//                     />
//                     <Image
//                       source={{uri: item?.localPath}}
//                       style={{width: 80, height: 80}}
//                     />
//                     {/* </ImageBackground> */}
//                   </View>
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//       </>
//     );
//   },
// );

export default React.memo(ChatCard);
