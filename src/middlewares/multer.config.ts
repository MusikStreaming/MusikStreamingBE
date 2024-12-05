import multer from "multer";
import path from "path";

/**
 * Stores the file sent by form in memoryStorage (which is RAM).
 *
 * This middleware stores the file sent by POST request in temporal memory.
 *
 * There is a limit to the file size of 10MB and restict file types to only one of ["png", "jpg", "jpeg", "gif", "avif"]. If the file does not satisfy the aforementioned requirements, returns error.
 */
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
