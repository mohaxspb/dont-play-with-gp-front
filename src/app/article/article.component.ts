import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {GpArticleService} from '../service/data/GpArticleService';
import {BehaviorSubject, zip} from 'rxjs';
import {NotificationService} from '../service/ui/NotificationService';
import {finalize} from 'rxjs/operators';
import {Article} from '../model/data/Article';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {Language} from '../model/data/Language';
import {ArticleTranslation} from '../model/data/ArticleTranslation';
import {ArticleTranslationVersion} from '../model/data/ArticleTranslationVersion';
import {GpUserService} from '../service/auth/GpUserService';
import {AuthorityType} from '../model/auth/Authority';
import {DialogService} from '../service/ui/DialogService';
import {LoginComponent} from '../login/login.component';
import {MatBottomSheet} from '@angular/material';
import {UserProvider} from '../service/auth/UserProvider';
import {ActionType} from '../article-create/article-create.component';
import {Api} from '../service/Api';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

  @ViewChild('dateInput', {static: false}) dateInput: ElementRef<HTMLInputElement>;

  publishDate: string | null;

  dataIsLoading = new BehaviorSubject<boolean>(false);
  progressInAction = new BehaviorSubject<boolean>(false);

  articleId: number;

  article: Article;
  languages: [Language] = null;
  user: GpUser | null = null;

  preferredLanguage: Language;
  selectedLanguage: Language | null = null;

  availableArticleLanguages: Array<Language>;

  selectedTranslation: ArticleTranslation;
  selectedTranslationVersion: ArticleTranslationVersion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: GpArticleService,
    private userService: GpUserService,
    private userProvider: UserProvider,
    private languageService: GpLanguageService,
    private notificationService: NotificationService,
    private dialogsService: DialogService,
    private bottomSheet: MatBottomSheet,
    private i18n: I18n
  ) {
  }

  ngOnInit() {
    this.loadInitialData();

    // handle user changed
    this.userProvider
      .getUser()
      .subscribe(value => {
        if ((this.user === null && value !== null) || (this.user !== null && value === null)) {
          this.user = value;
          // update article if user changed (i.e. login with admin authority)
          if (this.article != null) {
            this.loadArticle();
          }
        }
      });
  }

  onDataRefreshClicked() {
    if (this.languages == null) {
      this.loadInitialData();
    } else {
      this.loadArticle();
    }
  }

  onApproveArticleChanged(checked: boolean) {
    this.progressInAction.next(true);
    this.articleService
      .approveArticle(this.article.id, checked)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => this.article = value,
        error => {
          this.article.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onApproveTranslationChanged(checked: boolean) {
    this.progressInAction.next(true);

    this.articleService
      .approveArticleTranslation(this.selectedTranslation.id, checked)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => this.article.translations[this.getSelectedTranslationIndexInArticle()] = value,
        error => {
          this.selectedTranslation.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onApproveVersionChanged(checked: boolean) {
    this.progressInAction.next(true);

    this.articleService
      .approveArticleTranslationVersion(this.selectedTranslationVersion.id, checked)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => this.article
          .translations[this.getSelectedTranslationIndexInArticle()]
          .versions[this.getSelectedVersionIndexInSelectedTranslation()] = value,
        error => {
          this.selectedTranslationVersion.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onPublishArticleChanged(checked: boolean) {
    this.showPublishConfirmDialog(DataType.ARTICLE, this.article.id, checked);
  }

  onPublishTranslationChanged(checked: boolean) {
    this.showPublishConfirmDialog(DataType.TRANSLATION, this.selectedTranslation.id, checked);
  }

  onPublishVersionChanged(checked: boolean) {
    this.showPublishConfirmDialog(DataType.VERSION, this.selectedTranslationVersion.id, checked);
  }

  onLanguageSelected(language: Language) {
    this.selectedLanguage = language;

    this.selectedTranslation = this.calculateSelectedTranslation();
    this.selectedTranslationVersion = this.calculateVersion();
  }

  onArticleEditClicked() {
    // only author or admin could see it, so no need to login

    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(
      ['create-article'],
      {
        queryParams: {
          articleId: this.article.id,
          actionType: ActionType.EDIT_ARTICLE,
          translationId: this.selectedTranslation.id,
          versionId: this.selectedTranslationVersion.id
        }
      }
    );
  }

  onArticleDeleteClicked() {
    // only author or admin could see it, so no need to login
    this.showConfirmArticleDeleteDialog(this.article.id);
  }

  onTranslationDeleteClicked() {
    // only author or admin could see it, so no need to login
    this.showConfirmTranslationDeleteDialog(this.selectedTranslation.id);
  }

  onVersionDeleteClicked() {
    // only author or admin could see it, so no need to login
    this.showConfirmVersionDeleteDialog(this.selectedTranslationVersion.id);
  }

  onTranslationAddClicked() {
    // show login or translation create component
    if (this.user == null) {
      const title = this.i18n({
        value: 'To add translation you should',
        id: 'translationAddLoginTitle',
        meaning: 'to add translation you should',
        description: 'to add translation you should'
      });
      this.bottomSheet.open(LoginComponent, {data: {title}});
    } else {
      // noinspection JSIgnoredPromiseFromCall
      this.router.navigate(
        ['create-article'],
        {
          queryParams: {
            articleId: this.article.id,
            actionType: ActionType.ADD_TRANSLATION,
            translationId: null,
            versionId: null
          }
        }
      );
    }
  }

  onVersionAddClicked() {
    if (this.user == null) {
      const title = this.i18n({
        value: 'To add text version you should',
        id: 'versionAddLoginTitle',
        meaning: 'to add text version you should',
        description: 'to add text version you should'
      });
      this.bottomSheet.open(LoginComponent, {data: {title}});
    } else {
      // noinspection JSIgnoredPromiseFromCall
      this.router.navigate(
        ['create-article'],
        {
          queryParams: {
            articleId: this.article.id,
            actionType: ActionType.ADD_VERSION,
            translationId: this.selectedTranslation.id,
            versionId: null
          }
        }
      );
    }
  }

  onVersionEditClicked() {
    // only author or admin could see it, so no need to login

    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(
      ['create-article'],
      {
        queryParams: {
          articleId: this.article.id,
          actionType: ActionType.EDIT_VERSION,
          translationId: this.selectedTranslation.id,
          versionId: this.selectedTranslationVersion.id
        }
      }
    );
  }

  onTranslationEditClicked() {
    // only author or admin could see it, so no need to login

    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(
      ['create-article'],
      {
        queryParams: {
          articleId: this.article.id,
          actionType: ActionType.EDIT_TRANSLATION,
          translationId: this.selectedTranslation.id,
          versionId: this.selectedTranslationVersion.id
        }
      }
    );
  }

  onSelectedVersionChanged(version: ArticleTranslationVersion) {
    this.selectedTranslationVersion = version;
  }

  get versionsSelectIsVisible() {
    return this.user !== null && (
      this.isAdmin()
      || this.article.authorId === this.user.id
      || this.selectedTranslation.authorId === this.user.id
      || this.selectedTranslation.versions.find(value => value.authorId === this.user.id)
    );
  }

  isAdmin(): boolean {
    return this.user != null && this.user.authorities.map(value => value.authority).includes(AuthorityType.ADMIN);
  }

  getFullImagePath(relativePath: string): string {
    return Api.URL + relativePath;
  }

  private showConfirmArticleDeleteDialog(id: number) {
    const dialogTitle = this.i18n({
      value: 'Delete article',
      id: 'deleteArticleDialogTitle',
      meaning: 'Delete article',
      description: 'Delete article'
    });

    const dialogMessage = this.i18n({
      value: 'Are you sure you want to delete article? This can\'t be undone!',
      id: 'deleteArticleDialogMessage',
      meaning: 'Are you sure you want to delete article? This can\'t be undone!',
      description: 'Are you sure you want to delete article? This can\'t be undone!'
    });

    this.dialogsService
      .confirm(dialogTitle, dialogMessage, dialogTitle)
      .subscribe((res: boolean) => {
        if (res) {
          this.deleteArticle(id);
        }
      });
  }

  private showConfirmTranslationDeleteDialog(id: number) {
    const dialogTitle = this.i18n({
      value: 'Delete translation',
      id: 'deleteTranslationDialogTitle',
      meaning: 'Delete translation',
      description: 'Delete translation'
    });

    const dialogMessage = this.i18n({
      value: 'Are you sure you want to delete translation? This can\'t be undone!',
      id: 'deleteTranslationDialogMessage',
      meaning: 'Are you sure you want to delete translation? This can\'t be undone!',
      description: 'Are you sure you want to delete translation? This can\'t be undone!'
    });

    this.dialogsService
      .confirm(dialogTitle, dialogMessage, dialogTitle)
      .subscribe((res: boolean) => {
        if (res) {
          this.deleteTranslation(id);
        }
      });
  }

  private showConfirmVersionDeleteDialog(id: number) {
    const dialogTitle = this.i18n({
      value: 'Delete text version',
      id: 'deleteVersionDialogTitle',
      meaning: 'Delete text version',
      description: 'Delete text version'
    });

    const dialogMessage = this.i18n({
      value: 'Are you sure you want to delete text version? This can\'t be undone!',
      id: 'deleteVersionDialogMessage',
      meaning: 'Are you sure you want to delete text version? This can\'t be undone!',
      description: 'Are you sure you want to delete text version? This can\'t be undone!'
    });

    this.dialogsService
      .confirm(dialogTitle, dialogMessage, dialogTitle)
      .subscribe((res: boolean) => {
        if (res) {
          this.deleteVersion(id);
        }
      });
  }

  private loadInitialData() {
    this.dataIsLoading.next(true);

    zip(
      this.route.paramMap,
      this.route.queryParamMap,
      this.languageService.getLanguages()
    )
      .pipe(
        finalize(() => {
          this.dataIsLoading.next(false);
          if (this.languages != null) {
            this.loadArticle();
          }
        })
      )
      .subscribe(
        (paramsAndLanguages: [ParamMap, ParamMap, [Language]]) => {
          const pathParams = paramsAndLanguages[0];
          const queryParams = paramsAndLanguages[1];

          this.articleId = parseInt(pathParams.get('articleId'), 0);

          this.languages = paramsAndLanguages[2];

          const passedLangId = queryParams.get('langId');
          if (passedLangId != null) {
            this.selectedLanguage = GpLanguageService.getLanguageById(this.languages, parseInt(passedLangId.toString(), 10));
          }
        },
        error => this.notificationService.showError(error)
      );
  }

  private loadArticle() {
    this.dataIsLoading.next(true);

    this.articleService
      .getFullArticleById(this.articleId)
      .pipe(
        finalize(() => {
          this.dataIsLoading.next(false);
        })
      )
      .subscribe(
        (article: Article) => {
          this.article = article;

          // preferred lang calculation
          this.preferredLanguage = this.languageService.getPreferredLanguageForUser(this.user, this.languages);

          // selected lang calculation
          // this can be passed from outside (click on concrete translation). If not - calculate it
          if (this.selectedLanguage == null) {
            this.selectedLanguage = GpArticleService.getCorrectLanguageForArticle(this.article, this.preferredLanguage, this.languages);
          }

          this.availableArticleLanguages = GpArticleService.getLanguagesFromArticle(this.article, this.languages);

          this.selectedTranslation = this.calculateSelectedTranslation();
          this.selectedTranslationVersion = this.calculateVersion();
        },
        error => this.notificationService.showError(error)
      );
  }

  private calculateSelectedTranslation(): ArticleTranslation {
    const foundTranslation = this.article.translations.find(value => value.langId === this.selectedLanguage.id);
    if (foundTranslation) {
      return foundTranslation;
    } else {
      return this.article.translations[0];
    }
  }

  /**
   * get most recent published or most recent approved or most recent updated
   */
  private calculateVersion(): ArticleTranslationVersion {
    const versions = this.selectedTranslation.versions;

    const mostRecentPublished = versions
      .filter(value => value.published)
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    if (mostRecentPublished.length !== 0) {
      return mostRecentPublished[0];
    }

    const mostRecentApproved = versions
      .filter(value => value.approved)
      .sort((a, b) => new Date(b.approvedDate).getTime() - new Date(a.approvedDate).getTime());
    if (mostRecentApproved.length !== 0) {
      return mostRecentApproved[0];
    }

    return versions.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())[0];
  }

  private showPublishConfirmDialog(dataType: DataType, id: number, publish: boolean) {
    let action: string;
    if (publish) {
      action = 'publish';
    } else {
      action = 'hide';
    }

    const dialogMessage = this.i18n({
      value: 'Are you sure you want to {{action}} this {{dataType}}?\nIt will be available for everyone immediately!',
      id: 'deleteVersionDialogTitle',
      meaning: 'Delete text version',
      description: 'Delete text version'
    }, {action, dataType});

    this.dialogsService
      .confirm(
        action + ' ' + dataType,
        dialogMessage,
        action
      )
      .subscribe((res: boolean) => {
        if (res) {
          switch (dataType) {
            case DataType.ARTICLE:
              this.publishArticle(id, publish);
              break;
            case DataType.TRANSLATION:
              this.publishArticleTranslation(id, publish);
              break;
            case DataType.VERSION:
              this.publishArticleTranslationVersion(id, publish);
              break;
          }
        } else {
          switch (dataType) {
            case DataType.ARTICLE:
              this.article.published = !this.article.published;
              break;
            case DataType.TRANSLATION:
              this.selectedTranslation.published = !this.selectedTranslation.published;
              break;
            case DataType.VERSION:
              this.selectedTranslationVersion.published = !this.selectedTranslationVersion.published;
              break;
          }
        }
      });
  }

  private publishArticle(id: number, publish: boolean) {
    this.progressInAction.next(true);

    this.articleService
      .publishArticle(id, publish)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => this.article = value,
        error => {
          this.article.published = !publish;
          this.notificationService.showError(error);
        }
      );
  }

  private publishArticleTranslation(id: number, publish: boolean) {
    this.progressInAction.next(true);

    this.articleService
      .publishArticleTranslation(id, publish)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => this.article.translations[this.getSelectedTranslationIndexInArticle()] = value,
        error => {
          this.selectedTranslation.published = !publish;
          this.notificationService.showError(error);
        }
      );
  }

  private publishArticleTranslationVersion(id: number, publish: boolean) {
    this.progressInAction.next(true);

    this.articleService
      .publishArticleTranslationVersion(id, publish)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => {
          this.article
            .translations[this.getSelectedTranslationIndexInArticle()]
            .versions[this.getSelectedVersionIndexInSelectedTranslation()].published = value.updatedVersion.published;
          if (value.unpublishedVersion != null) {
            this.notificationService.showMessage(`Version published. Version with ID ${value.unpublishedVersion.id} is unpublished!`);
            this.article
              .translations[this.getSelectedTranslationIndexInArticle()]
              .versions
              .find(value1 => value1.id === value.unpublishedVersion.id)
              .published = false;
          }
        },
        error => {
          this.selectedTranslationVersion.published = !publish;
          this.notificationService.showError(error);
        }
      );
  }

  private deleteArticle(id: number) {
    this.progressInAction.next(true);

    this.articleService
      .deleteArticle(id)
      .pipe(finalize(() => this.progressInAction.next(false)))
      .subscribe(
        () => {
          // noinspection JSIgnoredPromiseFromCall
          this.router.navigateByUrl('feed');
        },
        error => this.notificationService.showError(error)
      );
  }

  private deleteTranslation(id: number) {
    this.progressInAction.next(true);

    this.articleService
      .deleteTranslation(id)
      .pipe(finalize(() => this.progressInAction.next(false)))
      .subscribe(
        () => this.loadArticle(),
        error => this.notificationService.showError(error)
      );
  }

  private deleteVersion(id: number) {
    this.progressInAction.next(true);

    this.articleService
      .deleteVersion(id)
      .pipe(finalize(() => this.progressInAction.next(false)))
      .subscribe(
        () => this.loadArticle(),
        error => this.notificationService.showError(error)
      );
  }

  private getSelectedTranslationIndexInArticle(): number {
    return this.article.translations.findIndex(translation => translation.id === this.selectedTranslation.id);
  }

  private getSelectedVersionIndexInSelectedTranslation(): number {
    return this.article.translations[this.getSelectedTranslationIndexInArticle()]
      .versions.findIndex(version => version.id === this.selectedTranslationVersion.id);
  }

  publishArticleForDate() {
    this.progressInAction.next(true);

    this.articleService
      .publishArticleWithDate(this.article.id, this.publishDate)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => this.article = value,
        error => {
          this.notificationService.showError(error);
        }
      );
  }

  onPublishDateChanged(value: string) {
    this.publishDate = value ? new Date(Date.parse(value)).toISOString() : null;
  }

  onArticleImageLoadError(event) {
    event.target.src = './assets/baseline-image-24px.svg';
  }
}

export enum DataType {
  ARTICLE = 'article',
  TRANSLATION = 'translation',
  VERSION = 'version'
}
