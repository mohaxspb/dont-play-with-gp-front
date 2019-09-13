import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GpUser} from '../model/auth/GpUser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {GpAccountInteractor} from '../service/auth/GpAccountInteractor';
import {Language} from '../model/data/Language';
import {delay, finalize} from 'rxjs/operators';
import {DialogService} from '../service/ui/DialogService';
import {Router} from '@angular/router';
import {NotificationService} from '../service/ui/NotificationService';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {Article} from '../model/data/Article';
import {GpArticleService} from '../service/data/GpArticleService';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  dataIsLoading = new BehaviorSubject<boolean>(false);
  progressInAction = new BehaviorSubject<boolean>(false);
  articlesAreLoading = new BehaviorSubject<boolean>(false);

  userFromApi: GpUser;

  name: string;
  userLanguage: Language;

  accountEditFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  languagesListFromApi: Language[];

  initialFormValues: { name: string, primaryLanguageSelect: Language };

  // content
  articlesCreated: Article[] = [];

  constructor(
    private router: Router,
    private accountInteractor: GpAccountInteractor,
    private articleService: GpArticleService,
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

          this.userLanguage = GpLanguageService.getLanguageById(this.languagesListFromApi, this.userFromApi.primaryLanguageId);

          this.initForm(this.userFromApi, this.userLanguage);
          this.loadCreatedArticles();
        }
      );
  }

  private loadCreatedArticles() {
    this.articlesAreLoading.next(true);

    this.articleService
      .getArticlesByAuthor(this.userFromApi.id)
      .pipe(
        //fixme test
        delay(1000),
        finalize(() => this.articlesAreLoading.next(false))
      )
      .subscribe(
        articles => {
          // todo
          this.articlesCreated = articles;
        },
        error => this.notificationService.showError(error)
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

    this.setInitialFormValues(user.fullName, userLanguage);
    this.accountEditFormGroup.valueChanges.subscribe((changes) => {
      for (const prop in changes) {
        if (changes.hasOwnProperty(prop)) {
          if (changes[prop] === this.initialFormValues[prop]) {
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
      .editAccount(this.userFromApi.id, this.name, this.userLanguage.langCode)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        user => {
          this.userFromApi = user;
          this.setInitialFormValues(
            this.userFromApi.fullName,
            GpLanguageService.getLanguageById(this.languagesListFromApi, this.userFromApi.primaryLanguageId)
          );
          this.accountEditFormGroup.reset(this.accountEditFormGroup.value);
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

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }

  private setInitialFormValues(name: string, language: Language) {
    this.initialFormValues = {name, primaryLanguageSelect: language};
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
