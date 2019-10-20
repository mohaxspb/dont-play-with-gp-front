import {Component, OnInit} from '@angular/core';
import {MatBottomSheetRef} from '@angular/material';
import {GpLocalStorageService} from '../service/GpLocalStorageService';

@Component({
  selector: 'app-cookies-bottom-sheet',
  templateUrl: './cookies-bottom-sheet.component.html',
  styleUrls: ['./cookies-bottom-sheet.component.css']
})
export class CookiesBottomSheetComponent implements OnInit {
  showManageCookies = false;

  constructor(
    private localstorageService: GpLocalStorageService,
    private bottomSheetRef: MatBottomSheetRef<CookiesBottomSheetComponent>
  ) {
  }

  ngOnInit() {
  }

  onCookiesAcceptClicked() {
    this.localstorageService.setCookiesAccepted();
    this.bottomSheetRef.dismiss();
  }

  onManageCookiesClicked() {
    this.showManageCookies = true;
  }
}
