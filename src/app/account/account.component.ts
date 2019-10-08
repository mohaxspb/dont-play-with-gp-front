import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GpUser} from '../model/auth/GpUser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {GpAccountInteractor} from '../service/auth/GpAccountInteractor';
import {Language} from '../model/data/Language';
import {finalize} from 'rxjs/operators';
import {DialogService} from '../service/ui/DialogService';
import {Router} from '@angular/router';
import {NotificationService} from '../service/ui/NotificationService';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {Article} from '../model/data/Article';
import {GpArticleService} from '../service/data/GpArticleService';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {CommentService} from '../service/data/CommentService';
import {GpComment} from '../model/data/GpComment';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  dataIsLoading = new BehaviorSubject<boolean>(false);
  progressInAction = new BehaviorSubject<boolean>(false);
  articlesAreLoading = new BehaviorSubject<boolean>(false);
  commentsAreLoading = new BehaviorSubject<boolean>(false);

  userFromApi: GpUser;

  name: string;
  userLanguage: Language;

  accountEditFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  languagesListFromApi: Language[];

  initialFormValues: { name: string, primaryLanguageSelect: Language };

  // content
  articlesCreated: Article[] = [];
  commentsCreated: GpComment[] = [];

  namePlaceholder: string = this.i18n({value: 'Name', id: 'namePlaceholder'});

  constructor(
    private router: Router,
    private accountInteractor: GpAccountInteractor,
    private articleService: GpArticleService,
    private commentService: CommentService,
    private fBuilder: FormBuilder,
    private notificationService: NotificationService,
    private dialogsService: DialogService,
    private i18n: I18n
  ) {
  }

  ngOnInit() {
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
          this.loadCreatedComments();
        }
      );
  }

  private loadCreatedArticles() {
    this.articlesAreLoading.next(true);

    this.articleService
      .getArticlesByAuthor(this.userFromApi.id)
      .pipe(
        finalize(() => this.articlesAreLoading.next(false))
      )
      .subscribe(
        articles => this.articlesCreated = articles,
        error => this.notificationService.showError(error)
      );
  }

  private loadCreatedComments() {
    this.commentsAreLoading.next(true);

    this.commentService
      .getCommentsByUser(this.userFromApi.id)
      .pipe(
        finalize(() => this.commentsAreLoading.next(false))
      )
      .subscribe(
        comments => this.commentsCreated = comments,
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
    this.name = name;
  }

  onPrimaryLanguageChanged(language: Language) {
    this.userLanguage = language;
  }

  onDataRefreshClicked() {
    this.getData();
  }

  onAccountEditClicked() {
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
          const message = this.i18n({
            value: 'Successfully updated!',
            id: 'successfullyUpdated',
            meaning: 'successfully updated',
            description: 'successfully updated'
          });
          this.notificationService.showMessage(message);
        },
        error => this.notificationService.showError(error)
      );
  }

  onAvatarEditClicked() {
    const message = this.i18n({
      value: 'Not implemented yet, sorry)',
      id: 'notImplementedErrorMessage',
      meaning: 'not implemented yet, sorry',
      description: 'Not implemented error message)'
    });
    this.notificationService.showMessage(message);
    // todo avatar edit feature
  }

  onChangePasswordClicked() {
    const message = this.i18n({
      value: 'Not implemented yet, sorry)',
      id: 'notImplementedErrorMessage',
      meaning: 'not implemented yet, sorry',
      description: 'Not implemented error message)'
    });
    this.notificationService.showMessage(message);
    // todo password change feature
  }

  onDeleteAccountClicked() {
    this.showConfirmAccountDeleteDialog(this.userFromApi.id);
  }

  onArticleClicked(id: number) {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigateByUrl('article/' + id.toString());
  }

  onCommentClicked(articleId: number) {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigateByUrl('article/' + articleId.toString());
  }

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }

  private setInitialFormValues(name: string, language: Language) {
    this.initialFormValues = {name, primaryLanguageSelect: language};
  }

  private showConfirmAccountDeleteDialog(id: number) {
    const dialogTitle = this.i18n({
      value: 'Delete account',
      id: 'deleteAccountDialogTitle',
      meaning: 'Delete account',
      description: 'Delete account'
    });

    const dialogMessage = this.i18n({
      value: 'Are you sure you want to delete account? This can\'t be undone!',
      id: 'deleteAccountDialogMessage',
      meaning: 'Are you sure you want to delete account? This can\'t be undone!',
      description: 'Are you sure you want to delete account? This can\'t be undone!'
    });
    this.dialogsService
      .confirm(dialogTitle, dialogMessage, dialogTitle)
      .subscribe((res: boolean) => {
        if (res) {
          this.deleteAccount(id);
        }
      });
  }

  private deleteAccount(id: number) {
    this.accountInteractor
      .deleteAccount(id)
      .subscribe(
        () => {
        },
        error => this.notificationService.showError(error)
      );
  }

  onAvatarLoadError(event) {
    event.target.src = './assets/baseline-image-24px.svg';
  }
}
