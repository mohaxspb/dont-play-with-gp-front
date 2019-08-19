import {Component, OnInit} from '@angular/core';
import {AuthService} from '../service/auth/auth.service';
import {GpConstants, SocialProvider} from '../GpConstants';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {User} from '../model/user';
import {MatBottomSheetRef, MatSnackBar} from '@angular/material';
import {GpLanguageService} from '../service/GpLanguageService';
import {BehaviorSubject} from 'rxjs';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // @ViewChild('loginRegisterForm', {static: false})
  // loginRegisterForm: NgForm;

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
  primaryLanguage: string;

  // error validation
  passwordMinLength = GpConstants.PASSWORD_MIN_LENGTH;
  passwordMaxLength = GpConstants.PASSWORD_MAX_LENGTH;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<LoginComponent>,
    private authService: AuthService,
    private languageService: GpLanguageService,
    private fBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
  }

  private initForm() {
    this.loginRegisterFormGroup = this.fBuilder.group({
      name: new FormControl({value: undefined, disabled: true}, [Validators.required]),
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
        [
          Validators.required
        ]
      )
    });
  }

  ngOnInit() {
    this.updateLanguages();

    this.initForm();
  }

  onGitHubLoginClicked() {
    AuthService.socialLogin(SocialProvider.GITHUB);
  }

  onVkLoginClicked() {
    AuthService.socialLogin(SocialProvider.VK);
  }

  onFacebookLoginClicked() {
    AuthService.socialLogin(SocialProvider.FACEBOOK);
  }

  onGoogleLoginClicked() {
    AuthService.socialLogin(SocialProvider.GOOGLE);
  }

  onLoginOrRegisterClicked() {
    console.log('onLoginOrRegisterClicked: ' + this.createNewAccountFormTypeEnabled);

    if (this.createNewAccountFormTypeEnabled) {
      this.authService
        .register(
          this.email,
          this.password,
          this.name,
          this.primaryLanguage
        )
        .subscribe((value: User) => {
          console.log('register: ' + value);
          this.bottomSheetRef.dismiss();
        });
    } else {
      this.authService
        .login(this.email, this.password)
        .subscribe((value: User) => {
          console.log('login: ' + value);
          this.bottomSheetRef.dismiss();
        });
    }
  }

  onFormTypeClicked() {
    console.log('onFormTypeClicked');
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
    console.log('onNameChanged: ' + name);
    this.name = name;
  }

  onEmailChanged(email: string) {
    console.log('onEmailChanged: ' + email);
    this.email = email;
  }

  onPasswordChanged(password: string) {
    console.log('onPasswordChanged: ' + password);
    this.password = password;
  }

  onPasswordConfirmChanged(passwordConfirm: string) {
    console.log('onPasswordConfirmChanged: ' + passwordConfirm);
    this.passwordConfirm = passwordConfirm;
  }

  onLanguagesRefreshClicked() {
    this.updateLanguages();
  }

  private updateLanguages() {
    this.languagesAreLoading.next(true);
    this.languagesListFromApi = this.languageService
      .getLanguages()
      .pipe(
        finalize(() => this.languagesAreLoading.next(false))
      );
  }

  private showError(error: any, errorMessage?: string | null) {
    console.error(error);
    this.snackBar.open(errorMessage == null ? error : errorMessage);
  }
}
