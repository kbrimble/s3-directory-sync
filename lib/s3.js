const log = require("./log");
const aws = require("aws-sdk");
const fs = require("fs");
const { promisify } = require("util");
const utils = require("./utils");

const readFile = promisify(fs.readFile);
const s3 = new aws.S3();

const listItemsInBucket = async (bucketName, path, maxKeys = 0) => {
    let finished = false;
    let continuationToken = "";
    let objects = [];
    while (!finished) {
        params = getParamsForList(bucketName, path, continuationToken, maxKeys);

        try {
            let response = await s3.listObjectsV2(params).promise();
            objects.push(...response.Contents.map(obj => obj.Key));
            continuationToken = response.NextContinuationToken;
            finished = !continuationToken;
        } catch (err) {
            if (err.message)
                log.error(err.message)
            else
                log.error(err);
            finished = true;
            return [];
        }
    }
    return objects;
}

const uploadFile = (bucketName, localPath, remotePath, acl = "public-read") => {
    return async filePath => {
        let fileWithoutLocalPath = remotePath + filePath.slice(localPath.length, filePath.length);
        log.info(`Uploading ${fileWithoutLocalPath}...`);

        try {
            const data = await readFile(filePath);
            const fileExtension = utils.getFileExtension(filePath);
            const metaData = utils.getContentType(fileExtension);
            const params = {
                ACL: acl,
                ContentType: metaData,
                Body: data,
                Bucket: bucketName,
                Key: fileWithoutLocalPath
            };

            await s3.upload(params).promise();
            log.success(`Uploaded ${fileWithoutLocalPath}`);
        } catch (err) {
            if (err.message)
                log.error(err.message)
            else
                log.error(err);
            throw err;
        }
    }
};

const deleteFilesFromBucket = async (bucketName, remoteKeys) => {
    log.warn(`Deleting ${remoteKeys.length} objects from ${bucketName}`);
    var params = {
        Bucket: bucketName,
        Delete: {
            Objects: []
        }
    }
    params.Delete.Objects.push(...remoteKeys.map(key => Object.assign({}, { Key: key })));
    const result = await s3.deleteObjects(params).promise();
    if (result.Errors.length > 0) {
        const Table = require("cli-table");
        const table = new Table({
            head: ["File", "Error"],
            style: { head: ["red"] }
        });
        result.Errors.forEach(err => table.push([err.Key, err.Message]));
        throw table.toString();
    } else {
        log.success(`Deleted ${result.Deleted.length} keys from ${bucketName}.`);
    }
}

const getParamsForList = (bucketName, path, continuationToken, maxKeys = 0) => {
    let params = {
        Bucket: bucketName,
        Prefix: path
    }

    if (continuationToken) {
        params.ContinuationToken = continuationToken;
    }
    if (maxKeys) {
        params.MaxKeys = maxKeys;
    }
    return params;
}

module.exports = {
    deleteFilesFromBucket,
    listItemsInBucket,
    uploadFile
}