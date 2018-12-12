import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as Bluebird from "bluebird";
import { User, UserModel, UserAddModel, UserViewModel } from "../models/user.model";

export class UserService {

  static get userAttributes() {
    return ["id", "email"];
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
  private static readonly saltRounds = 12;
  private static readonly jwtSecret = "0.rfyj3n9nzh";

  /**
   * Lets people register
   * @param email
   * @param password
   * @param nickname
   */
  public register({ email, password, nickname }: UserAddModel) {
    return bcrypt.hash(password, UserService.saltRounds)
      .then((hash) => {
        return User.create({ email, password: hash, nickname })
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
