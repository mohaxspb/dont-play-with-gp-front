import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../service/auth/auth.service';
import {Language, SocialProvider} from '../GpConstants';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {User} from '../model/user';
import {MatBottomSheetRef} from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('loginRegisterForm', {static: false})
  loginRegisterForm: NgForm;

  loginRegisterFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  /**
   * true, if form is in register mode.
   * false, if form is in login mode.
   */
  createNewAccountFormTypeEnabled = false;

  languages = Object.keys(Language);
  languagesEnum = Language;

  // login fields
  name: string;
  email: string;
  password: string;
  // register fields
  passwordConfirm: string;
  primaryLanguage: string;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<LoginComponent>,
    private authService: AuthService,
    private fBuilder: FormBuilder
  ) {
    this.loginRegisterFormGroup = this.fBuilder.group({
      name: new FormControl({value: undefined, disabled: true}, [Validators.required]),
      email: new FormControl({value: undefined, disabled: false}, [Validators.required]), // todo add validators
      password: new FormControl({value: undefined, disabled: false}, [Validators.required]), // todo add validators
      passwordConfirm: new FormControl({value: undefined, disabled: true}, [Validators.required]), // todo add validators
      primaryLanguageSelect: new FormControl(
        {value: undefined, disabled: true},
        [
          Validators.required
        ]
      )
    });
  }

  ngOnInit() {
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
      // todo rx
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

    const passwordConfirmFormControl = this.loginRegisterFormGroup.get('passwordConfirm');
    const nameFormControl = this.loginRegisterFormGroup.get('name');
    const selectFormControl = this.loginRegisterFormGroup.get('primaryLanguageSelect');
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
}
