import {IMessage} from '../../interfaces/IMessage';

export interface Message {
  id: string;
  text: string;
  fontSize?: number;
  lineHeight?: number;
  marginVertical?: number;
}

export interface Page {
  id: string;
  messages: IMessage[];
  isEmptyView?: boolean;
}

export interface Spread {
  id: string;
  leftPage: Page | null;
  rightPage: Page | null;
  leftPageNumber: number;
  rightPageNumber: number;
  isFirstSpread?: boolean;
  isLastSpread?: boolean;
}
