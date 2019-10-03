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

## Staging build
Use `--aot=false --build-optimizer=false`, as there is some f*cking bug with empty error message(

Also try to add `--optimization=false`, as it builds, but crashes after deploy(

```
ng build --configuration=production --base-href /dont-play-with-google/ --deploy-url /dont-play-with-google/ --aot=false --build-optimizer=false
```

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

For strings in *.ts files use [i18n-polyfill](https://github.com/ngx-translate/i18n-polyfill)

After extracting all strings from template run 

`ngx-extractor -i src/**/*.ts -f xlf -o src/locale/messages.xlf`

---

You can create EN translation from source via FindAndReplace so

find: `<source>(.*?)<\/source>`
replace: 
```
<source>$1<\/source>
        <target>$1<\/target>
```

## Deployment

Build all languages versions:

`npm run build-i18n-prod`

Then just copy files from `PROJECT_ROOT/dist/` to `var/www/html` if using `apache2` server.

Add add rules to redirect user to correct language in `etc/apache2/apache2.conf`:

```
<VirtualHost *:80>
    DocumentRoot "/var/www/html"
    ServerName domain.zone
		ServerAlias domain.zone
		
  <Directory "/var/www/html">
    RewriteEngine on
    RewriteBase /
    RewriteRule ^../index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule (..) $1/index.html [L]
    RewriteCond %{HTTP:Accept-Language} ^fr [NC]
    RewriteRule ^$ /fr/ [R]
    RewriteCond %{HTTP:Accept-Language} ^ru [NC]
    RewriteRule ^$ /ru/ [R]
    RewriteCond %{HTTP:Accept-Language} !^ru [NC]
    RewriteCond %{HTTP:Accept-Language} !^fr [NC]
    RewriteRule ^$ /en/ [R]
  </Directory>
</VirtualHost>
```

## Markdown editor lib

See [Angular-Markdown-Editor](https://github.com/ghiscoding/angular-markdown-editor)

And [ngx-markdown](https://github.com/jfcere/ngx-markdown)

## Material file input lib

See [material-file-input](https://github.com/merlosy/ngx-material-file-input)
