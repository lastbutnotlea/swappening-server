import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as Bluebird from "bluebird";
import { User, UserModel, UserAddModel, UserViewModel } from "../models/user.model";
import { Event, EventModel } from "../models/event.model";
import { Sequelize } from "sequelize";

export class UserService {

  private static readonly saltRounds = 12;
  private static readonly jwtSecret = "0.rfyj3n9nzh";

  static get userAttributes() {
    return ["nickname", "description", "pictureStorageName"];
  }

  /**
   * gets the user id from a given token
   * @param token
   */
  public static getUserFromToken(token: string): number {
    let decoded;
    try {
      decoded = jwt.verify(token, UserService.jwtSecret);
    } catch (e) {
      return -1;
    }
    return decoded.id;
  }

  /**
   * Returns user data for a given id
   * @param id
   */
  public static getUserById(id: number) {
    return User.findByPk(id, {
      attributes: UserService.userAttributes,
    }) as Bluebird<UserViewModel>;
  }

  public updateUser({ id, password, nickname, description, distance, location, pictureStorageName }: UserModel) {
    const promises: Sequelize.Promise[] = [];
    if (nickname != null) {
      promises.push(User.update({
        nickname,
      }, {
        where: { id },
      }));
    }
    if (description != null) {
      promises.push(User.update({
        description,
      }, {
        where: { id },
      }));
    }
    if (password != null) {
      promises.push(bcrypt.hash(password, UserService.saltRounds)
        .then((hash) => {
          User.update({
            password: hash,
          }, {
            where: { id },
          });
        }));
    }
    if (distance != null) {
      promises.push(User.update({
        distance,
      }, {
        where: { id },
      }));
    }
    if (location != null) {
      promises.push(User.update({
        location,
      }, {
        where: { id },
      }));
    }
    if (pictureStorageName != null) {
      promises.push(User.update({
        pictureStorageName,
      }, {
        where: { id },
      }));
    }
    return Promise.all(promises).then(() => UserService.getUserById(id));
  }


  /**
   * Lets people register
   * @param email
   * @param password
   * @param nickname
   * @param description
   * @param distance
   * @param location
   * @param pictureStorageName
   */
  public register({ email, password, nickname, description, distance, location, pictureStorageName }: UserAddModel) {
    return bcrypt.hash(password, UserService.saltRounds)
      .then((hash) => {
        return User.create({ email, password: hash, nickname, description, distance, location, pictureStorageName })
          .then((u) => UserService.getUserById(u!.id));
      });
  }

  /**
   * Logs in, generates and returns a new session token
   * @param email
   */
  public login({ email }: UserAddModel) {
    return User.findOne({ where: { email } }).then((u) => {
      const { id, email } = u!;
      return { token: jwt.sign({ id, email }, UserService.jwtSecret) };
    });
  }

  /**
   * Verifies a given token
   * @param token
   */
  public verifyToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, UserService.jwtSecret, (err, decoded) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
        return;
      });
    }) as Promise<boolean>;
  }
}
