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
  translationLanguage: Language;

  sourceTitle: string | null = null;
  sourceUrl: string | null = null;
  sourceAuthorName: string | null = null;

  title: string = null;
  shortDescription: string = null;
  text: string = null;

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
  submitTitle = 'Save';

  article: Article | null = null;
  translation: ArticleTranslation | null = null;
  version: ArticleTranslationVersion | null = null;

  articleId: number | null = null;
  actionType: ActionType = ActionType.CREATE_ARTICLE;
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

    this.updateSourceDataControls();
  }

  onPrimaryLanguageChanged(language: Language) {
    console.log('onPrimaryLanguageChanged: %s', JSON.stringify(language));
    this.articleLanguage = language;
  }

  onTranslationLanguageChanged(language: Language) {
    console.log('onTranslationLanguageChanged: %s', JSON.stringify(language));
    this.translationLanguage = language;
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
    this.progressInAction.next(true);

    switch (this.actionType) {
      case ActionType.CREATE_ARTICLE:
        console.log('CREATE_ARTICLE');
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
        break;
      case ActionType.EDIT_ARTICLE:
        console.log('EDIT_ARTICLE: %s/%s/%s/%s/%s',
          this.articleId,
          this.articleLanguage,
          this.sourceUrl,
          this.sourceAuthorName,
          this.sourceTitle
        );
        // todo
        break;
      case ActionType.ADD_TRANSLATION:
        console.log('ADD_TRANSLATION: %s/%s/%s/%s/%s/%s/%s',
          this.articleId,
          this.translationLanguage,
          this.imageFile,
          this.imageFileName,
          this.title,
          this.shortDescription,
          this.text
        );
        // todo
        break;
      case ActionType.EDIT_TRANSLATION:
        console.log('EDIT_TRANSLATION: %s/%s/%s/%s/%s/%s',
          this.articleId,
          this.translationId,
          this.imageFile,
          this.imageFileName,
          this.title,
          this.shortDescription,
        );
        // todo
        break;
      case ActionType.ADD_VERSION:
        console.log('ADD_VERSION: %s/%s/%s',
          this.articleId,
          this.translationId,
          this.text
        );
        // todo
        break;
      case ActionType.EDIT_VERSION:
        console.log('EDIT_VERSION: %s/%s/%s/%s',
          this.articleId,
          this.translationId,
          this.versionId,
          this.text
        );
        // todo
        break;
    }
  }

  onImageLoadError(event) {
    console.log('onImageLoadError');
    event.target.src = './assets/baseline-image-24px.svg';
  }

  onUseExistingImageClicked(checked: boolean) {
    console.log('onUseExistingImageClicked: %s', checked);

    // disable img inputs, set image url
    if (checked) {
      this.articleImageUrl = this.article.translations[0].imageUrl;
      this.imageFileName = this.getImageFileNameFromUrl();
      this.articleCreateFormGroup.controls.imageFile.disable();
      this.articleCreateFormGroup.controls.imageFileName.disable();
    } else {
      this.articleImageUrl = null;
      this.imageFileName = null;
      this.articleCreateFormGroup.controls.imageFile.enable();
      this.articleCreateFormGroup.controls.imageFileName.enable();
    }
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

  get isCreateArticleMode(): boolean {
    return this.actionType === ActionType.CREATE_ARTICLE;
  }

  get isEditArticleMode(): boolean {
    return this.actionType === ActionType.EDIT_ARTICLE;
  }

  get isEditTranslationMode(): boolean {
    return this.actionType === ActionType.EDIT_TRANSLATION;
  }

  get isAddTranslationMode(): boolean {
    return this.actionType === ActionType.ADD_TRANSLATION;
  }

  get isEditVersionMode(): boolean {
    return this.actionType === ActionType.EDIT_VERSION;
  }

  get isAddVersionMode(): boolean {
    return this.actionType === ActionType.ADD_VERSION;
  }

  private initForm() {
    console.log('isEditArticleMode: %s', this.isEditArticleMode);
    console.log('isAddTranslationMode: %s', this.isAddTranslationMode);
    console.log('isEditTranslationMode: %s', this.isEditTranslationMode);
    console.log('isAddVersionMode: %s', this.isAddVersionMode);
    console.log('isEditVersionMode: %s', this.isEditVersionMode);

    if (this.actionType !== ActionType.CREATE_ARTICLE) {
      this.articleIsFromAnotherSite = this.article.sourceUrl != null;

      this.articleLanguage = GpLanguageService.getLanguageById(this.languagesListFromApi, this.article.originalLangId);

      const translation = this.article.translations.find(value => value.id === this.translationId);
      this.translation = translation ? translation : null;
      if (this.translation != null) {
        this.translationLanguage = GpLanguageService.getLanguageById(this.languagesListFromApi, this.translation.langId);

        this.title = this.translation.title;
        this.shortDescription = this.translation.shortDescription;

        const version = this.translation.versions.find(value => value.id === this.versionId);
        this.version = version ? version : null;

        if (this.version != null) {
          this.text = this.version.text;
        }
      }
    }

    this.articleImageUrl = this.translation !== null ? this.translation.imageUrl : null;
    this.imageFileName = this.getImageFileNameFromUrl();

    this.articleCreateFormGroup = this.fBuilder.group({
      useExistingImage: new FormControl(
        {
          value: false,
          disabled: this.isEditArticleMode || this.isEditTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        []
      ),
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
          value: this.articleLanguage,
          disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
        },
        this.actionType === ActionType.CREATE_ARTICLE ? [] : [Validators.required]
      ),
      translationLanguageSelect: new FormControl(
        {
          value: this.translationLanguage,
          disabled: this.isCreateArticleMode || this.isEditArticleMode || this.isAddVersionMode || this.isEditVersionMode
        },
        [Validators.required]
      ),
      title: new FormControl(
        {
          value: this.title,
          disabled: this.isEditArticleMode || this.isEditVersionMode || this.isAddVersionMode
        },
        [Validators.required]
      ),
      shortDescription: new FormControl(
        {
          value: this.shortDescription,
          disabled: this.isEditArticleMode || this.isEditVersionMode || this.isAddVersionMode
        },
        []
      ),
      markdownText: new FormControl(
        {
          value: this.text,
          // Warning!!! Disable not working here, so we hide it in template
          disabled: this.isEditArticleMode || this.isEditTranslationMode
        },
        [Validators.required]
      )
    });

    this.updateSourceDataControls();

    // this.articleCreateFormGroup.valueChanges.subscribe((changes) => {
    //   console.log('valueChanges: %s', JSON.stringify(changes));
    // });
  }

  private getImageFileNameFromUrl() {
    return this.articleImageUrl != null
      ? this.articleImageUrl.substring(this.articleImageUrl.lastIndexOf('/') + 1, this.articleImageUrl.lastIndexOf('.'))
      : null;
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
            this.actionType = ActionType[actionType];
            switch (actionType) {
              case ActionType.CREATE_ARTICLE:
                return of(null);
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
            this.submitTitle = this.actionTitle;
            this.articleId = Number(articleId);
            this.translationId = translationId != null ? Number(translationId) : null;
            this.versionId = versionId != null ? Number(versionId) : null;
            console.log(
              'actionType, articleId, translationId, versionId, actionTitle: %s/%s/%s/%s/%s: ',
              this.articleId, this.actionType, this.translationId, this.versionId, this.actionTitle
            );
            return this.articleService.getFullArticleById(this.articleId);
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

  getTranslationLanguages(): Language[] {
    let languages: Language[] = this.article.translations.map(translation => {
      return this.languagesListFromApi.find(language => language.id === translation.langId);
    });
    if (this.isAddTranslationMode) {
      languages = this.languagesListFromApi.filter(language => !languages.find(value => value.id === language.id));
    }
    return languages;
  }

  private updateSourceDataControls() {
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
}

export enum ActionType {
  CREATE_ARTICLE = 'CREATE_ARTICLE',
  EDIT_ARTICLE = 'EDIT_ARTICLE',
  ADD_TRANSLATION = 'ADD_TRANSLATION',
  EDIT_TRANSLATION = 'EDIT_TRANSLATION',
  ADD_VERSION = 'ADD_VERSION',
  EDIT_VERSION = 'EDIT_VERSION'
}
