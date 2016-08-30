"use strict";

var Vfs = require("vinyl-fs");
var Vftp = require("vinyl-ftp");
var Gutil = require("gulp-util");
var Promise = require("es6-promise").Promise;

module.exports = function (options) {

    options = options || {};

    var connection = function () {
        try {
            return new Vftp({
                host: options.conn.host,
                user: options.conn.user,
                pass: options.conn.password,
                port: options.conn.secure ? options.conn.port.ftps : options.conn.port.ftp,
                secure: (options.conn.secure ? true : false),
                secureOptions: {"rejectUnauthorized": false},
                log: Gutil.log
            });
        } catch (err) {
            Gutil.log(Gutil.colors.red("Cannot establish FTP(S) connection. (ERR: " + err + ")"));
            return false;
        }
    }

    new Promise(function (resolve) {
        if ((options.rmdir) && (options.rmdir.length)) {
            Gutil.log(Gutil.colors.green("Starting remove dirs."));
            var conn = connection();
            for (var key in options.rmdir) {
                conn.rmdir(options.rmdir[key], function (err) {
                    if (err) {
                        Gutil.log(Gutil.colors.red("Cannot clean " + options.rmdir[key] + " directory. (ERR: " + err + ")"));
                    }
                    Gutil.log(Gutil.colors.green("Finished remove dirs."));
                    resolve(conn);
                });
            }
        } else {
            resolve(conn);
        }
    }).then(function (conn) {
        return new Promise(function (resolve) {
            Gutil.log(Gutil.colors.green("Starting upload."));
            var conn = connection();
            Vfs.src(options.globs, {buffer: false, cwd: options.src})
                .pipe(conn.newer(options.dest))
                .pipe(conn.dest(options.dest))
                .on("error", function (err) {
                    Gutil.log(Gutil.colors.red(err));
                })
                .on("finish", function () {
                    Gutil.log(Gutil.colors.green("Finished upload."));
                    resolve(conn);
                });
        }).then(function (conn) {
            if (options.clean) {
                Gutil.log(Gutil.colors.green("Starting clean."));
                conn = connection();
                conn.clean("/**/*", options.src, {cwd: options.src, base: options.dest})
                    .on("finish", function () {
                        Gutil.log(Gutil.colors.green("Finished clean."));
                    });
            }
        })
    })
};


