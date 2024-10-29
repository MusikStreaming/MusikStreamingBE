import multer from "multer";
import path from "path";

const storage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".gif"];
    const allowedMimeTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
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
