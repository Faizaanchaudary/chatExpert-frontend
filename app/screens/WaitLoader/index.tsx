import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './style';
import * as Progress from 'react-native-progress';
import {hp, rhp, rwp, wp} from '../../utils/reponsiveness';
import {img} from '../../assets/img';
import {icn} from '../../assets/icons';
import {COLORS} from '../../utils/colors';
interface WaitLoaderProps {
  navigation?: any;
}

const WaitLoader: React.FC<WaitLoaderProps> = ({navigation}) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let interval;
    if (progress < 1) {
      interval = setInterval(() => {
        setProgress(prev => (prev + 0.03 > 1 ? 1 : prev + 0.03));
      }, 30);
    }
    if (progress == 1) {
      navigation.navigate('ProfileTab', {
        screen: 'MyOrder',
        params: {isLoader: true},
      });
    }
    return () => clearInterval(interval);
  }, [progress]);

  const formatText = progress => {
    return (
      <View style={{alignItems: 'center'}}>
        <Image source={icn.cloudUpload} style={styles.cloudImageStyle} />
        <Text style={styles.circleTextStyle}>{`${Math.round(
          progress * 100,
        )}%`}</Text>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <Progress.Circle
        size={hp(27)}
        progress={progress}
        borderWidth={0}
        color={COLORS.skyBlue}
        unfilledColor={COLORS.white3}
        thickness={wp(2.5)}
        indeterminate={false}
        formatText={() => formatText(progress)}
        showsText={true}
      />

      <Text style={styles.savingTextStyle}>Saving on Cloud</Text>
      <Text style={styles.moreThanTextStyle}>
        It will not take more than
        <Text style={styles.oneMinTextStyle}> 1 min</Text>{' '}
      </Text>
    </View>
  );
};

export default WaitLoader;
