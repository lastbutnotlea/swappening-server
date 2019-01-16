import { Router } from "express";
import { matchedData } from "express-validator/filter";
import { validationResult } from "express-validator/check";
import { eventRules } from "../rules/event.rules";
import { EventAddModel, EventModel } from "../models/event.model";
import { EventService } from "../services/event.service";
import { PictureAddModel } from "../models/picture.model";
import * as multer from "multer";
import { UserService } from "../services/user.service";
import { TaggedEventService } from "../services/taggedEvent.service";
import { TagService } from "../services/tag.service";
import { TaggedEventAddModel, TaggedEventModel } from "../models/taggedEvent.model";
import { AuthorizationService } from "../services/authorization.service";

export const eventRouter = Router();
const eventService = new EventService();
const taggedEventService = new TaggedEventService();
const tagService = new TagService();

// setup
const UPLOAD_PATH = "uploads";
const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

/**
 * Route for uploading images
 */
eventRouter.post("/", eventRules.eventAdd, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }

  const ownerId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);

  const payloadEvent = matchedData(req) as EventAddModel;
  const event = await eventService.addEvent(payloadEvent, ownerId);

  const tagArray = req.body.tags;

  if (tagArray !== null) {
    for (const tagElement of tagArray) {
      const tag = await tagService.getTagByTagName(tagElement);
      const tagToEvent: TaggedEventAddModel = {
        tagId: tag.id,
        eventId: event.id,
      };
      await taggedEventService.addTagToEvent(tagToEvent);
      /*if ( tagId !== -1 ) {
        const taggedEvent = { tagId, eventId: event.id };
        taggedEventService.addTagToEvent(taggedEvent);
      }
      */
    }
  }

  return res.json(event);
});

/**
 * Returns all event data.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/:id", async (req, res) => {
  if (await AuthorizationService.isOwnerEventIdSameAsUserId(eventService, req)) {
    return res.status(401).json("Unauthorized");
  }
  const event = eventService.getEventById(req.params.id);
  return event.then((u) => res.json(u));
});

/**
 * Route for deleting an events
 */
eventRouter.delete("/:id", async (req, res) => {
  if (await AuthorizationService.isOwnerEventIdSameAsUserId(eventService, req)) {
    return res.status(401).json("Unauthorized");
  }

  eventService.deleteEvent(req.params.id);
  return res.status(200).json("success");
});

/**
 * Returns all event data.
 * Pictures have to be loaded manually later
 */
eventRouter.put("/:id", (req, res) => {
  // TODO Verify id
  // TODO Verify user id
  const newEvent: EventModel = {
    id: req.params.id,
    headline: req.body.headline,
    description: req.body.description,
    ownerId: req.body.ownerId,
    place: req.body.place,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    isPrivate: req.body.isPrivate,
    hasChat: req.body.hasChat,
    isVisible: req.body.isVisible,
    createdAt: "",
    updatedAt: "",
  };
  const event = eventService.updateEvent(newEvent);
  return event.then((u) => res.json(u));
});

/**
 * Returns number of next events for a certain user.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/forUser/:userId/:number", (req, res) => {
  // TODO Verify id
  const event = eventService.getEventsForUser(req.params.userId, req.params.number);
  return event.then((u) => res.json(u));
});

/**
 * Returns all events of a certain user.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/ofUser/:userId", (req, res) => {
  // TODO Verify id
  const event = eventService.getEventsOfUser(req.params.userId);
  return event.then((u) => res.json(u));
});

/**
 *  This is a endpoint for uploading form-data which contains the image and the eventId for the image
 */
eventRouter.post("/image", upload.single("data"), (req, res) => {
  // TODO Verify these Parameters
  const payload: PictureAddModel = {
    eventId: req.body.eventId,
    originalName: req.file.originalname,
    pictureStorageName: req.file.filename,
  };
  const picture = eventService.addPicture(payload);

  return picture.then((u) => res.json(u));
});

/**
 * Route for deleting an event
 */
eventRouter.delete("/image/:storageName", (req, res) => {
  // TODO Protect
  eventService.deletePicture(req.params.storageName);
  return res.status(200).json("success");
});

eventRouter.put("/image/updateOrder/:eventId", (req, res) => {
  const event = eventService.updateImageOrder(req.body, req.params.eventId);
  return event.then((u) =>
    res.json(u));
});
