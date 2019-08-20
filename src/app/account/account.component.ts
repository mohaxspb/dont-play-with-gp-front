import {Component, OnInit} from '@angular/core';
import {UserProvider} from '../service/auth/user.subject';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '../model/user';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  userIsLoading = new BehaviorSubject<boolean>(false);
  userObservable: Observable<User>;
  userFromApi: User | null;

  name: string;

  // @ViewChild('accountEditForm', {static: false})
  // accountEditForm: NgForm;

  accountEditFormGroup: FormGroup;

  constructor(
    private userProvider: UserProvider,
    private fBuilder: FormBuilder
  ) {
    this.getUser();
  }

  ngOnInit() {
    console.log('ngOnInit');
    // this.initForm();
  }

  private initForm(user: User) {
    this.accountEditFormGroup = this.fBuilder.group({
      name: new FormControl(
        {value: user.fullName, disabled: true},
        [Validators.required]
      ),
      email: new FormControl(
        {value: undefined, disabled: false},
        [Validators.required, Validators.email]
      ),
      primaryLanguageSelect: new FormControl(
        {value: undefined, disabled: true},
        [Validators.required]
      )
    });
  }

  onNameChanged(name: string) {
    this.name = name;
  }

  onAccountEditClicked() {
    console.log('onAccountEditClicked');
  }

  getUser() {
    this.userIsLoading.next(true);
    this.userObservable = this.userProvider
      .user
      .pipe(
        tap((user: User | null) => {
          console.log('userObservable tap: ' + user);
          this.userFromApi = user;
          this.userIsLoading.next(false);
          if (user != null) {
            this.initForm(user);
          }
        }),
      );
    this.userObservable.subscribe();
  }

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }
}
