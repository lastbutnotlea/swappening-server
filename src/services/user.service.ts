import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as Bluebird from 'bluebird';
import { User, UserModel, UserAddModel, UserViewModel } from '../models/user.model';

export class UserService {

  static get userAttributes() {
    return ["id", "email"];
  }

  private static _user;
  private static readonly _saltRounds = 12;
  private static readonly _jwtSecret = '0.rfyj3n9nzh';

  public register({ email, password, nickname }: UserAddModel) {
    return bcrypt.hash(password, UserService._saltRounds)
      .then((hash) => {
        return User.create({ email, password: hash, nickname })
          .then((u) => this.getUserById(u!.id));
      });
  }

  public login({ email }: UserAddModel) {
    return User.findOne({ where: { email } }).then((u) => {
      const { id, email } = u!;
      return { token: jwt.sign({ id, email }, UserService._jwtSecret) };
    });
  }

  public verifyToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, UserService._jwtSecret, (err, decoded) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
        return;
      });
    }) as Promise<boolean>;
  }

  public static getUserFromToken(token: string): number {
    let authorization = token,
      decoded;
    try {
      decoded = jwt.verify(authorization, UserService._jwtSecret);
    } catch (e) {
      return -1;
    }
    return decoded.id;
  };

  public getUserById(id: number) {
    return User.findByPk(id, {
      attributes: UserService.userAttributes,
    }) as Bluebird<UserViewModel>;
  }
}
