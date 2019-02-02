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

userRouter.get("/user/:userId", (req, res) => {
  const userId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
  if (userId == req.params.userId) {
    return UserService.getFullUserData(userId).then((u) => {
      res.json(u);
    });
  } else {
    return UserService.getUserById(req.params.userId).then((u) => {
      res.json(u);
    });
  }

});

userRouter.put("/user/:userId", (req, res) => {
  const userId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
  if (userId == req.params.userId) {
    return userService.updateUser(
      {
        id: req.params.userId,
        createdAt: "",
        description: req.body.description,
        distance: req.body.distance,
        email: "",
        location: req.body.location,
        nickname: req.body.nickname,
        password: req.body.password,
        pictureStorageName: req.body.pictureStorageName,
        updatedAt: "",

      }).then((u) => {
      res.json(u);
    });
  } else {
    return res.status(403).json("Forbidden");
  }

});

userRouter.get("/user/forEvent/:eventId", (req, res) => {
  return UserService.getUserByEventId(req.params.eventId).then((u) => {
    res.json(u);
  });
});

