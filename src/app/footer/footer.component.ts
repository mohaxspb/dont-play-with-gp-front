import {Component, OnInit} from '@angular/core';
import {version} from 'package.json';
import {MatBottomSheet} from '@angular/material';
import {CookiesBottomSheetComponent} from '../cookies-bottom-sheet/cookies-bottom-sheet.component';
import {GpLocalStorageService} from '../service/GpLocalStorageService';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  appVersion: string;

  constructor(
    private localStorageService: GpLocalStorageService,
    private bottomSheet: MatBottomSheet
  ) {
    this.appVersion = version;
  }

  ngOnInit() {
    if (!this.localStorageService.isCookiesAccepted()) {
      this.openCookiesInfo();
    }
  }

  openCookiesInfo() {
    this.bottomSheet.open(CookiesBottomSheetComponent);
  }
}
