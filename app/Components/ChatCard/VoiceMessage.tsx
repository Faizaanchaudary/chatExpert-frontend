import React from 'react';
import {Image, Text, View} from 'react-native';
import {ChatComponentProps} from '../../interfaces/ChatComponents';

import {icn} from '../../assets/icons';
import {rhp} from '../../utils/reponsiveness';
import {styles} from './style';

const VoiceMessage = ({item}: ChatComponentProps) => {
  return (
    <View>
      <Text style={styles.nameTextStyle}>
        {item.senderName}{' '}
        <Text style={styles.dateTextStyle}>{item.sendingTime}</Text>
      </Text>
      <View style={styles.voiceMainContainer}>
        <View style={styles.voiceInnerContainer}>
          <Image source={icn.soundIcn} style={styles.soundIcnStyle} />
          {/* <View style={styles.voiceQrContainer}>
            <MediaQR
              localPath={item.localPath}
              remotePath={item.remotePath}
              size={rhp(170)}
            />
          </View> */}
        </View>
        <View style={styles.senderVoiceContainer}>
          <Text style={styles.receiverTextStyle}>Voice Here</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(VoiceMessage);
