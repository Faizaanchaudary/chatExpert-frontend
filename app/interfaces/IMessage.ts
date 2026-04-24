// export interface IMessage {
//   id: string;
//   isCheck: boolean;
//   sender: boolean;
//   text: string;
//   senderName: string;
//   sendingTime: string;
//   date?: string;
//   senderMessage: string;
//   localPath?: string;
//   remotePath?: string;
//   messageType: 'video' | 'image' | 'audio' | 'text';
//   fontSize?: number;
//   receiverName?: string;
// }

import {IBookConfig} from './IBookConfig';

export type MessageType = 'video' | 'image' | 'audio' | 'text' | 'unknown';

export interface IMessage {
  chatId?: string;
  text: string;
  senderName: string;
  sendingTime: string;
  date: string;
  messageType: MessageType;
  url?: string;
  localPath?: string; // Local file path for media before upload
  qrUrl?: string; // S3 URL of QR code image (video/audio messages only)
  thumbnailUrl?: string; // S3 URL of video thumbnail (video messages only)
  _id: string;
  createdAt?: string;
  updatedAt?: string;

  // Additional fields
  isCheck?: boolean;
  heightEstimate?: number; // Add this property for page calculations
  /** true = sent by "me" (right side), false = received (left side) */
  sender?: boolean;

  /** Pagination-only: hide time row on intermediate fragments of a split long text message */
  __suppressTimeRow?: boolean;
  /** Stable key for split fragments in preview lists */
  __splitFragKey?: string;
}

export interface AiParsedMessage {
  date: string;
  message: string;
  sender: string;
  time: string;
  media?: boolean;
  messageType: MessageType;
}

export interface IBookSpec {
  price: string;
  title: string;
  dimensions: string;
}

export interface IMessageBubble {
  item: IMessage;
  // fontFamily: string;
  // fontSize: number;
  // fontStyle: 'regular' | 'bold' | 'regular' | 'italic' | 'underline';
  // hideName: boolean;
  // senderBackground: string;
  // senderTextColor: string;
  // receiverBackground: string;
  // receiverTextColor: string;
  // dateFormat: string;
  // bookConfig: IBookConfig;
  id: string;
  // bookspecs: IBookSpec;
  type?: string;
  middleimage?: string;

  topText?: string;
  bottomtext?: string;
  // text?: string;
  // chatBackground?: string; // Add this property for styling
  heightEstimate?: number; // Add this property for pagination calculations
}

// interface ChatMessage {
//   id: string;
//   type?: string;
//   height?: number;
//   heightEstimate?: number; // Add this property for pagination calculations
//   lineCount?: number;
//   totalLines?: number;
//   isEmpty?: boolean;
//   item?: {
//     sender?: boolean;
//     senderName?: string;
//     receiverName?: string;
//     text?: string;
//     path?: string;
//     sendingTime?: string;
//   };
//   senderTextColor?: string;
//   receiverTextColor?: string;
//   senderBackground?: string;
//   receiverBackground?: string;
//   fontSize?: number;
//   fontStyle?: string;
//   fontFamily?: string;
//   middleimage?: string;
//   topText?: string;
//   bottomtext?: string;
//   text?: string;
//   chatBackground?: string; // Add this property for styling
// }
