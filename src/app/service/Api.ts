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
      static DELETE = 'delete';
      static UPDATE = 'update';
    };
  };

  static SocialAuthEndpoint = class {
    static URL = 'oauth2/authorize/';

    // noinspection JSUnusedGlobalSymbols
    /**
     * use [SocialProvider] values in lower case
     */
    static Method = class {
    };
  };

  static EmailAuthEndpoint = class {
    static URL = 'auth/';

    static Method = class {
      static REGISTER = 'register';
    };
  };

  static LanguageEndpoint = class {
    static URL = 'language/';

    static Method = class {
      static ALL = 'all';
    };
  };

  static ArticleEndpoint = class {
    static URL = 'article/';

    static Method = class {
      static FULL = 'full/';
      static ALL_BY_AUTHOR_ID = 'allByAuthorId';
      static ALL = 'all';
      static CREATE = 'create';
      static APPROVE = 'approve';
      static PUBLISH = 'publish';
      static DELETE = 'delete';
    };
  };

  static ArticleTranslationEndpoint = class {
    static URL = 'article/translation/';

    static Method = class {
      static CREATE = 'create';
      static APPROVE = 'approve';
      static PUBLISH = 'publish';
    };
  };

  static ArticleTranslationVersionEndpoint = class {
    static URL = 'article/translation/version/';

    static Method = class {
      static CREATE = 'create';
      static EDIT = 'edit';
      static APPROVE = 'approve';
      static PUBLISH = 'publish';
    };
  };

  static ImageEndpoint = class {
    static URL = 'image/';

    static Method = class {
      static ADD = 'add';
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
