const uploadDirectory = require("./lib/uploadDirectory");

module.exports = async (bucketName, localDirectory, remotePath, deleteFilesInBucket = false) => {
    await uploadDirectory(bucketName, localDirectory, remotePath, deleteFilesInBucket);
}