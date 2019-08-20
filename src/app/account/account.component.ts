import {Component, OnInit} from '@angular/core';
import {UserProvider} from '../service/auth/user.subject';
import {BehaviorSubject} from 'rxjs';
import {User} from '../model/user';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {GpLanguageService} from '../service/GpLanguageService';
import {GpAccountInteractor} from '../service/GpAccountInteractor';
import {Language} from '../model/language';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  dataIsLoading = new BehaviorSubject<boolean>(false);
  userFromApi: User;

  name: string;
  userLanguage: Language;

  accountEditFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  languagesListFromApi2: Language[];

  constructor(
    private userProvider: UserProvider,
    private languageService: GpLanguageService,
    private accountInteractor: GpAccountInteractor,
    private fBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    console.log('ngOnInit');
    // todo use combine latest with user from api
    this.dataIsLoading.next(true);
    this.accountInteractor.getUserAndLanguages()
    // todo test error/refresh
      .subscribe(
        (userAndLanguages: [User, Language[]]) => {
          this.userFromApi = userAndLanguages[0];
          this.name = this.userFromApi.fullName;
          this.languagesListFromApi2 = userAndLanguages[1];

          this.userLanguage = this.languagesListFromApi2.find(value => value.id === this.userFromApi.primaryLanguageId);
          // this.primaryLanguage = userLanguage.langCode.toUpperCase();

          this.dataIsLoading.next(false);

          this.initForm(this.userFromApi, this.userLanguage);
        }
      );
  }

  private initForm(user: User, userLanguage: Language) {
    this.accountEditFormGroup = this.fBuilder.group({
      name: new FormControl(
        {value: user.fullName, disabled: false},
        [Validators.required]
      ),
      email: new FormControl(
        {value: user.email, disabled: true},
        []
      ),
      primaryLanguageSelect: new FormControl(
        {value: userLanguage, disabled: false},
        [Validators.required]
      )
    });

    const initialValues = {name: user.fullName, primaryLanguageSelect: userLanguage};
    this.accountEditFormGroup.valueChanges.subscribe((changes) => {
      for (const prop in changes) {
        if (changes.hasOwnProperty(prop)) {
          if (changes[prop] === initialValues[prop]) {
            this.accountEditFormGroup.get(prop).markAsPristine();
          }
        }
      }
    });
  }

  onNameChanged(name: string) {
    console.log('onNameChanged: %s', name);
    this.name = name;
  }

  onPrimaryLanguageChanged(language: Language) {
    console.log('onPrimaryLanguageChanged: %s', JSON.stringify(language));
    this.userLanguage = language;
  }

  onAccountEditClicked() {
    console.log('onAccountEditClicked: %s, %s', this.name, this.userLanguage.langCode);
  }

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }
}
