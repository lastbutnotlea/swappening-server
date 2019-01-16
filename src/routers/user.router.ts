import { Router } from "express";
import { matchedData } from "express-validator/filter";
import { validationResult } from "express-validator/check";
import { userRules } from "../rules/user.rules";
import { UserService } from "../services/user.service";
import { UserAddModel } from "../models/user.model";
import * as multer from "multer";

export const userRouter = Router();
const userService = new UserService();

// setup
const UPLOAD_PATH = "uploads";
const upload = multer({
  dest: `${UPLOAD_PATH}/`,
  /*
  fileFilter: function (req, file, cb) {
    cb(null, validationResult(req))}
    */
});

userRouter.post("/register", upload.single("data"), userRules.forRegister, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }

  const payload = matchedData(req) as UserAddModel;
  payload.pictureStorageName = req.file.filename;
  const user = userService.register(payload);

  return user.then((u) => res.json(u));
});

userRouter.post("/login", userRules.forLogin, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }

  const payload = matchedData(req) as UserAddModel;
  const token = userService.login(payload);

  return token.then((t) => res.json(t));
});
