import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {GpLocalStorageService} from '../service/GpLocalStorageService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dont-play-with-gp-web';

  constructor(
    private router: Router,
    private localStorageService: GpLocalStorageService
  ) {
  }

  ngOnInit() {
    // console.log('localStorageService.getTargetUrl(): %s', this.localStorageService.getTargetUrl());
    if (this.localStorageService.getTargetUrl() != null) {
      this.router.navigateByUrl(this.localStorageService.getTargetUrl())
        .then(() => this.localStorageService.removeTargetUrl());
    }
  }
}
