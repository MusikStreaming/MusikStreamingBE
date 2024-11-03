import multer from "multer";
import path from "path";

const storage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".gif", ".avif"];
    const allowedMimeTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
      "image/avif",
    ];

    if (
      !allowedExts.includes(ext) ||
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      return callback(
        new Error("Only images (PNG, JPG, JPEG, GIF) are allowed"),
      );
    }
    callback(null, true);
  },
});

export { storage };
