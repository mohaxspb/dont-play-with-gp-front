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

  // todo image Url

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

  articleId: number | null = null;
  actionType: ActionType | null = null;
  entityId: number | null = null;

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

  onImageFileNameChanged(imageFileName: string) {
    console.log('onImageFileNameChanged: %s', imageFileName);
    this.imageFileName = imageFileName;
  }

  logoImageFileChange(files: FileList) {
    console.log('logoImageFileChange: ', files);
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

  get maxSizeText(): string {
    const maxSize = this.articleCreateFormGroup.controls.imageFile.getError('maxContentSize').maxSize;
    return new ByteFormatPipe(null).transform(maxSize);
  }

  get actualSizeText(): string {
    const actualSize = this.articleCreateFormGroup.controls.imageFile.getError('maxContentSize').actualSize;
    return new ByteFormatPipe(null).transform(actualSize);
  }

  private initForm() {
    const isEditArticleMode = this.actionType !== null && this.actionType === ActionType.EDIT_ARTICLE;
    const isEditTranslationMode = this.actionType !== null && this.actionType === ActionType.EDIT_TRANSLATION;
    const isAddTranslationMode = this.actionType !== null && this.actionType === ActionType.ADD_TRANSLATION;
    const isEditVersionMode = this.actionType !== null && this.actionType === ActionType.EDIT_VERSION;
    const isAddVersionMode = this.actionType !== null && this.actionType === ActionType.ADD_VERSION;
    console.log('isEditArticleMode || isEditTranslationMode: %s', isEditArticleMode || isEditTranslationMode);
    const articlePrimaryLang = this.article !== null
      ? GpLanguageService.getLanguageById(this.languagesListFromApi, this.article.originalLangId)
      : null;
    this.articleCreateFormGroup = this.fBuilder.group({
      // todo correctly fill inputs from this.article
      imageFile: new FormControl(
        null,
        [FileValidator.maxContentSize(this.maxSize)]
      ),
      imageFileName: new FormControl(
        null,
        []
      ),
      articleIsFromAnotherSite: new FormControl(
        {
          value: this.article !== null ? this.article.sourceUrl !== null : true,
          disabled: isEditTranslationMode || isAddTranslationMode || isAddVersionMode || isEditVersionMode
        },
        []
      ),
      sourceTitle: new FormControl(
        {
          value: this.article !== null ? this.article.sourceTitle : null,
          disabled: isEditTranslationMode || isAddTranslationMode || isAddVersionMode || isEditVersionMode
        },
        [Validators.required]
      ),
      sourceAuthorName: new FormControl(
        {
          value: this.article !== null ? this.article.sourceAuthorName : null,
          disabled: isEditTranslationMode || isAddTranslationMode || isAddVersionMode || isEditVersionMode
        },
        []
      ),
      sourceUrl: new FormControl(
        {
          value: this.article !== null ? this.article.sourceUrl : null,
          disabled: isEditTranslationMode || isAddTranslationMode || isAddVersionMode || isEditVersionMode
        },
        [Validators.required, Validators.pattern(URL_PATTERN)]
      ),
      primaryLanguageSelect: new FormControl(
        {value: articlePrimaryLang, disabled: isEditTranslationMode || isAddTranslationMode || isAddVersionMode || isEditVersionMode},
        [Validators.required]
      ),
      title: new FormControl(
        {value: null, disabled: isEditArticleMode || isEditVersionMode || isAddVersionMode},
        [Validators.required]
      ),
      shortDescription: new FormControl(
        {value: null, disabled: isEditArticleMode || isEditVersionMode || isAddVersionMode},
        []
      ),
      markdownText: new FormControl(
        // fixme disable not working here
        {value: null, disabled: isEditArticleMode || isEditTranslationMode},
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
            const articleId = queryParams.get('articleId');
            const actionType = queryParams.get('actionType');
            const entityId = queryParams.get('entityId');
            console.log('articleId, actionType, entityId: %s/%s/%s: ', articleId, actionType, entityId);
            if (articleId !== null) {
              this.articleId = Number(articleId);
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
              this.entityId = Number(entityId);
              console.log(
                'articleId, actionType, entityId, actionTitle: %s/%s/%s: ',
                this.articleId, this.actionType, this.entityId, this.actionTitle
              );
              return this.articleService.getArticleById(this.articleId);
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
  EDIT_TRANSLATION = 'ADD_VERSION',
  ADD_VERSION = 'ADD_VERSION',
  EDIT_VERSION = 'EDIT_VERSION'
}
