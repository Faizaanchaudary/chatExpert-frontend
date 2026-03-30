import React, {useMemo} from 'react';
import {Image, Text, View} from 'react-native';
import {ChatComponentProps} from '../../interfaces/ChatComponents';
import MediaQR from '../MediaQR/MediaQR';
import {styles} from './style';
import moment from 'moment';

const ImageMessage = ({item, stylesConfig}: ChatComponentProps) => {
  const {dateFormat} = stylesConfig;

  const formattedDate = useMemo(() => {
    const combined = [item.date, item.sendingTime].filter(Boolean).join(' ');
    if (!combined.trim()) return '—';
    const parsed = moment(combined, [dateFormat, 'DD/MM/YYYY h:mm A', 'D/M/YY h:mm A'], true);
    return parsed.isValid() ? parsed.format(dateFormat) : (item.sendingTime || '—');
  }, [item.date, item.sendingTime, dateFormat]);

  const isSender = item.sender === true;
  return (
    <View>
      <Text style={isSender ? styles.nameTextStyle : styles.VoiceReceiverTextTextStyle}>
        {item.text} <Text style={styles.dateTextStyle}>{formattedDate}</Text>
      </Text>
      <View style={styles.chatContainer}>
        <Image
          source={{
            uri: item.localPath?.startsWith('file://')
              ? item.localPath
              : `file://${item.localPath}`,
          }}
          style={{width: 200, height: 200}}
        />
      </View>
    </View>
  );
};

export default React.memo(ImageMessage);
