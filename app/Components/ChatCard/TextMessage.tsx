import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import moment from 'moment';
import {styles} from './style';
import {ChatComponentProps} from '../../interfaces/ChatComponents';

interface TextMessageProps extends ChatComponentProps {
  searchQuery?: string;
  isCurrentMatch?: boolean;
  isMatch?: boolean;
}

const TextMessage = ({item, stylesConfig, searchQuery, isCurrentMatch, isMatch}: TextMessageProps) => {
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

  // Function to highlight search matches in text
  const renderHighlightedText = (text: string) => {
    if (!searchQuery || !searchQuery.trim() || !text) {
      return text;
    }

    const query = searchQuery.toLowerCase();
    const lowerText = text.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let matchIndex = lowerText.indexOf(query);
    let key = 0;

    if (matchIndex === -1) {
      return text;
    }

    while (matchIndex !== -1) {
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      // Add highlighted match
      const highlightColor = isCurrentMatch ? '#FFD700' : '#FFEB3B';
      
      parts.push(
        <Text
          key={`match-${key++}`}
          style={{
            backgroundColor: highlightColor,
            fontWeight: isCurrentMatch ? 'bold' : 'normal',
            color: '#000000', // Ensure text is visible
          }}>
          {text.substring(matchIndex, matchIndex + query.length)}
        </Text>
      );

      lastIndex = matchIndex + query.length;
      matchIndex = lowerText.indexOf(query, lastIndex);
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

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
          isMatch && {
            borderWidth: 2,
            borderColor: isCurrentMatch ? '#FFD700' : '#FFEB3B80',
          }
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
          {renderHighlightedText(item.text)}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(TextMessage);
