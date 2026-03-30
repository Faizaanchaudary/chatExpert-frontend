import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import moment from 'moment';
import {styles} from './style';
import {ChatComponentProps} from '../../interfaces/ChatComponents';

const TextMessage = ({item, stylesConfig}: ChatComponentProps) => {
  const {
    fontFamily,
    fontStyle,
    fontSize,
    senderBackground,
    receiverBackground,
    senderTextColor,
    receiverTextColor,
    hideName,
    dateFormat,
  } = stylesConfig;

  const formattedDate = useMemo(() => {
    const combined = [item.date, item.sendingTime].filter(Boolean).join(' ');
    if (!combined.trim()) return '—';
    const formats = [
      'DD/MM/YYYY h:mm:ss A',
      'DD/MM/YYYY, h:mm A',
      'D/M/YYYY, h:mm A',
      'DD/MM/YYYY hh:mm',
      'D/M/YY h:mm A',
      dateFormat,
    ];
    const parsed = moment(combined, formats, true);
    if (!parsed.isValid()) return item.sendingTime || item.date || '—';
    return parsed.format(dateFormat);
  }, [item.date, item.sendingTime, dateFormat]);

  const isSender = item.sender === true;

  return (
    <View>
      <Text
        style={
          isSender ? styles.nameTextStyle : styles.VoiceReceiverTextTextStyle
        }>
        {hideName ? '' : item.senderName}
        {'   '}
        <Text style={styles.dateTextStyle}>{formattedDate}</Text>
      </Text>
      <View
        style={[
          isSender ? styles.senderTextContainer : styles.receiverTextContainer,
          {backgroundColor: isSender ? senderBackground : receiverBackground},
        ]}>
        <Text
          style={[
            isSender ? styles.senderTextStyle : styles.receiverTextStyle,
            {
              fontSize,
              color: isSender ? senderTextColor : receiverTextColor,
              fontFamily,
              fontWeight: fontStyle === 'bold' ? 'bold' : undefined,
              textDecorationLine:
                fontStyle === 'underline' ? 'underline' : undefined,
              fontStyle: fontStyle === 'italic' ? 'italic' : undefined,
            },
          ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(TextMessage);
