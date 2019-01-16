import * as Bluebird from "bluebird";
import { Event, EventAddModel, EventModel, EventViewModel } from "../models/event.model";
import { Picture, PictureAddModel, PictureViewModel } from "../models/picture.model";
import { Sequelize } from "sequelize";
import * as fs from "fs";


export class EventService {

  static get eventAttributes() {
    return ["id", "headline", "description", "place", "startTime", "endTime", "isPrivate", "hasChat", "isVisible"];
  }

  static get pictureAttributes() {
    return ["pictureStorageName", "eventId", "originalName"];
  }

  /**
   * Adds an event
   * @param headline
   * @param description
   * @param ownerId
   */
  public addEvent({ headline, description, place, startTime, endTime, isPrivate, hasChat, isVisible }: EventAddModel, ownerId: number) {
    return Event.create({ ownerId, headline, description, place, startTime, endTime, isPrivate, hasChat, isVisible })
      .then((u) => this.getEventById(u.id));
  }

  /**
   * Deletes an event and all pictures with given number
   * @param id
   */
  public deleteEvent(id: number) {
    const promises: Sequelize.Promise[] = [];
    /* .then Throws an error if there is no picture on an event */
    Picture.findAll({ where: { eventId: id } }).then((res) => {
      res.forEach((pic) => {
        promises.push(this.deletePicture(pic.pictureStorageName));
      });
      Promise.all(promises).then(() => {
        Event.destroy({ where: { id } });
      });
    });
  }

  public updateEvent({ id, headline, description, ownerId, place, startTime, endTime, isPrivate, hasChat, isVisible }: EventModel) {
    const promises: Sequelize.Promise[] = [];
    if (headline != null) {
      promises.push(Event.update({
        headline,
      }, {
        where: { id },
      }));
    }
    if (description != null) {
      promises.push(Event.update({
        description,
      }, {
        where: { id },
      }));
    }
    if (ownerId != null) {
      promises.push(Event.update({
        ownerId,
      }, {
        where: { id },
      }));
    }
    if (place != null) {
      promises.push(Event.update({
        place,
      }, {
        where: { id },
      }));
    }
    if (startTime != null) {
      promises.push(Event.update({
        startTime,
      }, {
        where: { id },
      }));
    }
    if (endTime != null) {
      promises.push(Event.update({
        endTime,
      }, {
        where: { id },
      }));
    }
    if (isPrivate != null) {
      promises.push(Event.update({
        isPrivate,
      }, {
        where: { id },
      }));
    }
    if (hasChat != null) {
      promises.push(Event.update({
        hasChat,
      }, {
        where: { id },
      }));
    }
    if (isVisible != null) {
      promises.push(Event.update({
        isVisible,
      }, {
        where: { id },
      }));
    }
    return Promise.all(promises).then(() => this.getEventById(id));
  }

  /**
   * Returns the event for a given id
   * @param id
   */
  public getEventById(id: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });

    return Event.findByPk(id, {
      attributes: EventService.eventAttributes,
      include: [Picture],
      order: [
        [Picture, "order", "asc"],
      ],
    }) as Bluebird<EventViewModel>;
  }

  /**
   * Gets a numer of events for a given user to watch next
   * // TODO this is just returning random events right now
   * @param userId
   * @param number
   */
  public getEventsForUser(userId: number, number: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });

    return Event.findAll({
      order: [
        [Sequelize.literal("RANDOM()")],
        [Picture, "order", "asc"],
      ], attributes: EventService.eventAttributes,
      limit: number,
      include: [Picture],
    }) as Bluebird<EventViewModel>;
  }

  /**
   * Gets all events of a given user
   * @param userId
   */
  public getEventsOfUser(userId: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });

    return Event.findAll({
      where: { ownerId: userId },
      attributes: EventService.eventAttributes,
      include: [Picture],
      order: [
        [Picture, "order", "asc"],
      ],
    }) as Bluebird<EventViewModel>;
  }

  /**
   * Adds a new picture to an event
   * @param eventId
   * @param originalName
   * @param pictureStorageName
   */
  public addPicture({ eventId, originalName, pictureStorageName }: PictureAddModel) {
    return Picture.create({ pictureStorageName, eventId, originalName })
      .then(() => this.getAllPicturesByEventId(eventId));
  }

  /**
   * Deletes a picture from the database and removes it from storage
   * @param pictureStorageName
   */
  public deletePicture(pictureStorageName: string) {
    Picture.destroy({
      where: {
        pictureStorageName,
      },
    }).then(
      fs.unlink("uploads/" + pictureStorageName, (res) => {
        return res;
      }),
    );
  }

  /**
   * returns all Pictures to a given event
   * @param id the event id
   */
  public getAllPicturesByEventId(id: number) {
    return Picture.findAll({
      where: { eventId: id },
      order: [
        ["order", "asc"],
      ],
      attributes: EventService.pictureAttributes,
    }) as Array<Bluebird<PictureViewModel>>;
  }

  /**
   * Updates the picture order
   * @param images
   * @param eventId
   */
  public updateImageOrder(images: any[], eventId: number) {
    const promises: Sequelize.Promise[] = [];
    images.forEach((img) => {
      promises.push(Picture.update({
        order: img.order,
      }, {
        where: {
          pictureStorageName: img.pictureStorageName,
          eventId,
        },
      }));
    });

    return Promise.all(promises).then(() =>
      this.getAllPicturesByEventId(eventId));
  }
}
