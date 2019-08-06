import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthProvider {

  public authenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
  }
}
