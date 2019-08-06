'use strict';

const log = require("./log");
const path = require('path');

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const extensionContentTypeDictionary = {
  'css': 'text/css',
  'gif': 'image/gif',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpg',
  'jpg': 'image/jpg',
  'js': 'application/x-javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain',
  'xml': 'application/xml'
};

const getFileExtension = (fileName) => {
  const extname = path.extname(fileName);
  const endOfExt = extname.search(/[#\\?]/g);
  return endOfExt > -1 ?
    extname.substring(1, endOfExt) :
    extname.substring(1);
};

const getContentType = (ext) => {
  return extensionContentTypeDictionary[ext] || DEFAULT_CONTENT_TYPE;
};

const printEnvVars = () => {
  const keys = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN"]
  keys.forEach(key => {
    log.debug(`${key} = ${process.env[key]}`)
  });
}

const trailingSlash = str => str[str.length - 1] === "/" ? str : str + "/";
const noSlash = str => str.length === 1 ? str : str.replace(/\/+$/, "");

const printHelp = () => {
  log.info("Syncs local folder to S3 bucket.");
  log.warn("Authentication uses environment variables. See table below.");
  log.info("");
  log.info("Usage: ./s3-directory-sync.js --bucket [BUCKET_NAME] --localDir [DIRECTORY_TO_UPLOAD] --remotePath [PATH_IN_BUCKET]");
  log.info("Arguments:")
  const Table = require("cli-table");
  const argTable = new Table({
      head: ["Argument", "Alias(es)", "Description", "Optional"],
      style: { head: ["cyan"] }
  })
  argTable.push(
      ["--bucket", "-b", "S3 bucket to upload to", "No"],
      ["--localDir", "-d, --dir", "Local directory to upload to S3", "No"],
      ["--remotePath", "-p, --path", "Path inside bucket to upload to", "Yes"],
      ["--delete", "-D, --del", "Remove files from S3 that aren't in local folder", "Yes"],
      ["--environment", "-e, --env", "Specify what .env file to use", "Yes"],
      ["--envPath", "", "Path to location of .env file(s)", "Yes"],
      ["--verbose", "v", "Print additional logging for diagnostics", "Yes"],
      ["--help", "-h, -?", "Print this message", ""]
  );
  log.info(argTable.toString());
  log.info("");
  log.info("Environment variables:")
  const envTable = new Table({
      head: ["Variable", "Optional"],
      style: { head: ["cyan"] }
  });
  envTable.push(
      ["AWS_ACCESS_KEY_ID", "No"],
      ["AWS_SECRET_ACCESS_KEY", "No"],
      ["AWS_SESSION_TOKEN", "Yes"]
  );
  log.info(envTable.toString())
}

module.exports = {
  getFileExtension,
  getContentType,
  noSlash,
  printEnvVars,
  printHelp,
  trailingSlash
};