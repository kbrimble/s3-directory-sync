const log = require("./log");
const fs = require("fs");
const path = require("path");
const async = require("async");
const s3 = require("./s3")
const utils = require("./utils");

const walkFiles = (directory) => {
    const files = fs.readdirSync(directory);
    const fileList = [];
    const resolvedDirectory = path.resolve(directory);
    files.forEach((file) => {
        try {
            const filePath = `${utils.noSlash(directory)}/${file}`;
            if (fs.statSync(filePath.toString()).isDirectory()) {
                fileList.push(...walkFiles(filePath));
            } else {
                fileList.push(filePath);
            }
        } catch (error) {
            const errorMsg = `Cannot read directory ${resolvedDirectory}/${file} or doesn't exist:`;
            log.error(errorMsg);
            log.error(error);
        }
    });
    return fileList;
};

const getFilesToDelete = (filesInBucket, filesInLocalDirectory, bucketPath, localDirectory) => {
    const localFilesRelativePaths = filesInLocalDirectory.map(localFile => localFile.slice(localDirectory.length));
    const filesToDelete = [];

    filesInBucket.forEach(bucketFile => {
        const bucketFileRelativePath = bucketFile.slice(bucketPath.length);
        if (!localFilesRelativePaths.includes(bucketFileRelativePath))
            filesToDelete.push(bucketFile);
    });
    return filesToDelete;
}

module.exports = async (bucketName, localDirectory, remotePath, deleteFilesInBucket = false) => {
    try {
        remotePath = utils.trailingSlash(utils.noSlash(remotePath));
        localDirectory = utils.trailingSlash(utils.noSlash(localDirectory));
        const filesInBucket = deleteFilesInBucket ? await s3.listItemsInBucket(bucketName, remotePath) : [];
        const filesInLocalDirectory = walkFiles(localDirectory)
        const filesToDelete = deleteFilesInBucket ? getFilesToDelete(filesInBucket, filesInLocalDirectory, remotePath, localDirectory) : [];
        
        if (filesInLocalDirectory.length > 0) {
            await async.eachSeries(filesInLocalDirectory, s3.uploadFile(bucketName, localDirectory, remotePath));
            log.success("All files uploaded successfully");
        } else {
            log.success("No files to upload");
        }

        if (filesToDelete.length) {
            log.info("Starting to delete bucket files not in local directory");
            await s3.deleteFilesFromBucket(bucketName, filesToDelete);
            log.success("Deletion complete.")
        }
    } catch (err) {
        log.error("The following error(s) occurred:");
        log.error(err);
    }
}