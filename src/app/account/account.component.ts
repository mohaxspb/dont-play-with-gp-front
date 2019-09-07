import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {GpUser} from '../model/auth/GpUser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {GpAccountInteractor} from '../service/auth/GpAccountInteractor';
import {Language} from '../model/data/Language';
import {catchError, delay, finalize} from 'rxjs/operators';
import {DialogService} from '../service/ui/DialogService';
import {Router} from '@angular/router';
import {NotificationService} from '../service/ui/NotificationService';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  dataIsLoading = new BehaviorSubject<boolean>(false);
  progressInAction = new BehaviorSubject<boolean>(false);

  userFromApi: GpUser;

  name: string;
  userLanguage: Language;

  accountEditFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  languagesListFromApi: Language[];

  constructor(
    private router: Router,
    private accountInteractor: GpAccountInteractor,
    private fBuilder: FormBuilder,
    private notificationService: NotificationService,
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
        (userAndLanguages: [GpUser, Language[]]) => {
          this.userFromApi = userAndLanguages[0];
          this.name = this.userFromApi.fullName;
          this.languagesListFromApi = userAndLanguages[1];

          this.userLanguage = this.languagesListFromApi.find(value => value.id === this.userFromApi.primaryLanguageId);

          this.initForm(this.userFromApi, this.userLanguage);
        }
      );
  }

  private initForm(user: GpUser, userLanguage: Language) {
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
    this.progressInAction.next(true);
    this.accountInteractor
      .editAccount(this.name, this.userLanguage.langCode)
      .pipe(
        // fixme test
        catchError(err => of(null)),
        delay(3000),
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        // todo clear form and check its validation
        user => {
          this.userFromApi = user;
          this.accountEditFormGroup.markAsPristine();
          this.notificationService.showMessage('Successfully updated!');
        },
        error => this.notificationService.showError(error)
      );
  }

  onAvatarEditClicked() {
    console.log('onAvatarEditClicked');
    this.notificationService.showMessage('Not implemented yet, sorry)');
    // todo
  }

  onDataRefreshClicked() {
    console.log('onDataRefreshClicked');
    this.getData();
  }

  onChangePasswordClicked() {
    console.log('onChangePasswordClicked');
    this.notificationService.showMessage('Not implemented yet, sorry)');
    // todo
  }

  onDeleteAccountClicked() {
    console.log('onDeleteAccountClicked');

    this.showConfirmAccountDeleteDialog(this.userFromApi.id);
  }

  private showConfirmAccountDeleteDialog(id: number) {
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

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }

  private deleteAccount(id: number) {
    console.log('deleteAccount: %d', id);
    this.accountInteractor
      .deleteAccount(id)
      .subscribe(
        () => {
        },
        error => this.notificationService.showError(error)
      );
  }
}
