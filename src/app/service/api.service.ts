import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';


@Injectable()
export class GpApiService {

  private static TOMCAT_PORT = '8080';
  private static TOMCAT_SECURE_PORT = '8443';

  private static SECURE_SCHEME = 'https:';

  public readonly API_URL: string;



  constructor(private http: HttpClient) {
    this.API_URL = window.location.protocol
      + '//' + window.location.hostname + ':' + GpApiService.currentPort()
      + environment.apiPath + '/';
  }

  public static currentPort(): string {
    let port = this.TOMCAT_PORT;
    if (window.location.protocol === GpApiService.SECURE_SCHEME) {
      port = GpApiService.TOMCAT_SECURE_PORT;
    }
    return port;
  }
}
