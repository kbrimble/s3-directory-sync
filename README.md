# s3-directory-sync

Simple syncing of local directories to AWS S3 buckets. Heavily inspired by [s3-directory-uploader](https://github.com/10chars/s3-directory-uploader)

## Installation

For local install:
`npm install --save s3-directory-sync`

For global install:
`npm install -g s3-directory-sync`

## Usage

Local usage:

`./node_modules/s3-directory-sync/bin/s3-directory-sync.js -b <bucket_name> -d <local_directory> [...opts]`

Global usage:

`s3-directory-sync -b <bucket_name> -d <local_directory> [...opts]`

## Options

| Switch        | Alias(es) | Description                                               | Optional |
|---------------|-----------|-----------------------------------------------------------|----------|
| --bucket      | -b        | S3 bucket name                                            | No       |
| --localDir    | -d --dir  | Local directory to upload                                 | No       |
| --remotePath  | -p --path | Path inside bucket to upload to                           | Yes      |
| --delete      | -D --del  | Remove files from bucket not present in local folder      | Yes      |
| --environment | -e --env  | Env file to look for. E.g. `-e prod` looks for `prod.env` | Yes      |
| --envPath     |           | Path to look for .env files                               | Yes      |
| --verbose     | -v        | Print extra diagnostic information                        | Yes      |
| --help        | -h        | Print help and usage information. Don't do anything else  | Yes      |

## Authentication

Authentication is done via the standard AWS environment variables: `AWS_ACCESS_KEY`, `AWS_SECRET_KEY` and optionally, `AWS_SESSION_TOKEN`.

When running via the command line, [dotenv](https://github.com/motdotla/dotenv) is used to load environment variables from a .env file if they are not already present in the environment.

When imported as a library, it is assumed that the correct values have already been set either in the environment directly or by some other means (hello again, dotenv).

## Examples

All examples will use the global install form for brevity.

1. Upload local directory to the root of a bucket:  
`./s3-directory-sync --bucket my-bucket --localDir ~/documents/some-files`
1. Upload local directory to path `/subdir1/subdir2` in a bucket:  
`./s3-directory-sync --bucket my-bucket --localDir ~/documents/some-files --remotePath subdir1/subdir2`
1. Upload local directory to root of bucket and delete all files in the bucket that aren't in the local directory:  
`./s3-directory-sync --bucket my-bucket --localDir ~/documents/some-files --delete`