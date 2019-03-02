import * as bcrypt from "bcrypt";
import { check } from "express-validator/check";
import { User } from "../models/user.model";

export const userRules = {
  forRegister: [
    check("email")
      .isEmail().withMessage("Invalid email format")
      .custom((email) => User.findOne({ where: { email } }).then((u) => !!!u)).withMessage("Email exists"),
    check("nickname")
      .exists().withMessage("The nickname must not be empty"),
    check("password")
      .isLength({ min: 8 }).withMessage("Invalid password"),
    check("confirmPassword")
      .custom((confirmPassword, { req }) => req.body.password === confirmPassword)
      .withMessage("Passwords are different"),
    check("description")
      .exists().withMessage("The description must not be empty"),
    check("location")
      .exists().withMessage("The location must not be empty"),
    check("distance")
      .exists().withMessage("The distance must not be empty")
      .isInt().withMessage("Distance must be a number"),

  ],
  forLogin: [
    check("email")
      .isEmail().withMessage("Invalid email format")
      .custom((email) => User.findOne({ where: { email } }).then((u) => !!u)).withMessage("Invalid email or password"),
    check("password")
      .custom((password, { req }) => {
        return User.findOne({ where: { email: req.body.email } })
          .then((u) => bcrypt.compare(password, u!.password));
      }).withMessage("Invalid email or password"),
  ],
};
