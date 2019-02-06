import { check } from "express-validator/check";

// Apparently these need to be set or else the matching wont work
export const chatUserEventRules = {
  messageAdd: [
    check("chatId")
      .exists().withMessage("Chat id must be specified")
      .isNumeric().withMessage("The chat id must be a number"),
    check("isMessageOfOwner")
      .exists().withMessage(
        "It must be specified if the message is of the user or not(event owner)")
      .isBoolean().withMessage("To specify if the user or the even owner write the " +
      "message a boolean value is required"),
    check("message")
      .exists().withMessage("A message must be specified")
      .not().isEmpty().withMessage("The message is not allowed to be empty"),
  ],
  messageGet: [
    check("chatId")
      .exists().withMessage("Chat id must be specified")
      .isNumeric().withMessage("The chat id must be a number"),
  ],
};
