# gulp-invipo-deploy
> Deploy project by FTP/FTPS.

## Installation

Install package with NPM and add it to your development dependencies:

`npm install gulp-invipo-deploy --save-dev `

## Usage

```javascript
var gulp = require('gulp');
var invipoDeploy = require('gulp-invipo-deploy');

gulp.task('deploy:test', function () {
    return invipoDeploy({
        conn: require('./.ftp-config.json')["test"],
        src: './dist',
        dest: '/',
        globs: [
                 './**/*.*',
                 './**/.htaccess',
                 '!./**/log/*.log',
                 '!./**/log/*.html',
                 '!./**/temp/cache/**/*.*'
             ],
        clean: true,
        rmdir: ['temp/cache/']
    });
});
```
### .ftp-config.json example
```json
{
	"_comment": "USE 'secure: false' OPTION ONLY IF YOU KNOW WHAT ARE YOU DOING",
	"test": {
		"secure": true,
		"host": "YOUR_SERVER",
		"user": "YOUR_USERNAME",
		"password": "YOUR_PASSWORD",
		"port": {
			"ftps": 21,
			"ftp": 21
		}
	},
	"production": {
		"secure": true,
		"host": "YOUR_SERVER",
		"user": "YOUR_USERNAME",
		"password": "YOUR_PASSWORD",
		"port": {
			"ftps": 21,
			"ftp": 21
		}
	}
}
```

## Options

- `conn`

	Connections properties (see .ftp-config.json example).

- `src`

    Local folder. 

- `dest`

    Remote destination on FTP.

- `globs`
    
    Pattern for files to upload.

- `clean`

    Test if files from globs pattern are loccaly available and remove them if not.

- `rmdir`

    Directories for remove (after succesfully deploy). 
