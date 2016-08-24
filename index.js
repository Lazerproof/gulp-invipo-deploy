'use strict';

var Vfs = require('vinyl-fs');
var Vftp = require('vinyl-ftp');
var Gutil = require('gulp-util');

var Promise = require('es6-promise').Promise;

module.exports = function (options) {

    options = options || {};

    return new Promise(
        function (resolve) {
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
                resolve(conn);
            } catch (err) {
                Gutil.log(Gutil.colors.red('Cannot establish FTP(S) connection. (ERR: ' + err + ')'));
            }
        }
    ).then(function (conn) {
        return new Promise(function (resolve) {
            Vfs.src(options.globs, {buffer: false, cwd: options.src})
                .pipe(conn.newer(options.dest))
                .pipe(conn.dest(options.dest))
                .on('error', function (err) {
                    console.error(err)
                })
                .on('finish', function () {
                    resolve(conn);
                });
        })
    }).then(function (conn) {
        return new Promise(function (resolve) {
            if (options.rmdir) {
                options.rmdir.forEach(function (dir) {
                    conn.rmdir(dir, function (err) {
                        if (err) Gutil.log(Gutil.colors.red('Cannot clean ' + dir + ' directory. (ERR: ' + err + ')'));
                    });
                });
            }
            resolve(conn);
        });
    }).then(function (conn) {
        return new Promise(function (resolve) {
            if (options.clean) {
                try {
                    conn.clean('**/*', options.src, {base: options.dest});
                } catch (err) {
                    Gutil.log(Gutil.colors.red('Cannot clean/sync FTP folders. (ERR: ' + err + ')'));
                }
            }
            resolve(conn);
        });
    });
};
