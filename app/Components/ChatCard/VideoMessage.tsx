import React from 'react';
import {Image, ImageBackground, Text, View} from 'react-native';
import {ChatComponentProps} from '../../interfaces/ChatComponents';
import MediaQR from '../MediaQR/MediaQR';
import {img} from '../../assets/img';
import {icn} from '../../assets/icons';
import {styles} from './style';
import {rhp} from '../../utils/reponsiveness';

const VideoMessage = ({item}: ChatComponentProps) => {
  return (
    <View>
      <Text style={styles.nameTextStyle}>
        {item.senderName}{' '}
        <Text style={styles.dateTextStyle}>{item.sendingTime}</Text>
      </Text>
      <View style={styles.chatContainer}>
        {/* <MediaQR
          localPath={item.localPath}
          remotePath={item.remotePath}
          size={rhp(140)}
        /> */}
        <ImageBackground
          imageStyle={styles.editImageContainer}
          resizeMode="cover"
          source={img.editImage}
          style={styles.editImageStyle}>
          <Image source={icn.playPauseIcn} style={styles.playPauseIcnStyle} />
        </ImageBackground>
      </View>
    </View>
  );
};

export default React.memo(VideoMessage);
