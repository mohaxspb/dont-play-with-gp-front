import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {Language} from '../model/data/Language';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {UserProvider} from '../service/auth/UserProvider';
import {GpArticleService} from '../service/data/GpArticleService';
import {finalize, flatMap, tap} from 'rxjs/operators';
import {BehaviorSubject, of, zip} from 'rxjs';
import {URL_PATTERN} from '../GpConstants';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Article} from '../model/data/Article';
import {NotificationService} from '../service/ui/NotificationService';
import {NavigationUtils} from '../utils/NavigationUtils';
import {ByteFormatPipe, FileValidator} from 'ngx-material-file-input';
import {ArticleTranslation} from '../model/data/ArticleTranslation';
import {ArticleTranslationVersion} from '../model/data/ArticleTranslationVersion';
import {Api} from '../service/Api';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit {

  articleCreateFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  // data from api
  dataIsLoading = new BehaviorSubject<boolean>(false);
  progressInAction = new BehaviorSubject<boolean>(false);
  languagesListFromApi: [Language];

  // local data
  user: GpUser;
  articleIsFromAnotherSite = true;

  // article data
  articleLanguage: Language;

  sourceTitle: string | null = null;
  sourceUrl: string | null = null;
  sourceAuthorName: string | null = null;

  title: string;
  shortDescription: string;
  text: string;

  // image
  imageFile: File | null = null;
  imageFileName: string | null = null;
  articleImageUrl: string | null = null;
  /**
   * max imageFile size in bytes (5 Mb in that case)
   */
  maxSize = 1024 * 1024 * 5;
  // image END

  // add/edit data
  actionTitle = 'New article creation';

  article: Article | null = null;
  translation: ArticleTranslation | null = null;
  version: ArticleTranslationVersion | null = null;

  articleId: number | null = null;
  actionType: ActionType | null = null;
  translationId: number | null = null;
  versionId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fBuilder: FormBuilder,
    private languageService: GpLanguageService,
    private userProvider: UserProvider,
    private articleService: GpArticleService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.loadInitialData();
  }

  onArticleIsFromAnotherSiteClicked(checked: boolean) {
    console.log('onArticleIsFromAnotherSiteClicked: %s', checked);
    this.articleIsFromAnotherSite = checked;

    // author name is optional
    if (this.articleIsFromAnotherSite) {
      this.articleCreateFormGroup.controls.sourceTitle.setValidators([Validators.required]);
      this.articleCreateFormGroup.controls.sourceUrl.setValidators([Validators.required, Validators.pattern(URL_PATTERN)]);
    } else {
      this.articleCreateFormGroup.controls.sourceTitle.clearValidators();
      this.articleCreateFormGroup.controls.sourceUrl.clearValidators();
    }
    this.articleCreateFormGroup.controls.sourceTitle.updateValueAndValidity();
    this.articleCreateFormGroup.controls.sourceUrl.updateValueAndValidity();
  }

  onPrimaryLanguageChanged(language: Language) {
    console.log('onPrimaryLanguageChanged: %s', JSON.stringify(language));
    this.articleLanguage = language;
  }

  onSourceTitleChanged(sourceTitle: string) {
    console.log('onSourceTitleChanged: %s', sourceTitle);
    this.sourceTitle = sourceTitle;
  }

  onSourceUrlChanged(sourceUrl: string) {
    console.log('onSourceUrlChanged: %s', sourceUrl);
    this.sourceUrl = sourceUrl;
  }

  onSourceAuthorNameChanged(sourceAuthorName: string) {
    console.log('onSourceAuthorNameChanged: %s', sourceAuthorName);
    this.sourceAuthorName = sourceAuthorName;
  }

  onTitleChanged(title: string) {
    console.log('onTitleChanged: %s', title);
    this.title = title;
  }

  onShortDescriptionChanged(shortDescription: string) {
    console.log('onShortDescriptionChanged: %s', shortDescription);
    this.shortDescription = shortDescription;
  }

  onTextChanged(text: string) {
    console.log('onTextChanged: %s', text);
    this.text = text;
  }

  onDataRefreshClicked() {
    console.log('onDataRefreshClicked');
    this.loadInitialData();
  }

  getImagePath(imageUrl: string): string {
    return imageUrl.startsWith('data') ? imageUrl : this.getFullImagePath(imageUrl);
  }

  onImageFileNameChanged(imageFileName: string) {
    console.log('onImageFileNameChanged: %s', imageFileName);
    this.imageFileName = imageFileName;
  }

  articleImageFileChange(files: FileList) {
    console.log('articleImageFileChange: ', files);
    if (files.length > 0) {
      this.imageFile = files[0];
      this.imageFileName = this.imageFile.name;

      const reader = new FileReader();

      reader.readAsDataURL(this.imageFile); // read file as data logoImageUrl

      reader.onload = (event) => { // called once readAsDataURL is completed
        const target = event.target as FileReader;
        this.articleImageUrl = target.result.toString();
      };
    } else {
      this.onLogoFileCleared();
    }
  }

  onLogoFileCleared() {
    this.imageFile = null;
    this.imageFileName = null;
    this.articleImageUrl = null;
  }

  onArticleCreateClicked() {
    console.log('onArticleCreateClicked');
    console.log('image, imageName: %s/%s', this.imageFile, this.imageFileName);

    // test
    // this.router.navigate(['article/' + 43], {queryParams: {langId: 1}})
    //   .then(() => NavigationUtils.scrollToTop());
    //
    // return;

    this.progressInAction.next(true);
    this.articleService
      .createArticle(
        this.articleLanguage.id,
        this.sourceTitle,
        this.sourceAuthorName,
        this.sourceUrl,
        this.title,
        this.shortDescription,
        this.text,
        this.imageFile,
        this.imageFileName
      )
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        (article: Article) => this.router.navigate(
          ['article/' + article.id],
          {queryParams: {langId: article.originalLangId}}
        )
          .then(() => NavigationUtils.scrollToTop()),
        error => this.notificationService.showError(error)
      );
  }

  onImageLoadError(event) {
    console.log('onImageLoadError');
    event.target.src = './assets/baseline-image-24px.svg';
  }

  getFullImagePath(relativePath: string): string {
    return Api.URL + relativePath;
  }

  get maxSizeText(): string {
    const maxSize = this.articleCreateFormGroup.controls.imageFile.getError('maxContentSize').maxSize;
    return new ByteFormatPipe(null).transform(maxSize);
  }

  get actualSizeText(): string {
    const actualSize = this.articleCreateFormGroup.controls.imageFile.getError('maxContentSize').actualSize;
    return new ByteFormatPipe(null).transform(actualSize);
  }

  get isEditArticleMode(): boolean {
    return this.actionType !== null && this.actionType === ActionType.EDIT_ARTICLE;
  }

  get isEditTranslationMode(): boolean {
    return this.actionType !== null && this.actionType === ActionType.EDIT_TRANSLATION;
  }

  get isAddTranslationMode(): boolean {
    return this.actionType !== null && this.actionType === ActionType.ADD_TRANSLATION;
  }

  get isEditVersionMode(): boolean {
    return this.actionType !== null && this.actionType === ActionType.EDIT_VERSION;
  }

  get isAddVersionMode(): boolean {
    return this.actionType !== null && this.actionType === ActionType.ADD_VERSION;
  }

  private initForm() {
    console.log('isEditArticleMode: %s', this.isEditArticleMode);
    console.log('isAddTranslationMode: %s', this.isAddTranslationMode);
    console.log('isEditTranslationMode: %s', this.isEditTranslationMode);
    console.log('isAddVersionMode: %s', this.isAddVersionMode);
    console.log('isEditVersionMode: %s', this.isEditVersionMode);

    const articlePrimaryLang = this.article !== null
      ? GpLanguageService.getLanguageById(this.languagesListFromApi, this.article.originalLangId)
      : null;

    if (this.actionType != null) {
      const translation = this.article.translations.find(value => value.id === this.translationId);
      this.translation = translation ? translation : null;
      if (translation != null) {
        const version = this.translation.versions.find(value => value.id === this.versionId);
        this.version = version ? version : null;
      }
    }

    this.articleImageUrl = this.translation !== null ? this.translation.imageUrl : null;
    this.imageFileName = this.articleImageUrl != null
      ? this.articleImageUrl.substring(this.articleImageUrl.lastIndexOf('/') + 1, this.articleImageUrl.lastIndexOf('.'))
      : null;

    console.log('this.articleImageUrl: %s', this.articleImageUrl);
    console.log('this.imageFileName: %s', this.imageFileName);

    this.articleCreateFormGroup = this.fBuilder.group({
      // todo correctly fill inputs from this.article
      imageFile: new FormControl(
        {
          value: null,
          disabled: this.isEditArticleMode || this.isEditVersionMode || this.isAddVersionMode
        },
        [FileValidator.maxContentSize(this.maxSize)]
      ),
      imageFileName: new FormControl(
        {
          value: this.imageFileName,
          disabled: this.isEditArticleMode || this.isEditVersionMode || this.isAddVersionMode
        },
        []
      ),
      articleIsFromAnotherSite: new FormControl(
        {
          value: this.article !== null ? this.article.sourceUrl !== null : true,
          disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        []
      ),
      sourceTitle: new FormControl(
        {
          value: this.article !== null ? this.article.sourceTitle : null,
          disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        [Validators.required]
      ),
      sourceAuthorName: new FormControl(
        {
          value: this.article !== null ? this.article.sourceAuthorName : null,
          disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        []
      ),
      sourceUrl: new FormControl(
        {
          value: this.article !== null ? this.article.sourceUrl : null,
          disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        [Validators.required, Validators.pattern(URL_PATTERN)]
      ),
      primaryLanguageSelect: new FormControl(
        {
          // todo value
          value: articlePrimaryLang,
          disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        [Validators.required]
      ),
      title: new FormControl(
        {
          // todo value
          value: null,
          disabled: this.isEditArticleMode || this.isEditVersionMode || this.isAddVersionMode
        },
        [Validators.required]
      ),
      shortDescription: new FormControl(
        {
          // todo value
          value: null,
          disabled: this.isEditArticleMode || this.isEditVersionMode || this.isAddVersionMode
        },
        []
      ),
      markdownText: new FormControl(
        // Warning!!! Disable not working here, so we hide it in template
        {
          // todo value
          value: null,
          disabled: this.isEditArticleMode || this.isEditTranslationMode
        },
        [Validators.required]
      )
    });

    this.articleCreateFormGroup.valueChanges.subscribe((changes) => {
      console.log('valueChanges: %s', JSON.stringify(changes));
    });
  }

  private loadInitialData() {
    this.dataIsLoading.next(true);

    zip<[GpUser, Language[], Article | null]>(
      this.userProvider.getNonNullUser(),
      this.languageService.getLanguages(),
      // check type and load article if need;
      this.route.queryParamMap
        .pipe(
          flatMap((queryParams: ParamMap) => {
            const actionType = queryParams.get('actionType');
            const articleId = queryParams.get('articleId');
            const translationId = queryParams.get('translationId');
            const versionId = queryParams.get('versionId');
            if (actionType !== null) {
              this.actionType = ActionType[actionType];
              switch (actionType) {
                case ActionType.EDIT_ARTICLE:
                  this.actionTitle = 'Edit article';
                  break;
                case ActionType.ADD_TRANSLATION:
                  this.actionTitle = 'Add translation';
                  break;
                case ActionType.EDIT_TRANSLATION:
                  this.actionTitle = 'Edit translation';
                  break;
                case ActionType.ADD_VERSION:
                  this.actionTitle = 'Add version';
                  break;
                case ActionType.EDIT_VERSION:
                  this.actionTitle = 'Edit version';
                  break;
              }
              this.articleId = Number(articleId);
              this.translationId = translationId != null ? Number(translationId) : null;
              this.versionId = versionId != null ? Number(versionId) : null;
              console.log(
                'actionType, articleId, translationId, versionId, actionTitle: %s/%s/%s/%s/%s: ',
                this.articleId, this.actionType, this.translationId, this.versionId, this.actionTitle
              );
              return this.articleService.getFullArticleById(this.articleId);
            } else {
              return of(null);
            }
          })
        )
    )
      .pipe(
        tap((userLanguagesAndArticle: [GpUser, [Language], Article | null]) => {
          this.user = userLanguagesAndArticle[0];
          this.languagesListFromApi = userLanguagesAndArticle[1];
          this.article = userLanguagesAndArticle[2];
        }),
        finalize(() => this.dataIsLoading.next(false))
      )
      .subscribe(
        () => {
          this.initForm();
        },
        error => this.notificationService.showError(error)
      );
  }
}

export enum ActionType {
  EDIT_ARTICLE = 'EDIT_ARTICLE',
  ADD_TRANSLATION = 'ADD_TRANSLATION',
  EDIT_TRANSLATION = 'EDIT_TRANSLATION',
  ADD_VERSION = 'ADD_VERSION',
  EDIT_VERSION = 'EDIT_VERSION'
}
