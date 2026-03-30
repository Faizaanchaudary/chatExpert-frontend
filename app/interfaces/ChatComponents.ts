// interfaces/ChatComponents.ts
import {IMessage} from './IMessage';

export interface ChatStyleConfig {
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  senderBackground: string;
  receiverBackground: string;
  senderTextColor: string;
  receiverTextColor: string;
  chatBackground: string;
  dateFormat: string;
  hideName: boolean;
}

export interface ChatComponentProps {
  item: IMessage;
  stylesConfig: ChatStyleConfig;
  checkPress?: () => void;
  checked?: boolean;
}
