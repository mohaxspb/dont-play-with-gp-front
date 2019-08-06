import {Authority} from './authority';

export class User {
  id: number;
  username: string;
  avatar: string;
  authorities: [Authority];
}
