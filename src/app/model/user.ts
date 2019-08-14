import {Authority} from './authority';

export class User {
  id: number;
  username: string;
  fullName: string;
  avatar: string;
  primaryLanguageId: string;
  authorities: [Authority];
}
