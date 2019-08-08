import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../service/auth/auth.service';
import {Language, SocialProvider} from '../GpConstants';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';

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

  createNewAccountFormTypeEnabled = false;

  languages = Object.keys(Language);
  languagesEnum = Language;

  primaryLanguage: string;

  constructor(
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
    this.authService.socialLogin(SocialProvider.GITHUB);
  }

  onVkLoginClicked() {
    this.authService.socialLogin(SocialProvider.VK);
  }

  onFacebookLoginClicked() {
    this.authService.socialLogin(SocialProvider.FACEBOOK);
  }

  onGoogleLoginClicked() {
    this.authService.socialLogin(SocialProvider.GOOGLE);
  }

  loginOrRegister() {
    console.log('loginOrRegister: ' + this.createNewAccountFormTypeEnabled);
  }

  get hasDropDownRequiredError() {
    const selectFormControl = this.loginRegisterFormGroup.get('primaryLanguageSelect');
    return (
      selectFormControl.touched &&
      selectFormControl.errors &&
      selectFormControl.errors.required
    );
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
  }

  onEmailChanged(email: string) {
    console.log('onEmailChanged: ' + email);
  }

  onPasswordChanged(password: string) {
    console.log('onPasswordChanged: ' + password);

  }

  onPasswordConfirmChanged(passwordConfirm: string) {
    console.log('onPasswordConfirmChanged: ' + passwordConfirm);

  }
}
