import {Component, OnInit} from '@angular/core';
import {UserProvider} from '../service/auth/user.subject';
import {BehaviorSubject} from 'rxjs';
import {User} from '../model/user';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {GpLanguageService} from '../service/GpLanguageService';
import {GpAccountInteractor} from '../service/GpAccountInteractor';
import {Language} from '../model/language';
import {finalize} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {DialogService} from '../service/ui/DialogService';
import {Router} from '@angular/router';

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
    private router: Router,
    private userProvider: UserProvider,
    private languageService: GpLanguageService,
    private accountInteractor: GpAccountInteractor,
    private fBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogsService: DialogService
  ) {
  }

  ngOnInit() {
    console.log('ngOnInit');

    this.getData();
  }

  getData() {
    this.dataIsLoading.next(true);
    this.accountInteractor
      .getUserAndLanguages()
      .pipe(
        finalize(() => this.dataIsLoading.next(false))
      )
      .subscribe(
        (userAndLanguages: [User, Language[]]) => {
          this.userFromApi = userAndLanguages[0];
          this.name = this.userFromApi.fullName;
          this.languagesListFromApi2 = userAndLanguages[1];

          this.userLanguage = this.languagesListFromApi2.find(value => value.id === this.userFromApi.primaryLanguageId);

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
    // todo
  }

  onAvatarEditClicked() {
    console.log('onAvatarEditClicked');
    this.showMessage('Not implemented yet, sorry)');
    // todo
  }

  onDataRefreshClicked() {
    console.log('onDataRefreshClicked');
    this.getData();
  }

  onChangePasswordClicked() {
    console.log('onChangePasswordClicked');
    this.showMessage('Not implemented yet, sorry)');
    // todo
  }

  onDeleteAccountClicked() {
    console.log('onDeleteAccountClicked');

    this.showConfirmAccountDeleteDialog(this.userFromApi.id);
  }

  showConfirmAccountDeleteDialog(id: number) {
    this.dialogsService
    // todo translation
      .confirm('Delete account', 'Are you sure you want to delete account? This can\'t be undone!', 'Delete account')
      .subscribe((res: boolean) => {
        if (res) {
          this.deleteAccount(id);
        } else {
          console.log('do not delete!');
        }
      });
  }

  showMessage(message: string) {
    this.snackBar.open(message);
  }

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }

  private deleteAccount(id: number) {
    console.log('deleteAccount: %d', id);
    // todo
    this.accountInteractor
      .deleteAccount(id)
      .subscribe(
        value => {
        },
        error => {
          console.error(error);
        }
      );
    // .subscribe(value => this.router.navigateByUrl('/'))
  }
}