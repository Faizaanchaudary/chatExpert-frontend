import {BookSpec, IMessage} from './IMessage';

export interface PageElement {
  id: string;
  topText?: string;
  type?: 'toptext' | 'bottomtext' | 'middleimage' | 'message';
  chatBackground: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  bookSpecs: BookSpec;
  item?: IMessage;
  senderTextColor?: string;
  receiverTextColor?: string;
  senderBackground?: string;
  receiverBackground?: string;
}

export type Page = PageElement[];

// export interface MessageElement extends PageElementBase {
//   type?: 'message';
//   item: IMessage;
//   hideName: boolean;
//   senderBackground: string;
//   senderTextColor: string;
//   receiverBackground: string;
//   receiverTextColor: string;
//   dateFormat: string;
//   bookspecs?: BookSpec; // sometimes lowercase
//   heightEstimate: number;
// }

// export interface TextOrImageElement extends PageElementBase {
//   type: 'toptext' | 'bottomtext' | 'middleimage';
// }

// export type Page = MessageElement | TextOrImageElement;

// const item: Page[] = [
//   {
//     bookSpecs: {
//       dimensions: '13 x 20 cm',
//       price: '28.90',
//       title: 'Standard Book',
//     },
//     chatBackground: 'white',
//     fontFamily: 'Roboto-Medium',
//     fontSize: 12,
//     fontStyle: 'regular',
//     id: 'initial_toptext_1756130375071_0.9373352921854975',
//     topText: '',
//     type: 'toptext',
//   },
// ];
