import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from '../service/auth/auth.service';
import {GpConstants, SocialProvider} from '../GpConstants';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {BehaviorSubject} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {Language} from '../model/data/Language';
import {BottomSheetData} from '../model/ui/BottomSheetData';
import {NotificationService} from '../service/ui/NotificationService';
import {GpLocalStorageService} from '../service/GpLocalStorageService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginRegisterFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  /**
   * true, if form is in register mode.
   * false, if form is in login mode.
   */
  createNewAccountFormTypeEnabled = false;

  languagesListFromApi = this.languageService.getLanguages();
  languagesAreLoading = new BehaviorSubject<boolean>(false);

  // login fields
  name: string;
  email: string;
  password: string;
  // register fields
  passwordConfirm: string;

  primaryLanguage: Language;

  // error validation
  passwordMinLength = GpConstants.PASSWORD_MIN_LENGTH;
  passwordMaxLength = GpConstants.PASSWORD_MAX_LENGTH;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<LoginComponent>,
    private localStorageService: GpLocalStorageService,
    private authService: AuthService,
    private languageService: GpLanguageService,
    private fBuilder: FormBuilder,
    private notificationService: NotificationService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public inputData?: BottomSheetData | null
  ) {
  }

  ngOnInit() {
    this.updateLanguages();

    this.initForm();
  }

  onGitHubLoginClicked() {
    this.saveTargetUrl();
    AuthService.socialLogin(SocialProvider.GITHUB);
  }

  onVkLoginClicked() {
    this.saveTargetUrl();
    AuthService.socialLogin(SocialProvider.VK);
  }

  onFacebookLoginClicked() {
    this.saveTargetUrl();
    AuthService.socialLogin(SocialProvider.FACEBOOK);
  }

  onGoogleLoginClicked() {
    this.saveTargetUrl();
    AuthService.socialLogin(SocialProvider.GOOGLE);
  }

  onLoginOrRegisterClicked() {
    if (this.createNewAccountFormTypeEnabled) {
      // console.log('mail, name, password, lang: %s/%s/%s/%s', this.email, this.name, this.password, JSON.stringify(this.primaryLanguage));
      this.authService
        .register(
          this.email,
          this.password,
          this.name,
          this.primaryLanguage.langCode
        )
        .subscribe(
          () => this.bottomSheetRef.dismiss(),
          error => this.notificationService.showError(error)
        );
    } else {
      this.authService
        .login(this.email, this.password)
        .subscribe(
          () => this.bottomSheetRef.dismiss(),
          () => {
            // todo message localization
            this.notificationService.showMessage('Error. May be wrong email and/or password.');
          }
        );
    }
  }

  onFormTypeClicked() {
    this.createNewAccountFormTypeEnabled = !this.createNewAccountFormTypeEnabled;

    const passwordConfirmFormControl = this.loginRegisterFormGroup.controls.passwordConfirm;
    const nameFormControl = this.loginRegisterFormGroup.controls.name;
    const selectFormControl = this.loginRegisterFormGroup.controls.primaryLanguageSelect;
    if (this.createNewAccountFormTypeEnabled) {
      passwordConfirmFormControl.enable();
      selectFormControl.enable();
      nameFormControl.enable();
    } else {
      passwordConfirmFormControl.disable();
      selectFormControl.disable();
      nameFormControl.disable();
    }
  }

  onNameChanged(name: string) {
    this.name = name;
  }

  onEmailChanged(email: string) {
    this.email = email;
  }

  onPasswordChanged(password: string) {
    this.password = password;
  }

  onPasswordConfirmChanged(passwordConfirm: string) {
    this.passwordConfirm = passwordConfirm;
  }

  onLanguagesRefreshClicked() {
    this.updateLanguages();
  }

  private initForm() {
    this.loginRegisterFormGroup = this.fBuilder.group({
      name: new FormControl(
        {value: undefined, disabled: true},
        [Validators.required]
      ),
      email: new FormControl(
        {value: undefined, disabled: false},
        [Validators.required, Validators.email]
      ),
      password: new FormControl(
        {value: undefined, disabled: false},
        [
          Validators.required,
          Validators.minLength(this.passwordMinLength),
          Validators.maxLength(this.passwordMaxLength)
        ]
      ),
      passwordConfirm: new FormControl(
        {value: undefined, disabled: true},
        [
          Validators.required,
          Validators.minLength(this.passwordMinLength),
          Validators.maxLength(this.passwordMaxLength)
        ]
      ),
      primaryLanguageSelect: new FormControl(
        {value: undefined, disabled: true},
        [Validators.required]
      )
    });
  }

  private updateLanguages() {
    this.languagesAreLoading.next(true);
    this.languagesListFromApi = this.languageService
      .getLanguages()
      .pipe(
        finalize(() => this.languagesAreLoading.next(false))
      );
  }

  private saveTargetUrl() {
    if (window.location.hash.length > 1) {
      this.localStorageService.setTargetUrl(window.location.hash.substr(1));
    }
  }
}
