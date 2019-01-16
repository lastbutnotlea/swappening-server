import { check } from "express-validator/check";

// Apparently these need to be set or else the matching wont work
export const eventRules = {
  eventAdd: [
    check("headline")
      .exists({ checkFalsy: true }).withMessage("Event Headline must be specified"),
    check("description")
      .exists({ checkFalsy: true }).withMessage("Event Description must be specified"),
    check("place")
      .exists({ checkFalsy: true }).withMessage("Event Place must be specified"),
    check("startTime")
      .exists({ checkFalsy: true }).withMessage("startTime must be specified"),
    check("endTime")
      .exists({ checkFalsy: true }).withMessage("endTime must be specified"),
    check("isPrivate")
      .exists({ checkFalsy: true }).withMessage("isPrivate must be specified"),
    check("hasChat")
      .exists({ checkFalsy: true }).withMessage("hasChat must be specified"),
    check("isVisible")
      .exists({ checkFalsy: true }).withMessage("isVisible must be specified"),
    check("tags")
      .exists({ checkFalsy: true }).withMessage("tags must be specified"),
  ],
  eventGet: [
    check("eventId")
      .exists({ checkFalsy: true }).withMessage("Event Id must be specified"),
  ],
};
