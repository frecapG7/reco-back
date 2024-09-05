const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const { GCLOUD_STORAGE_BUCKET } = require("../config");

const storage = new Storage();
const bucket = storage.bucket(GCLOUD_STORAGE_BUCKET);

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (verifyMimeType(file)) {
      return cb(null, true);
    }
    cb(new Error(`Unsupported file type ${file.mimetype}`));
  },
});

const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file");
    }
    const { originalname, buffer } = file;
    const blob = bucket.file(originalname.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(buffer);
  });
};

const verifyMimeType = (file) => {
  let accept = /jpeg|jpg|png|gif|svg/;

  const mimetype = accept.test(file.mimetype);
  const extname = accept.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return true;
  }
  return false;
};

module.exports = { upload, uploadToGCS };
