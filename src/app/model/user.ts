import {Authority} from './authority';

export class User {
  id: number;
  email: string | null;
  fullName: string;
  avatar: string;
  primaryLanguageId: number;
  authorities: [Authority];
}
