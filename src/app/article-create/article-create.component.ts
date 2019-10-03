import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {Language} from '../model/data/Language';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {UserProvider} from '../service/auth/UserProvider';
import {GpArticleService} from '../service/data/GpArticleService';
import {finalize, flatMap, map, tap} from 'rxjs/operators';
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
import {TagService} from '../service/data/TagService';
import {Tag} from '../model/data/Tag';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent} from '@angular/material';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit {

  // tags
  /**
   * used for chips input
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagsInput', {static: false}) tagsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

  tagsCtrl: FormControl;

  tagsFromApi: Tag[];
  filteredTags: BehaviorSubject<Tag[] | null>;
  selectedTags: Tag[] = [];
  // tags END

  articleCreateFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  // data from api
  dataIsLoading = new BehaviorSubject<boolean>(false);
  progressInAction = new BehaviorSubject<boolean>(false);
  languagesListFromApi: [Language];

  // local data
  user: GpUser;
  preferredLanguage: Language;

  // misc
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
    private tagService: TagService,
    private userProvider: UserProvider,
    private articleService: GpArticleService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.loadInitialData();
  }

  onArticleIsFromAnotherSiteClicked(checked: boolean) {
    this.articleIsFromAnotherSite = checked;

    this.updateSourceDataControls();
  }

  onPrimaryLanguageChanged(language: Language) {
    this.articleLanguage = language;
  }

  onTranslationLanguageChanged(language: Language) {
    this.translationLanguage = language;
  }

  onSourceTitleChanged(sourceTitle: string) {
    this.sourceTitle = sourceTitle;
  }

  onSourceUrlChanged(sourceUrl: string) {
    this.sourceUrl = sourceUrl;
  }

  onSourceAuthorNameChanged(sourceAuthorName: string) {
    this.sourceAuthorName = sourceAuthorName;
  }

  onTitleChanged(title: string) {
    this.title = title;
  }

  onShortDescriptionChanged(shortDescription: string) {
    this.shortDescription = shortDescription;
  }

  onTextChanged(text: string) {
    this.text = text;
  }

  onDataRefreshClicked() {
    this.loadInitialData();
  }

  getImagePath(imageUrl: string): string {
    return imageUrl.startsWith('data') ? imageUrl : this.getFullImagePath(imageUrl);
  }

  onImageFileNameChanged(imageFileName: string) {
    this.imageFileName = imageFileName;
  }

  articleImageFileChange(files: FileList) {
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
        this.articleService
          .createArticle(
            this.articleLanguage.id,
            this.sourceTitle,
            this.sourceAuthorName,
            this.sourceUrl,
            this.selectedTags.map(value => value.title),
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
        this.articleService
          .editArticle(
            this.articleId,
            this.articleLanguage.id,
            this.sourceUrl,
            this.sourceAuthorName,
            this.sourceTitle,
            this.selectedTags.map(value => value.title)
          )
          .pipe(
            finalize(() => this.progressInAction.next(false))
          )
          .subscribe(
            () => this.router
              .navigate(
                ['article/' + this.articleId],
                {queryParams: {langId: this.translationLanguage.id}}
              )
              .then(() => NavigationUtils.scrollToTop()),
            error => this.notificationService.showError(error)
          );
        break;
      case ActionType.ADD_TRANSLATION:
        this.articleService
          .addTranslation(
            this.articleId,
            this.translationLanguage.id,
            this.imageFile,
            this.imageFileName,
            this.title,
            this.shortDescription,
            this.text
          )
          .pipe(
            finalize(() => this.progressInAction.next(false))
          )
          .subscribe(
            () => this.router
              .navigate(
                ['article/' + this.articleId],
                {queryParams: {langId: this.translationLanguage.id}}
              )
              .then(() => NavigationUtils.scrollToTop()),
            error => this.notificationService.showError(error)
          );
        break;
      case ActionType.EDIT_TRANSLATION:
        this.articleService
          .editTranslation(
            this.translationId,
            this.translationLanguage.id,
            this.imageFile,
            this.imageFileName,
            this.title,
            this.shortDescription
          )
          .pipe(
            finalize(() => this.progressInAction.next(false))
          )
          .subscribe(
            () => this.router
              .navigate(
                ['article/' + this.articleId],
                {queryParams: {langId: this.translationLanguage.id}}
              )
              .then(() => NavigationUtils.scrollToTop()),
            error => this.notificationService.showError(error)
          );
        break;
      case ActionType.ADD_VERSION:
        this.articleService
          .createVersion(this.translationId, this.text)
          .pipe(
            finalize(() => this.progressInAction.next(false))
          )
          .subscribe(
            () => this.router
              .navigate(
                ['article/' + this.articleId],
                {queryParams: {langId: this.translationLanguage.id}}
              )
              .then(() => NavigationUtils.scrollToTop()),
            error => this.notificationService.showError(error)
          );
        break;
      case ActionType.EDIT_VERSION:
        this.articleService
          .editVersion(this.versionId, this.text)
          .pipe(
            finalize(() => this.progressInAction.next(false))
          )
          .subscribe(
            () => this.router
              .navigate(
                ['article/' + this.articleId],
                {queryParams: {langId: this.translationLanguage.id}}
              )
              .then(() => NavigationUtils.scrollToTop()),
            error => this.notificationService.showError(error)
          );
        break;
    }
  }

  onImageLoadError(event) {
    event.target.src = './assets/baseline-image-24px.svg';
  }

  onUseExistingImageClicked(checked: boolean) {
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

  getArticleLanguages(): Language[] {
    if (this.isEditArticleMode) {
      return this.getLanguagesFromArticleTranslations();
    } else {
      return this.languagesListFromApi;
    }
  }

  getTranslationLanguages(): Language[] {
    const articleTranslationsLanguages = this.getLanguagesFromArticleTranslations();
    const allExceptOfAlreadyUsedInArticle = this.languagesListFromApi
      .filter(language => !articleTranslationsLanguages.find(value => value.id === language.id));

    if (this.isAddTranslationMode) {
      // all except of already used in article
      return allExceptOfAlreadyUsedInArticle;
    } else if (this.isEditTranslationMode) {
      // all of already used in article and current one
      allExceptOfAlreadyUsedInArticle.push(GpLanguageService.getLanguageById(this.languagesListFromApi, this.translation.langId));
      return allExceptOfAlreadyUsedInArticle;
    } else {
      return this.languagesListFromApi;
    }
  }

  add(event: MatChipInputEvent): void {
    // Add only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        const selectedTag = this.tagsFromApi.find(tag => tag.title.toLowerCase() === value.trim().toLowerCase());
        if (selectedTag) {
          this.selectedTags.push(selectedTag);
        } else {
          if (!this.selectedTags.find(tag => tag.title.toLowerCase() === value.trim().toLowerCase())) {
            const newTag = new Tag();
            newTag.title = value.trim().toLowerCase();
            this.selectedTags.push(newTag);
          }
        }
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.tagsCtrl.setValue(null);
    }
  }

  remove(tag: Tag): void {
    const index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);

      const tags = this.tagsFromApi.filter(value => !this.selectedTags.includes(value));
      this.filteredTags.next(tags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedTag = this.tagsFromApi.find(value => value.title === event.option.viewValue);
    if (!this.selectedTags.find(tag => tag.title.toLowerCase() === selectedTag.title.toLowerCase())) {
      this.selectedTags.push(selectedTag);
    }
    this.tagsInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
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
    if (this.actionType !== ActionType.CREATE_ARTICLE) {
      this.articleIsFromAnotherSite = this.article.sourceUrl != null;

      this.articleLanguage = GpLanguageService.getLanguageById(this.languagesListFromApi, this.article.originalLangId);

      this.selectedTags = this.article.tags;

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

    this.tagsCtrl = new FormControl(
      {
        value: this.selectedTags,
        disabled: this.isEditTranslationMode || this.isAddTranslationMode || this.isAddVersionMode || this.isEditVersionMode
      },
      []
    );

    this.tagsCtrl
      .valueChanges
      .pipe(
        map((tag: Tag | null) => tag ? this._filter(tag) : this.tagsFromApi.filter(value => !this.selectedTags.includes(value))),
        tap(value => this.filteredTags.next(value))
      )
      .subscribe();

    this.filteredTags = new BehaviorSubject<Tag[]>(this.tagsFromApi);

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
      tagsCtrl: this.tagsCtrl,
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
  }

  private getImageFileNameFromUrl() {
    return this.articleImageUrl != null
      ? this.articleImageUrl.substring(this.articleImageUrl.lastIndexOf('/') + 1, this.articleImageUrl.lastIndexOf('.'))
      : null;
  }

  private loadInitialData() {
    this.dataIsLoading.next(true);

    zip<[GpUser, Language[], Tag[], Article | null]>(
      this.userProvider.getNonNullUser(),
      this.languageService.getLanguages(),
      this.tagService.getTags(),
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
                // todo translation todo seems to be we already has it. Check messages.xlf
                this.actionTitle = 'Edit article';
                break;
              case ActionType.ADD_TRANSLATION:
                // todo translation todo seems to be we already has it. Check messages.xlf
                this.actionTitle = 'Add translation';
                break;
              case ActionType.EDIT_TRANSLATION:
                // todo translation todo seems to be we already has it. Check messages.xlf
                this.actionTitle = 'Edit translation';
                break;
              case ActionType.ADD_VERSION:
                // todo translation todo seems to be we already has it. Check messages.xlf
                this.actionTitle = 'Add version';
                break;
              case ActionType.EDIT_VERSION:
                // todo translation todo seems to be we already has it. Check messages.xlf
                this.actionTitle = 'Edit version';
                break;
            }
            this.submitTitle = this.actionTitle;
            this.articleId = Number(articleId);
            this.translationId = translationId != null ? Number(translationId) : null;
            this.versionId = versionId != null ? Number(versionId) : null;
            return this.articleService.getFullArticleById(this.articleId);
          })
        )
    )
      .pipe(
        tap((data: [GpUser, [Language], Tag[], Article | null]) => {
          this.user = data[0];
          this.languagesListFromApi = data[1];
          this.preferredLanguage = GpLanguageService.getLanguageById(this.languagesListFromApi, this.user.primaryLanguageId);
          this.tagsFromApi = data[2];
          this.article = data[3];
        }),
        finalize(() => this.dataIsLoading.next(false))
      )
      .subscribe(
        () => this.initForm(),
        error => this.notificationService.showError(error)
      );
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

  private getLanguagesFromArticleTranslations() {
    return this.article.translations.map(translation => this.languagesListFromApi
      .find(language => language.id === translation.langId)
    );
  }

  private _filter(value: Tag | string): Tag[] {
    if (value instanceof Tag) {
      const filterValue = value.title.toLowerCase();
      return this.tagsFromApi
        .filter(tag => tag.title.toLowerCase().indexOf(filterValue) === 0)
        .filter(tag => !this.selectedTags.includes(tag));
    } else if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.tagsFromApi
        .filter(tag => tag.title.toLowerCase().indexOf(filterValue) === 0)
        .filter(tag => !this.selectedTags.includes(tag));
    }
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
