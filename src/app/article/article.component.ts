import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {GpArticleService} from '../service/data/GpArticleService';
import {BehaviorSubject, zip} from 'rxjs';
import {NotificationService} from '../service/ui/NotificationService';
import {finalize} from 'rxjs/operators';
import {Article} from '../model/data/Article';
import {UserProvider} from '../service/auth/UserProvider';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {Language} from '../model/data/Language';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

  dataIsLoading = new BehaviorSubject<boolean>(false);

  articleId: number;

  article: Article;
  languages: [Language] = null;
  user: GpUser | null;

  preferredLanguage: Language;
  selectedLanguage: Language | null = null;

  constructor(
    private route: ActivatedRoute,
    private articleService: GpArticleService,
    private userProvider: UserProvider,
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
        }
      );
  }

  private loadArticle() {
    console.log('loadArticle');

    this.dataIsLoading.next(true);

    zip(
      this.articleService.getFullArticleById(this.articleId),
      this.userProvider.getUser()
    )
      .pipe(
        finalize(() => this.dataIsLoading.next(false))
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
          console.log('this.article.originalLangId: %s', this.article.originalLangId);
          if (this.selectedLanguage == null) {
            this.selectedLanguage = this.calculateSelectedLanguage(this.article, this.preferredLanguage, this.languages);
          }
          console.log('preferredLanguage: %s', JSON.stringify(this.preferredLanguage));
          console.log('selectedLanguage: %s', JSON.stringify(this.selectedLanguage));
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
}
