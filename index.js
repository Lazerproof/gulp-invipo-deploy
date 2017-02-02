'use strict';

let Vfs = require('vinyl-fs');
let Vftp = require('vinyl-ftp');
let Gutil = require('gulp-util');


module.exports = (options = {}) => {

    let connection = () => {
        try {
            return new Vftp({
                host: options.conn.host,
                user: options.conn.user,
                pass: options.conn.password,
                port: options.conn.secure ? options.conn.port.ftps : options.conn.port.ftp,
                secure: options.conn.secure,
                secureOptions: {"rejectUnauthorized": false},
                log: Gutil.log
            });
        } catch (err) {
            Gutil.log(Gutil.colors.red("Cannot establish FTP(S) connection. (ERR: " + err + ")"));
        }
    };

    new Promise((resolve) => {
        if ((options.rmdir) && (options.rmdir.length)) {

            /** @type {object} */
            let conn = connection();

            if (conn) {
                /** @type {Array} */
                let promises = [];

                Gutil.log(Gutil.colors.green("Starting remove dirs."));

                for (let dir of options.rmdir) {
                    promises.push(
                        conn.rmdir(dir, function (err) {
                            if (err) {
                                Gutil.log(Gutil.colors.red("Cannot clean " + dir + " directory. (ERR: " + err + ")"));
                            }
                            resolve();
                        })
                    )
                }

                Promise.all(promises)
                    .then(() => {
                        Gutil.log(Gutil.colors.green("Remove dirs finished."));
                    });
            }
        } else {
            resolve();
        }
    }).then(function () {
        return new Promise(function (resolve) {

            /** @type {object} */
            let conn = connection();

            Gutil.log(Gutil.colors.green("Starting upload."));

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

                /** @type {object} */
                let conn = connection();

                Gutil.log(Gutil.colors.green("Starting clean."));

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


