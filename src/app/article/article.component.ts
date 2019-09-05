import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

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
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
    this.loadInitialData();

    // handle user changed
    this.userProvider
      .getUser()
      .subscribe(value => {
        console.log('this.user !== value: %s', (this.user === null && value !== null) || (this.user !== null && value === null));
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
    console.log('onDataRefreshClicked');
    if (this.languages == null) {
      this.loadInitialData();
    } else {
      this.loadArticle();
    }
  }

  onApproveArticleChanged(checked: boolean) {
    console.log('onApproveArticleChanged: %s', checked);

    this.progressInAction.next(true);
    this.articleService
      .approveArticle(this.article.id, checked)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => {
          // console.log('approveArticle: %s', JSON.stringify(value));
          this.article = value;
        },
        error => {
          this.article.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onApproveTranslationChanged(checked: boolean) {
    console.log('onApproveTranslationChanged: %s', checked);

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
    console.log('onApproveVersionChanged: %s', checked);

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
    console.log('onPublishArticleChanged: %s', checked);
    this.showPublishConfirmDialog(DataType.ARTICLE, this.article.id, checked);
  }

  onPublishTranslationChanged(checked: boolean) {
    console.log('onPublishTranslationChanged: %s', checked);
    this.showPublishConfirmDialog(DataType.TRANSLATION, this.selectedTranslation.id, checked);
  }

  onPublishVersionChanged(checked: boolean) {
    console.log('onPublishVersionChanged: %s', checked);
    this.showPublishConfirmDialog(DataType.VERSION, this.selectedTranslationVersion.id, checked);
  }

  onLanguageSelected(language: Language) {
    // console.log('onLanguageSelected: %s', JSON.stringify(language));
    this.selectedLanguage = language;

    this.selectedTranslation = this.calculateSelectedTranslation();
    this.selectedTranslationVersion = this.calculateVersion();
  }

  onTranslationAddClicked() {
    console.log('onTranslationAddClicked');
    // show login or translation create component
    if (this.user == null) {
      this.bottomSheet.open(LoginComponent, {data: {title: 'To add translation you should'}});
    } else {
      // navigate to translation create component.
      // mostly same as article create, except of source and image and origLang
      // maybe we should use same component with blocked fields
      this.router.navigate(
        ['create-article'],
        {
          queryParams: {
            articleId: this.article.id,
            actionType: ActionType.ADD_TRANSLATION,
            entityId: this.article.id
          }
        }
      );
    }
  }

  onTranslationEditClicked() {
    console.log('onTranslationEditClicked');
    // only author or admin could call this, so no need to login

    // navigate to translation create component.
    // mostly same as article create, except of source and image and origLang
    // maybe we should use same component with blocked fields
    this.router.navigate(
      ['create-article'],
      {
        queryParams: {
          articleId: this.article.id,
          actionType: ActionType.EDIT_TRANSLATION,
          entityId: this.selectedTranslation.id
        }
      }
    );
  }

  isAdmin(): boolean {
    return this.user != null && this.user.authorities.map(value => value.authority).includes(AuthorityType.ADMIN);
  }

  private loadInitialData() {
    console.log('loadInitialData');
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

          console.log('pathParams', pathParams);
          console.log('queryParams', queryParams);

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
    console.log('loadArticle');

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
          this.preferredLanguage = this.calculatePreferredLanguage(this.user, this.languages);

          // selected lang calculation
          // this can be passed from outside (click on concrete translation). If not - calculate it
          console.log('this.selectedLanguage: %s', JSON.stringify(this.selectedLanguage));
          if (this.selectedLanguage == null) {
            this.selectedLanguage = this.calculateSelectedLanguage(this.article, this.preferredLanguage, this.languages);
          }
          console.log('preferredLanguage: %s', JSON.stringify(this.preferredLanguage));
          console.log('selectedLanguage: %s', JSON.stringify(this.selectedLanguage));

          this.availableArticleLanguages = this.calculateAvailableArticleLanguages();
          console.log(this.availableArticleLanguages);

          this.selectedTranslation = this.calculateSelectedTranslation();
          this.selectedTranslationVersion = this.calculateVersion();
        },
        error => this.notificationService.showError(error)
      );
  }

  private calculatePreferredLanguage(user: GpUser | null, languages: [Language]): Language {
    let language: Language;
    if (user != null) {
      language = GpLanguageService.getLanguageById(languages, user.primaryLanguageId);
    } else {
      // lang from localStorage. May be null, as it uses browser locale.
      const langFromDefaultLangCode = GpLanguageService.getLanguageByLangCode(
        languages,
        this.languageService.getDefaultLangCode()
      );
      if (langFromDefaultLangCode == null) {
        language = GpLanguageService.getEnglish(languages);
      } else {
        language = langFromDefaultLangCode;
      }
    }
    return language;
  }

  /**
   * or we can calculate it based on available translations and preferred language
   */
  private calculateSelectedLanguage(article: Article, preferredLanguage: Language, languages: [Language]): Language {
    const preferredTranslation = article.translations.find(value => value.langId === preferredLanguage.id);
    if (preferredTranslation != null) {
      return preferredLanguage;
    } else {
      const english = GpLanguageService.getEnglish(languages);
      if (article.translations.find(value => value.langId === english.id) != null) {
        return english;
      } else {
        return GpLanguageService.getLanguageById(languages, article.originalLangId);
      }
    }
  }

  private calculateSelectedTranslation(): ArticleTranslation {
    return this.article.translations.find(value => value.langId === this.selectedLanguage.id);
  }

  /**
   * get most recent published or most recent approved or most recent updated
   */
  private calculateVersion(): ArticleTranslationVersion {
    const versions = this.selectedTranslation.versions;
    const mostRecentPublished = versions
      .filter(value => value.published)
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    if (mostRecentPublished.length !== 0) {
      return mostRecentPublished[0];
    }

    const mostRecentApproved = versions
      .filter(value => value.approved)
      .sort((a, b) => b.approvedDate.getTime() - a.approvedDate.getTime());
    if (mostRecentApproved.length !== 0) {
      return mostRecentApproved[0];
    }

    return versions.sort((a, b) => b.updated.getTime() - a.updated.getTime())[0];
  }

  private calculateAvailableArticleLanguages(): Array<Language> {
    return this.article.translations.map(translation => this.languages.find(lang => translation.langId === lang.id));
  }

  // todo translation
  private showPublishConfirmDialog(dataType: DataType, id: number, publish: boolean) {
    let action: string;
    if (publish) {
      action = 'publish';
    } else {
      action = 'hide';
    }
    this.dialogsService
      .confirm(
        action + ' ' + dataType,
        'Are you sure you want to ' + action + ' this ' + dataType + '?\n' +
        'It will be available for everyone immediately!',
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
          console.log('Do not publish!');
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
        value => this.article
          .translations[this.getSelectedTranslationIndexInArticle()]
          .versions[this.getSelectedVersionIndexInSelectedTranslation()] = value,
        error => {
          this.selectedTranslationVersion.published = !publish;
          this.notificationService.showError(error);
        }
      );
  }

  private getSelectedTranslationIndexInArticle(): number {
    return this.article.translations.findIndex(translation => translation.id === this.selectedTranslation.id);
  }

  private getSelectedVersionIndexInSelectedTranslation(): number {
    return this.article.translations[this.getSelectedTranslationIndexInArticle()]
      .versions.findIndex(version => version.id === this.selectedTranslationVersion.id);
  }
}

export enum DataType {
  ARTICLE = 'article',
  TRANSLATION = 'translation',
  VERSION = 'version'
}
