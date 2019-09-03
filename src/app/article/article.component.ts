import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {GpArticleService} from '../service/data/GpArticleService';
import {BehaviorSubject, of, zip} from 'rxjs';
import {NotificationService} from '../service/ui/NotificationService';
import {catchError, finalize} from 'rxjs/operators';
import {Article} from '../model/data/Article';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {Language} from '../model/data/Language';
import {ArticleTranslation} from '../model/data/ArticleTranslation';
import {ArticleTranslationVersion} from '../model/data/ArticleTranslationVersion';
import {GpUserService} from '../service/auth/GpUserService';
import {AuthorityType} from '../model/auth/Authority';

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
    private articleService: GpArticleService,
    // private userProvider: UserProvider,
    private userService: GpUserService,
    private languageService: GpLanguageService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.loadInitialData();
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
          console.log('approveArticle: %s', JSON.stringify(value));
          this.article = value;
        },
        error => {
          this.article.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onPublishArticleChanged(checked: boolean) {
    console.log('onPublishArticleChanged: %s', checked);
    // todo make published after dialog show

    this.progressInAction.next(true);

    this.articleService
      .publishArticle(this.article.id, checked)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        value => {
          console.log('publishArticle: %s', JSON.stringify(value));
          this.article = value;
          // fixme think if we need to reset data (selected trans and ver)
        },
        error => {
          this.article.published = !checked;
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
        value => {
          // console.log('approveArticleTranslation: %s', JSON.stringify(value));

          const selectedTranslationIndex = this.article
            .translations.findIndex(translation => translation.id === this.selectedTranslation.id);
          this.article.translations[selectedTranslationIndex] = value;

          // console.log('Updated article: %s', JSON.stringify(this.article));
        },
        error => {
          this.selectedTranslation.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onPublishTranslationChanged(checked: boolean) {
    console.log('onPublishTranslationChanged: %s', checked);
    // todo make published after dialog show
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
        value => {
          // console.log('approveArticleTranslationVersion: %s', JSON.stringify(value));
          const selectedTranslationIndex = this.article
            .translations.findIndex(translation => translation.id === this.selectedTranslation.id);
          const selectedVersionIndex = this.article.translations[selectedTranslationIndex]
            .versions.findIndex(version => version.id === this.selectedTranslationVersion.id);
          this.article.translations[selectedTranslationIndex].versions[selectedVersionIndex] = value;
          // console.log('Updated article: %s', JSON.stringify(this.article));
        },
        error => {
          this.selectedTranslationVersion.approved = !checked;
          this.notificationService.showError(error);
        }
      );
  }

  onPublishVersionChanged(checked: boolean) {
    console.log('onPublishVersionChanged: %s', checked);
    // todo make published after dialog show
  }

  onLanguageSelected(language: Language) {
    // console.log('onLanguageSelected: %s', JSON.stringify(language));
    this.selectedLanguage = language;

    this.selectedTranslation = this.calculateSelectedTranslation();
    this.selectedTranslationVersion = this.calculateVersion();
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

    zip(
      this.articleService.getFullArticleById(this.articleId),
      this.userService.getUser().pipe(catchError(err => of(null)))
    )
      .pipe(
        finalize(() => {
          this.dataIsLoading.next(false);
        })
      )
      .subscribe(
        (data: [Article, GpUser | null]) => {
          this.article = data[0];
          this.user = data[1];

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
}
