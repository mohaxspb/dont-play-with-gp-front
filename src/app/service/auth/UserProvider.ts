import {Injectable} from '@angular/core';
import {GpUser} from '../../model/auth/GpUser';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

@Injectable()
export class UserProvider {
  private userSubject: BehaviorSubject<GpUser | null> = new BehaviorSubject(null);

  call(user: GpUser | null) {
    this.userSubject.next(user);
  }

  getUser(): Observable<GpUser | null> {
    return this.userSubject.asObservable();
  }

  getNonNullUser(): Observable<GpUser> {
    return this.userSubject
      .asObservable()
      .pipe(
        filter(user => user != null)
      );
  }
}
