import storage, {getDownloadURL} from '@react-native-firebase/storage';
import React, {useEffect, useRef, useState} from 'react';
import QRCodeCMP, {QRCodeProps} from 'react-native-qrcode-svg';
import {rhp} from '../../utils/reponsiveness';
import {uploadToFirebase} from '../../services/storage';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../utils/colors';

interface Props extends QRCodeProps {
  localPath?: string;
  remotePath?: string;
  size?: number;
}

const MediaQR: React.FC<Props> = ({localPath, remotePath, size, ...rest}) => {
  const ref = useRef<QRCodeCMP>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const generateQRUrl = async () => {
      try {
        setIsLoading(true);
        if (remotePath) {
          let downloadUrl = await getFileUrl(remotePath);

          if (!downloadUrl && localPath) {
            downloadUrl = await uploadToFirebase(remotePath, localPath);
          }

          if (downloadUrl) setUrl(downloadUrl);
          else throw new Error();
        }
      } catch (error) {
        setError('No Url Found');
      } finally {
        setIsLoading(false);
      }
    };
    generateQRUrl();
  }, [localPath, remotePath]);

  async function getFileUrl(remotePath: string): Promise<string | null> {
    try {
      const downloadUrl = await storage().ref(remotePath).getDownloadURL();
      return downloadUrl;
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        return null; // File does not exist
      }
      throw error; // Some other error (permissions, network, etc.)
    }
  }

  if (isLoading) {
    return (
      <View
        style={[styles.loadingView, size ? {width: size, height: size} : {}]}>
        <ActivityIndicator size={'large'} color={COLORS.darkBlack} />
      </View>
    );
  }

  if (error)
    return (
      <View
        style={[styles.loadingView, size ? {width: size, height: size} : {}]}>
        <Text>{error}</Text>
      </View>
    );

  return <QRCodeCMP value={url} 
  // getRef={(c)=>ref=c} 
  {...rest} />;
};

export default MediaQR;

const styles = StyleSheet.create({
  loadingView: {
    width: rhp(170),
    height: rhp(170),
    borderWidth: 1,
    borderColor: COLORS.darkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
