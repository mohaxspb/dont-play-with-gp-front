import {Authority} from './Authority';

export class GpUser {
  id: number;
  email: string | null;
  fullName: string;
  avatar: string;
  primaryLanguageId: number;
  authorities: [Authority];
}
