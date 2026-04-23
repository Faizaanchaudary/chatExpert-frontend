import {IBookSpec, IMessage} from '../interfaces/IMessage';
import {WhatsAppMessage} from '../interfaces/whatsappMessage';
import RNFS, {ReadDirItem} from 'react-native-fs';
import pMap from 'p-map';
import {uploadContent} from '../services/calls';
import {enableSnackbar} from '../store/Slice/snackbarSlice';
import {store} from '../store/Store';
import moment from 'moment';
import {MEDIA_EXTENSIONS} from '../constants/mediaExtensions';

const {dispatch} = store;

const regexPatterns = [
  /\[(\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (?:AM|PM))\] ([^:]+): (.*)/, // [dd/MM/yyyy, hh:mm:ss AM/PM] Name: message
  /(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}(?:\u202F)?(?:AM|PM|am|pm)) - ([^:]+): (.*)/, // d/M/yy, h:mm AM/PM - Name: message
  /(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}\s?(?:AM|PM|am|pm)) - ([^:]+) (.*)/, // d/M/yy, h:mm AM/PM - Name (no colon): message
  /(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}(?:\u202F)?(?:AM|PM|am|pm)) - (.*)/, // d/M/yy, h:mm AM/PM - system message
  /(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}) - ([^:]+): (.*)/, // dd/MM/yyyy, hh:mm - Name: message (24-hour format)
  /\[(\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}(?::\d{2})?\s?[APap][Mm])\]\s?([^:]+):\s?([\s\S]*)/, // [dd/MM/yyyy, hh:mm:ss AM/PM] multiline
  /(\d{1,2}\/\d{1,2}\/\d{4}, \d{2}:\d{2}) - ([^:]+): (.*)/,
  /(\d{2}\/\d{2}\/\d{2,4}, \d{1,2}:\d{2}\s?(?:AM|PM)) - ([^:]+): (.*)/, // Matches your format
  /(\d{1,2}\/\d{1,2}\/\d{4}, \d{2}:\d{2}) - ([^:]+): (.*)/, // dd/MM/yyyy, hh:mm - Name: message
  /(\d{2}\/\d{2}\/\d{2,4}, \d{1,2}:\d{2}\s?(?:AM|PM)) - ([^:]+): (.*)/, // Matches your provided format
  /(\d{2}\/\d{2}\/\d{2,4}, \d{1,2}:\d{2}(?:\u202F)?(?:AM|PM)) - ([^:]+): (.*)/, // Handles non-breaking space and MM/DD/YY format
  /(\d{2}\/\d{2}\/\d{2,4}, \d{1,2}:\d{2}(?:\u202F|\s)?(?:AM|PM)) - ([^:]+): (.*)/, // Handles user messages
  /(\d{2}\/\d{2}\/\d{2,4}, \d{1,2}:\d{2}(?:\u202F|\s)?(?:AM|PM)) - (.*)/, // Handles system messages without sender
];

// Chat File Example
//   17/07/2025, 12:32 pm - Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. Learn more.
// 17/07/2025, 12:32 pm - Mohsin Rawana created group "Glitter of Hope"
// 17/07/2025, 12:32 pm - Mohsin Rawana added you
// 17/07/2025, 12:32 pm - Mohsin Rawana added Qasim Fast
// 17/07/2025, 12:33 pm - Mohsin Rawana added Anas Ali Dev
// 17/07/2025, 12:37 pm - Mohsin Rawana: https://play.google.com/apps/testing/com.glitterofhope
// 17/07/2025, 12:36 pm - Mohsin Rawana added Ahtasham Fast
// 17/07/2025, 12:40 pm - Mohsin Rawana: Everyone please update Glitter of hope
// 17/07/2025, 12:42 pm - Mohsin Rawana: This message was deleted
// 17/07/2025, 12:46 pm - Mohsin Rawana: POLL:
// Test gritter of hope mark it with tick after testing
// OPTION: Yes (8 votes)
// OPTION: No (0 votes)

export const parseChat = (content: string) => {
  const lines = content.split('\n');
  const messages = [];
  let currentMessage = null;

  for (const line of lines) {
    let matched = false;

    for (const regex of regexPatterns) {
      const match = regex.exec(line);

      if (match) {
        matched = true;

        // If there's a current message, push it to the array before processing the new one
        if (currentMessage) {
          messages.push(currentMessage);
        }

        const [_, date, sender, message] = match;
        currentMessage = {
          date: date || 'Unknown',
          sender: sender || 'System',
          message: message || '',
        };

        break; // Stop checking other regex patterns
      }
    }

    // Append to the current message if the line doesn't match a timestamp pattern
    if (!matched && currentMessage) {
      currentMessage.message += '\n' + line;
    }
  }

  // Push the last message if any
  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages as WhatsAppMessage[];
};

export const getFilesInformation = async (
  extractedFolderPath: string,
): Promise<{mediaFiles: ReadDirItem[]; textFile: ReadDirItem}> => {
  // List all files in the extracted directory
  const files = await RNFS.readDir(extractedFolderPath);

  const mediaFiles = files.filter(file =>
    MEDIA_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext)),
  );

  // Find a file that ends with .txt
  const chatFile = files.find(file => file.name.endsWith('.txt'));
  if (!chatFile) {
    console.error('.txt file not found');
    throw 'No File found';
  }

  return {
    mediaFiles: mediaFiles,
    textFile: chatFile,
  };
};

export const getFileContent = async (
  chatFile: ReadDirItem,
): Promise<string> => {
  // Read the content of the .txt file
  const chatContent = await RNFS.readFile(chatFile.path, 'utf8');
  return chatContent;
};

export const processChatFile = async (
  extractedFolderPath: string,
  bookspecs: IBookSpec,
) => {
  try {
    // setIsLoading(true);

    // List all files in the extracted directory
    const files = await RNFS.readDir(extractedFolderPath);

    // Find a file that ends with .txt
    const chatFile = files.find(file => file.name.endsWith('.txt'));
    if (!chatFile) {
      console.error('.txt file not found');
      return [];
    }

    // Read the content of the .txt file
    const chatContent = await RNFS.readFile(chatFile.path, 'utf8');
    const parsedMessages = parseChat(chatContent);

    // console.log('Parsed Messages', parsedMessages);

    const chatData: IMessage[] = [];
    const sender = await getSender(parsedMessages);

    // console.log('Sender==>', sender);

    for (const [index, item] of parsedMessages.entries()) {
      const fullMessage = item?.message;

      if (
        fullMessage === '<Médias omis>' ||
        fullMessage === '<Media omitted>'
      ) {
        continue;
      }

      if (
        item?.message == '<Médias omis>' ||
        item?.message == '<Media omitted>'
      ) {
        return;
      }
      if (fullMessage === 'Messages and calls are end-to-end encrypted') {
        continue;
      }
      if (fullMessage?.toUpperCase().includes('is a contact'.toUpperCase())) {
        console.log('Contains omitted media');
        continue;
      }

      // Check if the message contains file attachment
      if (
        (fullMessage.includes('<') &&
          fullMessage.includes('>') &&
          fullMessage.includes('ttach')) ||
        fullMessage.includes('(file attached)') ||
        (fullMessage.includes('IMG-') && fullMessage.includes('.jpg')) ||
        (fullMessage.includes('IMG-') && fullMessage.includes('.png'))
      ) {
        // Try to extract the filename using different patterns
        let attachmentFileName = null;

        // Try pattern: <attached: filename>
        const attachedMatch = fullMessage.match(/<attached: (.*)>/);
        if (attachedMatch && attachedMatch[1]) {
          attachmentFileName = attachedMatch[1];
        }

        // Try pattern: filename (file attached)
        if (!attachmentFileName) {
          const fileAttachedMatch = fullMessage.match(
            /(.*?) \(file attached\)/,
          );
          if (fileAttachedMatch && fileAttachedMatch[1]) {
            attachmentFileName = fileAttachedMatch[1];
          }
        }

        // Try to match IMG-***.jpg or IMG-***.png pattern
        if (!attachmentFileName) {
          const imgMatch = fullMessage.match(/(IMG-[^\s]+\.(jpg|png|jpeg))/i);
          if (imgMatch && imgMatch[1]) {
            attachmentFileName = imgMatch[1];
          }
        }

        // Try extracting any filename with extension
        if (!attachmentFileName) {
          const anyFileMatch = fullMessage.match(
            /([^\s]+\.(jpg|jpeg|png|pdf|doc|docx|opus))/i,
          );
          if (anyFileMatch && anyFileMatch[1]) {
            attachmentFileName = anyFileMatch[1];
          }
        }

        console.log('Trying to find attachment with name:', attachmentFileName);

        // If we found a filename, look for it in the extracted files
        if (attachmentFileName) {
          // First try exact match
          let attachmentFile = files.find(
            file => file.name === attachmentFileName,
          );

          // If no exact match, try case-insensitive match
          if (!attachmentFile) {
            attachmentFile = files.find(
              file =>
                file.name.toLowerCase() === attachmentFileName.toLowerCase(),
            );
          }

          // If still no match, try to find a file that contains the filename (without path)
          if (!attachmentFile) {
            attachmentFile = files.find(file =>
              file.name
                .toLowerCase()
                .includes(
                  attachmentFileName.toLowerCase().replace(/^.*[\\\/]/, ''),
                ),
            );
          }

          if (attachmentFile) {
            let attachmentPath = attachmentFile.path;
            console.log('Found Attachment File', attachmentFile);

            // API call to upload the file
            const res = await upload(
              'file://' + attachmentPath,
              attachmentFile?.name,
            );
            if (res) {
              attachmentPath = res;
            }

            const isPicture =
              attachmentFile.name.toLowerCase().endsWith('.jpg') ||
              attachmentFile.name.toLowerCase().endsWith('.jpeg') ||
              attachmentFile.name.toLowerCase().endsWith('.png');
            const isAudio = attachmentFile.name.toLowerCase().endsWith('.opus') ||
              attachmentFile.name.toLowerCase().endsWith('.mp3') ||
              attachmentFile.name.toLowerCase().endsWith('.m4a') ||
              attachmentFile.name.toLowerCase().endsWith('.aac') ||
              attachmentFile.name.toLowerCase().startsWith('ptt-') ||
              attachmentFile.name.toLowerCase().startsWith('aud-');

            chatData.push({
              id: index,
              isCheck: true,
              sender: sender === item?.sender,
              text: !attachmentPath, // If there's no attachment, it's a text message
              isVideo: false,
              isPicture,
              isAudio,
              senderName: item?.sender,
              sendingTime: item?.date,
              senderMessage: item?.message,
              path: attachmentPath,
              fontSize: 16,
              bookspecs: bookspecs,
            });

            continue;
          } else {
            console.log('Could not find attachment file:', attachmentFileName);
          }
        }
      }
      const encryptedText = 'end-to-end encrypted';
      const timerText = 'message timer was updated. new messages';
      const isContact = 'is a contact';

      if (fullMessage?.toUpperCase().includes(isContact?.toUpperCase())) {
        continue;
      }

      if (fullMessage?.toUpperCase().includes(encryptedText?.toUpperCase())) {
        continue;
      }
      if (
        item?.sender
          ?.trim()
          ?.toUpperCase()
          .includes(encryptedText?.toUpperCase())
      ) {
        continue;
      }
      if (item?.sender?.trim()?.toUpperCase().includes('is a'?.toUpperCase())) {
        continue;
      }
      if (
        item?.sender
          ?.trim()
          ?.toUpperCase()
          .includes('You created this'.toUpperCase())
      ) {
        continue;
      }

      if (
        item?.sender
          ?.trim()
          ?.toUpperCase()
          .includes('created group'.toUpperCase())
      ) {
        continue;
      }

      if (item?.sender?.trim()?.toUpperCase().includes('added'.toUpperCase())) {
        console.log('Console==>', item?.sender, ' -- ', item?.message);
        continue;
      }

      if (
        item?.sender?.trim()?.toUpperCase().includes(timerText?.toUpperCase())
      ) {
        continue;
      }
      if (fullMessage?.toUpperCase().includes(timerText?.toUpperCase())) {
        continue;
      }
      // Skip messages based on specific conditions
      if (
        ['created group', 'end-to-end encrypted'].some(text =>
          fullMessage?.toUpperCase().includes(text.toUpperCase()),
        )
      ) {
        continue;
      }

      chatData.push({
        id: index,
        isCheck: true,
        sender: sender === item?.sender,
        text: fullMessage,
        isVideo: false,
        isPicture: null,
        isAudio: null,
        senderName: item?.sender,
        sendingTime: item?.date,
        senderMessage: item?.message,
        path: '',
        fontSize: 16,
        bookspecs: bookspecs,
      });
    }

    // Sort the chat data
    const sortedData = chatData.sort((a, b) => {
      const dateA: any = moment(a.sendingTime, 'DD/MM/YYYY h:mm:ss A');
      const dateB: any = moment(b.sendingTime, 'DD/MM/YYYY h:mm:ss A');
      return dateA - dateB;
    });

    return sortedData;
  } catch (error) {
    console.error('Error processing chat file:', error);
    dispatch(enableSnackbar('Something went wrong, please try again'));
    return [];
  } finally {
    // setIsLoading(false);
  }
};

// Find and set sender for each message
export const getSender = async (messages: WhatsAppMessage[]) => {
  let sender: string | null = null;

  // Define the mapper function
  const mapper = async (item: WhatsAppMessage) => {
    if (item?.message.includes('created group')) {
      console.log('Contains created group');
      return;
    }
    const encryptedText = 'end-to-end encrypted';
    const timerText = 'message timer was updated. new messages';
    const selfEncryted = 'end-to-end encrypted';
    const isContact = 'is a';

    if (
      item?.message?.toUpperCase().includes(encryptedText?.toUpperCase()) ||
      item?.sender
        ?.trim()
        ?.toUpperCase()
        .includes(encryptedText?.toUpperCase()) ||
      item?.sender
        ?.trim()
        ?.toUpperCase()
        .includes('You created this'.toUpperCase()) ||
      item?.sender
        ?.trim()
        ?.toUpperCase()
        .includes('created group'.toUpperCase()) ||
      item?.sender?.trim()?.toUpperCase().includes('added'.toUpperCase()) ||
      item?.sender?.trim()?.toUpperCase().includes(timerText?.toUpperCase()) ||
      item?.message?.toUpperCase().includes(timerText?.toUpperCase()) ||
      item?.sender
        ?.trim()
        ?.toUpperCase()
        .includes(selfEncryted?.toUpperCase()) ||
      item?.message?.toUpperCase().includes(selfEncryted?.toUpperCase()) ||
      item?.sender?.trim()?.toUpperCase().includes(isContact?.toUpperCase()) ||
      item?.message?.toUpperCase().includes(isContact?.toUpperCase())
    ) {
      return;
    }

    if (sender == null) {
      sender = item?.sender;
    }
  };

  // Use pMap to process the chat array with a concurrency limit
  await pMap(messages, mapper, {concurrency: 5}); // Adjust concurrency as needed

  return sender;
};

const upload = async (path: any, name?: string) => {
  try {
    //   setIsLoading(true);

    const data = new FormData();
    data.append('files', {
      uri: path,
      name: name ? name : 'photo1.jpg',
      type: '*/*',
    });
    data.append(
      'title',
      name ? name : `${(Math.random() * 232 * Math.random()).toFixed(0)}`,
    );
    data.append(
      'name',
      name ? name : `${(Math.random() * 232 * Math.random()).toFixed(0)}`,
    );
    const res = await uploadContent(data);

    if (res?.status == 200 || res?.status == 201) {
      return res?.data?.url[0];
    } else {
      dispatch(enableSnackbar('Failed to generate QR code'));
    }
  } catch (err) {
    console.log('err', err);
    dispatch(enableSnackbar('Failed to generate QR code'));
  }
};
