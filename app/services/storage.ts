import {utils} from '@react-native-firebase/app';
import storage, {ref} from '@react-native-firebase/storage';
import {v4 as uuidv4} from 'uuid';

export const getImageRef = (path: string) => {
  const reference = storage().ref(
    `${utils.FilePath.PICTURES_DIRECTORY}/whatsapp/test.png`,
  );
  return reference;
};

export const createWhatsappMediaPath = (fileName: string) => {
  return `whatsapp/${uuidv4()}-${fileName}`;
};

export async function uploadToFirebase(
  storagePath: string,
  localPath: string,
): Promise<string> {
  //   const filename = path.split('/').pop();
  const ref = storage().ref(storagePath);
  await ref.putFile(localPath); // note: `putFile` for RN local paths
  const url = await ref.getDownloadURL();
  console.log('URL', url);

  return url;
}
