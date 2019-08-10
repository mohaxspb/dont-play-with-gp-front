import {environment} from '../../environments/environment';

export class Api {

  private static TOMCAT_PORT = '8080';
  private static TOMCAT_SECURE_PORT = '8443';

  private static SECURE_SCHEME = 'https:';

  public static readonly URL = window.location.protocol
    + '//' + window.location.hostname + ':' + Api.currentPort()
    + environment.apiPath + '/';

  static Method = class {
    static LOGOUT = 'logout';
    static LOGIN = 'login';
  };

  static TARGET_URL_PARAMETER = 'targetUrlParameter';

  static UsersEndpoint = class {
    static URL = 'users/';

    static Method = class {
      static ME = 'me';
    };
  };

  static SocialAuthEndpoint = class {
    static URL = 'oauth2/authorize/';

    /**
     * use [SocialProvider] values in lower case
     */
    static Method = class {
    };
  };

  private static currentPort(): string {
    let port = this.TOMCAT_PORT;
    if (window.location.protocol === this.SECURE_SCHEME) {
      port = this.TOMCAT_SECURE_PORT;
    }
    return port;
  }
}
