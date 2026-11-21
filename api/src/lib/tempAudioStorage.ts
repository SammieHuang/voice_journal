import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream";
import type { Request } from "express";
import type { StorageEngine } from "multer";

/**
 * Multer storage for uploaded audio, used instead of multer.diskStorage:
 *
 * - Every upload gets a random UUID file name, created with the "wx" flag
 *   (fail if it already exists), so two requests can never share a file.
 * - If the upload breaks off (client disconnects), the partial file is
 *   closed and deleted here. multer only cleans up finished uploads.
 *
 * Deleting the file after a finished upload is the route's job.
 */

// OpenAI picks the format from the file name, and only .m4a is accepted,
// so every temp file is .m4a whatever the client called it.
const TEMP_FILE_EXTENSION = ".m4a";

const removeQuietly = (filePath: string, cb: () => void) => {
  fs.rm(filePath, { force: true }, (err) => {
    if (err) console.error("Failed to delete temp upload", filePath, err);
    cb();
  });
};

const createTempAudioStorage = (directory: string): StorageEngine => {
  fs.mkdirSync(directory, { recursive: true });

  return {
    _handleFile(_req: Request, file, cb) {
      const filename = `${randomUUID()}${TEMP_FILE_EXTENSION}`;
      const filePath = path.join(directory, filename);
      const out = fs.createWriteStream(filePath, { flags: "wx", mode: 0o600 });
      let createdByUs = false;
      out.once("open", () => {
        createdByUs = true;
      });

      pipeline(file.stream, out, (err) => {
        if (!err) {
          return cb(null, {
            destination: directory,
            filename,
            path: filePath,
            size: out.bytesWritten,
          });
        }
        // Upload broke off: wait until the file is closed, then delete it.
        // If we never created it ("wx" found an existing file), it isn't ours.
        const cleanUp = () =>
          createdByUs ? removeQuietly(filePath, () => cb(err)) : cb(err);
        if (out.closed) cleanUp();
        else out.once("close", cleanUp);
      });
    },

    _removeFile(_req: Request, file, cb) {
      removeQuietly(file.path, () => cb(null));
    },
  };
};

export { createTempAudioStorage };
