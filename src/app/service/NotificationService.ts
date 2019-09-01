import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {ApiError} from '../model/ApiError';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {
  }

  showMessage(message: string) {
    this.snackBar.open(message);
  }

  showError(error: Error) {
    if (error instanceof HttpErrorResponse) {
      console.log('message: %s/%s', error.message, JSON.stringify(error.error));
      try {
        const parsedServerError: ApiError = error.error;
        this.showMessage(parsedServerError.message);
      } catch (e) {
        console.error(e);
        this.showMessage('Unexpected error occurred.');
      }
    } else {
      console.log('error is instance of: %s', error.constructor.name);
      this.showMessage('Unexpected error occurred.');
    }
  }
}
