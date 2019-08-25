import {Injectable} from '@angular/core';
import {GpUser} from '../../model/auth/GpUser';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class UserProvider {
  public user: BehaviorSubject<GpUser | null> = new BehaviorSubject(null);
}
