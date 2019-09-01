export enum SocialProvider {
  GITHUB = 'GITHUB',
  VK = 'VK',
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE'
}

export class GpConstants {
  static PASSWORD_MIN_LENGTH = 6;
  static PASSWORD_MAX_LENGTH = 20;
}

// export const URL_PATTERN = '^(http[s]?:\\\\/\\\\/){0,1}(www\\\\.){0,1}[a-zA-Z0-9\\\\.\\\\-]+\\\\.[a-zA-Z]{2,5}[\\\\.]{0,1}$';
export const URL_PATTERN = '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$';
