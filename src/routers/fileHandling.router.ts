import { Router } from "express";
import * as fs from "fs";
import * as path from "path";
import * as multer from "multer";

// setup
const UPLOAD_PATH = "uploads";
const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

export const fileRouter = Router();


// Protected Upload
fileRouter.post("/upload", upload.single("data"), function (req, res, next) {
  // req.file is the `data` file
  // req.body will hold the text fields, if there were any
  res.json(req.file.filename);
});

// Protected download
fileRouter.get("/:id", async (req, res) => {
  try {
    fs.createReadStream(path.join(UPLOAD_PATH, req.params.id)).pipe(res);
  } catch (err) {
    res.sendStatus(400);
  }
});
