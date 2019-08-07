import {Injectable} from '@angular/core';
import {User} from '../../model/user';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class UserProvider {

  public user: BehaviorSubject<User> = new BehaviorSubject(undefined);

  constructor() {
  }
}
