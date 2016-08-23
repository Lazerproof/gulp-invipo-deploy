'use strict';

var Vfs = require('vinyl-fs');
var Vftp = require('vinyl-ftp');
var Gutil = require('gulp-util');

module.exports = function (options) {

    options = options || {};

    try {
        var conn = new Vftp({
            host: options.conn.host,
            user: options.conn.user,
            pass: options.conn.password,
            port: options.conn.secure ? options.conn.port.ftps : options.conn.port.ftp,
            secure: (options.conn.secure ? true : false),
            secureOptions: {'rejectUnauthorized': false},
            log: Gutil.log
        });
    } catch (err) {
        Gutil.log(Gutil.colors.red('Cannot establish FTP(S) connection. (ERR: ' + err + ')'));
    }

    Vfs.src(options.src, {buffer: false, cwd: options.dist})
        .pipe(conn.newer('/'))
        .pipe(conn.dest('/'))
        .on('error', function (err) {
            console.error(err)
        });

    if (options.rmdir) {
        options.rmdir.forEach(function(dir) {
            conn.rmdir(dir, function (err) {
                if (err) Gutil.log(Gutil.colors.red('Cannot clean ' + dir + ' directory. (ERR: ' + err + ')'));
            });
        });
    }

    if (options.clean) {
        try {
            conn.clean('**/*', options.dist, {base: '/'});
        } catch (err) {
            Gutil.log(Gutil.colors.red('Cannot clean/sync FTP folders. (ERR: ' + err + ')'));
        }
    }

    return true;

};
