#!/usr/bin/env node
'use strict';

const log = require("../lib/log");

(async function() {
    try {
        const fs = require("fs");
        const path = require("path");
        const expand = require("dotenv-expand");
        const dotenv = require("dotenv");
        const parseArgs = require("minimist");

        const s3DirectorySync = require("../");

        const argv = parseArgs(process.argv, {
            string: ["environment", "envPath", "bucket", "localDir", "remotePath"],
            boolean: ["delete", "verbose", "help"],
            alias: {
                environment: ["e", "env"],
                bucket: ["b"],
                localDir: ["d", "dir"],
                remotePath: ["p", "path"],
                delete: ["D", "del"],
                verbose: ["v"],
                help: ["h", "?"]
            },
            default: {
                environment: "",
                delete: false,
                remotePath: "/",
                verbose: false
            }
        })

        if (argv.help) {
            require("../lib/utils").printHelp();
            process.exit(0);
        }

        if (!argv.bucket)
            throw "Please specify bucket name with --bucket (or -b)";
        if (!argv.localDir)
            throw "Please specify which local directory to upload with --localDir (or -d or --dir)";

        global.s3DirectorySyncVerbose = argv.verbose;

        const environment = argv.environment ? argv.environment : (process.env.NODE_ENV ? process.env.NODE_ENV : "");
        const envPath = path.resolve(fs.realpathSync(process.cwd()), argv.envPath ? argv.envPath : "");
        const dotenvFiles = [environment ? `${envPath}/${environment}.env` : `${envPath}/.env`];

        dotenvFiles.forEach(dotenvFile => {
            if (fs.existsSync(dotenvFile)) {
                expand(dotenv.config({path: dotenvFile, debug: true}));
            }
        });

        if (s3DirectorySyncVerbose) {
            require("../lib/utils").printEnvVars();
        }

        log.info(`Syncing ${argv.localDir} to ${argv.remotePath} in bucket ${argv.bucket}.`)
        const logDelete = argv.delete ? log.warn : log.info;
        logDelete(`Files in bucket but not in local directory will${!argv.delete ? " NOT" : ""} be deleted.`);
        await s3DirectorySync(argv.bucket, argv.localDir, argv.remotePath, argv.delete);
    } catch (err) {
        log.error(err);
    }
})();