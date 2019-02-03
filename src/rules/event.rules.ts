import { check } from "express-validator/check";

// Apparently these need to be set or else the matching wont work
export const eventRules = {
  eventAdd: [
    check("headline")
      .exists().withMessage("Event Headline must be specified"),
    check("description")
      .exists().withMessage("Event Description must be specified"),
    check("place")
      .exists().withMessage("Event Place must be specified"),
    check("startTime")
      .exists().withMessage("startTime must be specified"),
    check("endTime")
      .exists().withMessage("endTime must be specified"),
    check("isPrivate")
      .exists().withMessage("isPrivate must be specified"),
    check("hasChat")
      .exists().withMessage("hasChat must be specified"),
    check("isVisible")
      .exists().withMessage("isVisible must be specified"),
    check("tags")
      .exists().withMessage("tags must be specified"),
  ],
  eventGet: [
    check("eventId")
      .exists().withMessage("Event Id must be specified"),
  ],
};
