import {Injectable} from '@angular/core';
import {User} from '../../model/user';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class UserProvider {
  public user: BehaviorSubject<User | null> = new BehaviorSubject(null);
}
