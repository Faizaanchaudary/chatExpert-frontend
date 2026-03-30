import {unzip} from 'react-native-zip-archive';
import RNFS from 'react-native-fs';
import {IMessage} from '../interfaces/IMessage';
import {Platform} from 'react-native';

export async function copyContentUriToFile(
  contentUri: string,
): Promise<string> {
  const destPath = `${RNFS.TemporaryDirectoryPath}whatsapp.zip`;

  if (Platform.OS === 'android' && contentUri.startsWith('content://')) {
    const res = await RNFS.copyFile(contentUri, destPath);
    return destPath;
  }
  console.log('ContentURI>>', contentUri);

  return contentUri; // already a file path
}

export const unzipWhatsAppZip = async (zipPath: string): Promise<string> => {
  const destPath = `${RNFS.DocumentDirectoryPath}/whatsapp-chat`;
  await unzip(zipPath, destPath);

  return destPath;
};

export const readChatText = async (unzippedPath: string): Promise<string> => {
  const chatTxtPath = `${unzippedPath}.txt`;
  return await RNFS.readFile(chatTxtPath, 'utf8');
};

export const parseMessages = (chatText: string): IMessage[] => {
  const lines = chatText.split('\n');
  const messages: IMessage[] = [];

  const regex =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2} ?[ap]m) - (.*?): (.*)$/;

  let currentMessage: IMessage | null = null;

  for (let line of lines) {
    const match = line.match(regex);
    if (match) {
      if (currentMessage) messages.push(currentMessage);

      const [, date, time, sender, message] = match;
      currentMessage = {
        id: Math.random().toString(),
        sendingTime: time,
        date: date,
        senderName: sender,
        text: message,
        isAudio: false,
        isVideo: false,
        isCheck: false,
        isPicture: false,
        path: '',
        sender: false,
        senderMessage: message,
      };
    } else if (currentMessage) {
      // Multiline message
      currentMessage.text += '\n' + line;
    }
  }

  if (currentMessage) messages.push(currentMessage);
  return messages;
};
