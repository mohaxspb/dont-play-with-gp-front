# DontPlayWithGpWeb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Creating components

In terminal execute
```
ng g component COMPONENT_TO_CREATE_NAME --skipTests=true
```
where `--skipTests=true` needed to prevent `spec` file generating

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Test on device in same network

Add `host` option to `scripts` in `serve` command in `angular.json`. Now site can be accessed by host IP

```$json
"serve": {
  ...,
  "options": {
    ...,
    "host": "0.0.0.0"
  },
  ...
},
```

## Internationalization

Run `ng xi18n --output-path src/locale` to generate file to translate

Then, copy it, rename to `messages.LOCALE_CODE_HERE_IE_ru.xlf` and translate, via adding `<target>TRANSLATION HERE</target>` just after `<source></source>` tag.

For details see documentation: https://angular.io/guide/i18n#the-app-and-its-translation-file
or this article: https://angular-templates.io/tutorials/about/angular-internationalization-i18n-multi-language-app
