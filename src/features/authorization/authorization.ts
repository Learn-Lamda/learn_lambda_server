import { IsString } from "class-validator";
import { FeatureHttpController } from "../../core/controllers/feature_http_controller";
import {
  AccessLevel,
  CallbackStrategyWithValidationModel,
  ResponseBase,
  SubRouter,
} from "../../core/controllers/http_controller";
import { Result } from "../../core/helpers/result";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const saltRounds = 10;

export class User {
  @IsString()
  login: string;
  @IsString()
  password: string;
}
export interface Payload {
  userId: string;
}
export class LoginUser extends CallbackStrategyWithValidationModel<User> {
  error = "Error";
  validationModel = User;
  call = async (model: User): ResponseBase =>
    Result.isNotNull(
      await this.client.user.findFirst({ where: { login: model.login } })
    ).fold(
      async (databaseModel) => {
        if (await bcrypt.compare(model.password, databaseModel.password)) {
          return Result.ok({
            token: jwt.sign(
              { userId: databaseModel.id.toString() },
              process.env.USER_JWT_SECRET
            ),
          });
        }
        return Result.error(this.error);
      },
      async () => {
        return Result.ok(this.error);
      }
    );
}
export class RegistrationModel {
  @IsString()
  login: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
}

export class Registration extends CallbackStrategyWithValidationModel<User> {
  validationModel = User;
  error = "Error";

  call = async (model: User): ResponseBase =>
    Result.isNotNull(
      await this.client.admin.findFirst({ where: { login: model.login } })
    ).fold(
      async (databaseModel) => {
        if (await bcrypt.compare(model.password, databaseModel.password)) {
          return Result.ok({
            token: jwt.sign(
              { userId: databaseModel.id.toString() },
              process.env.ADMIN_JWT_SECRET
            ),
          });
        }
        return Result.error(this.error);
      },
      async () => {
        return Result.ok(this.error);
      }
    );
}
export class LoginAdmin extends CallbackStrategyWithValidationModel<RegistrationModel> {
  validationModel = RegistrationModel;
  call = async (model: RegistrationModel): ResponseBase =>
    Result.isNotNull(
      await this.client.admin.findFirst({
        where: { login: model.login },
      })
    ).fold(
      async (_) => Result.error("User is Registered"),
      async () => {
        await this.client.user.create({
          data: {
            login: model.login,
            email: model.email,
            password: await bcrypt.hash(model.password, saltRounds),
          },
        });
        return Result.ok("registered");
      }
    );
}

export class NewAdmin {
  call = async () => {
    await new PrismaClient().admin.create({
      data: { login: "123", password: "123`" },
    });
    console.log("new admin");
  };
}

export class AuthorizationFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter("/login", new LoginUser(), AccessLevel.public),
      new SubRouter("/registration", new Registration(), AccessLevel.public),
      new SubRouter("/admin/login", new LoginUser(), AccessLevel.public),
    ];
  }
}
