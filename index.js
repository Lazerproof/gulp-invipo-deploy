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
    };

    new Promise(function (resolve) {
        if ((options.rmdir) && (options.rmdir.length)) {
            Gutil.log(Gutil.colors.green("Starting remove dirs."));
            var conn = connection();
            options.rmdir.forEach(function (value, index) {
                conn.rmdir(value, function (err) {
                    if (err) {
                        Gutil.log(Gutil.colors.red("Cannot clean " + value + " directory. (ERR: " + err + ")"));
                    }
                    Gutil.log(Gutil.colors.green("Finished remove dirs."));
                    resolve();
                });
            });
        } else {
            resolve();
        }
    }).then(function () {
        return new Promise(function (resolve) {
            Gutil.log(Gutil.colors.green("Starting upload."));
            var conn = connection();
            console.log(Vfs.src(options.globs));
            Vfs.src(options.globs, {buffer: false, cwd: options.src})
                .pipe(conn.newer(options.dest))
                .pipe(conn.dest(options.dest))
                .on("error", function (err) {
                    Gutil.log(Gutil.colors.red(err));
                })
                .on("finish", function () {
                    Gutil.log(Gutil.colors.green("Finished upload."));
                    resolve();
                });
        }).then(function () {
            if (options.clean) {
                Gutil.log(Gutil.colors.green("Starting clean."));
                var conn = connection();
                conn.clean("/**/*", options.src, {cwd: options.src, base: options.dest})
                    .on("finish", function () {
                        Gutil.log(Gutil.colors.green("Finished clean."));
                    })
                    .on("error", function (err) {
                        Gutil.log(Gutil.colors.red(err));
                    });

            }
        })
    })
};


