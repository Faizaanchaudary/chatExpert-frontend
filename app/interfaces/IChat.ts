import {IBookConfig} from './IBookConfig';

export interface IChat {
  platform: 'whatsapp';
  totalMessages: number;
  author: string;
  status: 'draft' | 'active' | 'deleted';
  _id: string;
  importedAt: string; // '2025-10-13T08:28:53.735Z'
  mediaFiles: any[];
  createdAt: string;
  updatedAt: string;
  bookConfig?: IBookConfig;
}
