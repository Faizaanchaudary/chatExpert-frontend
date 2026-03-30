export interface IUser {
  _id: string;
  access_token: string;
  profilePictureUrl?: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
}
