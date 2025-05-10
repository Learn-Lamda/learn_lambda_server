import { validationModelMiddleware } from "../middlewares/validation_model";
import { Result } from "../helpers/result";
import { Router, Request, Response } from "express";
import { CoreValidation } from "../validations/core_validation";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { IRouteModel, Routes } from "../models/routes";
import { validate, ValidationError } from "class-validator";

export type HttpMethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "PATCH" | "HEAD";

export type ResponseBase = Promise<Result<any, any>>;
export abstract class CallbackStrategyWithEmpty {
  abstract call(): ResponseBase;
}
export abstract class CallbackStrategyWithValidationModel<V> {
  abstract validationModel: V;
  abstract call(model: V): ResponseBase;
}
export abstract class CallbackStrategyWithIdQuery {
  abstract idValidationExpression: CoreValidation;
  abstract call(id: string): ResponseBase;
}
export abstract class CallBackStrategyWithQueryPage {
  abstract validationPageExpression: RegExp | null;
  abstract call(page: string): ResponseBase;
}

export abstract class CallbackStrategyWithFileUpload {
  abstract checkingFileExpression: RegExp;
  abstract idValidationExpression: CoreValidation;
  abstract call(file: File, id: string): ResponseBase;
}
export abstract class CallbackStrategyWithFilesUploads {
  abstract chuckingFileExpressions: RegExp[];
  abstract call(files: File[]): ResponseBase;
}

export class SubRouter<A> implements ISubSetFeatureRouter<A> {
  method: HttpMethodType;
  subUrl: string;
  fn:
    | CallbackStrategyWithValidationModel<A>
    | CallbackStrategyWithEmpty
    | CallbackStrategyWithIdQuery
    | CallBackStrategyWithQueryPage
    | CallbackStrategyWithFileUpload
    | CallbackStrategyWithFilesUploads;
  constructor(
    method: HttpMethodType,
    subUrl: string,
    fn:
      | CallbackStrategyWithValidationModel<A>
      | CallbackStrategyWithEmpty
      | CallbackStrategyWithIdQuery
      | CallBackStrategyWithQueryPage
      | CallbackStrategyWithFileUpload
      | CallbackStrategyWithFilesUploads
  ) {
    this.fn = fn;
    this.subUrl = subUrl;
    this.method = method;
  }
}

interface ISubSetFeatureRouter<A> {
  method: HttpMethodType;
  subUrl: string;
  fn:
  | CallbackStrategyWithValidationModel<A>
  | CallbackStrategyWithEmpty
  | CallbackStrategyWithIdQuery
  | CallBackStrategyWithQueryPage
  | CallbackStrategyWithFileUpload
  | CallbackStrategyWithFilesUploads;
}

abstract class ICoreHttpController {
  abstract mainURL: string;
  public router = Router();
  abstract call(): Routes;
}

export class CoreHttpController<V> implements ICoreHttpController {
  mainURL: string;
  validationModel: any;
  subRoutes: ISubSetFeatureRouter<V>[] = [];

  routes = {
    POST: null,
    GET: null,
    DELETE: null,
    PUT: null,
  };

  public router = Router();

  constructor(routerModel: IRouteModel) {
    this.mainURL = "/" + routerModel.url;
    this.validationModel = routerModel.validationModel;
  }
  async responseHelper(res: Response, fn: ResponseBase) {
    (await fn).fold(
      (ok) => {
        res.json(ok);
        return;
      },
      (err) => {
        res.status(400).json({ error: String(err) });
        return;
      }
    );
  }
  call(): Routes {
    if (this.subRoutes.isNotEmpty()) {
      this.subRoutes.map(async (el) => {
        let url = el.subUrl;
        if (el.subUrl.at(0) !== '/') {
          url = `/${el.subUrl}`;
        }
        this.router[el.method.toLowerCase()](this.mainURL + url, async (req, res) => {
          if (el.fn instanceof CallbackStrategyWithValidationModel) {

            // @ts-expect-error
            (await valid(el.fn.validationModel, req.body)).fold((s) => this.responseHelper(res, el.fn.call(s)), (e) => res.status(400).json(e))

            return;
          }
          if (el.fn instanceof CallbackStrategyWithIdQuery) {
            if (req.query.id === undefined) {
              res.status(400).json("request query id is null, need query id ?id={id:String}");
              return;
            }
            if (el.fn.idValidationExpression !== undefined) {
              if (!el.fn.idValidationExpression.regExp.test(req.query.id)) {
                res
                  .status(400)
                  .json(
                    `request query id  must fall under the pattern: ${el.fn.idValidationExpression.regExp} message: ${el.fn.idValidationExpression.message} `
                  );
                return;
              } else {
                await this.responseHelper(res, el.fn.call(req.query.id));
              }
            } else {
              await this.responseHelper(res, el.fn.call(req["files"]["file"]));
            }
          }

          if (el.fn instanceof CallBackStrategyWithQueryPage) {
            throw Error("needs to be implimed");
          }
          if (el.fn instanceof CallbackStrategyWithEmpty) {
            await this.responseHelper(res, el.fn.call());
            return;
          }

          if (el.fn instanceof CallbackStrategyWithFileUpload) {
            if (req["files"] === undefined) {
              res.status(400).json("need files to form-data request");
              return;
            }

            if (req["files"]["file"] === undefined) {
              res.status(400).json("need file to form data request");
              return;
            }
            // if (req.query.description === undefined) {
            //   res
            //     .status(400)
            //     .json("request query description is null, need query description &description={description:String}");
            //   return;
            // }
            if (req.query.id === undefined) {
              res.status(400).json("request query id is null, need query id ?id={id:String}");
              return;
            }
            if (!el.fn.idValidationExpression.regExp.test(req.query.id)) {
              res.status(400).json(el.fn.idValidationExpression.message);
              return;
            }
            if (el.fn instanceof CallbackStrategyWithFileUpload) {
              if (!el.fn.checkingFileExpression.test(req["files"]["file"]["name"])) {
                res.status(400).json("a file with this extension is expected: " + String(el.fn.checkingFileExpression));
                return;
              }
            }

            await this.responseHelper(res, el.fn.call(req["files"]["file"], req.query.id));
          }
        });
      });
    }
    if (this.routes["POST"] != null) {
      this.router.post(this.mainURL, validationModelMiddleware(this.validationModel), (req, res) =>
        this.requestResponseController<V>(req, res, this.routes["POST"])
      );
    }
    if (this.routes["DELETE"] != null) {
      this.router.delete(this.mainURL, (req, res) =>
        this.requestResponseController<V>(req, res, this.routes["DELETE"])
      );
    }
    if (this.routes["PUT"] != null) {
      this.router.put(this.mainURL, validationModelMiddleware(this.validationModel), (req, res) =>
        this.requestResponseController<V>(req, res, this.routes["PUT"])
      );
    }
    if (this.routes["GET"] != null) {
      this.router.get(this.mainURL, (req, res) => this.requestResponseController<V>(req, res, this.routes["GET"]));
    }

    return {
      router: this.router,
    };
  }
  public put(usecase: any) {
    this.routes["PUT"] = usecase;
  }
  public delete(usecase: any) {
    this.routes["DELETE"] = usecase;
  }
  public async requestResponseController<T>(
    req: Request,
    res: Response,
    usecase: CallbackStrategyWithValidationModel<T>
  ) {
    let payload = null;
    const useCase = usecase as any;
    if (req["model"] != undefined) {
      payload = req.body as T;
    }

    if (req.query.page !== undefined) {
      payload = String(req.query.page);
    }
    if (req.query.id !== undefined) {
      payload = String(req.query.id);
    }
    (await useCase(payload)).fold(
      (ok) => {
        return res.json(ok);
      },

      (err) => {
        return res.status(400).json({ error: String(err) });
      }
    );
  }
  // TODO(IDONTSUDO):need fix to CallbackStrategyWithValidationModel<V>
  public post(usecase: any) {
    this.routes["POST"] = usecase;
  }

  public get(usecase: any) {
    this.routes["GET"] = usecase;
  }
}



export const valid = async <T>(validationModelType: any, object): Promise<Result<string, T>> => {
  console.log(validationModelType);
  console.log(object);
  const model = plainToInstance(validationModelType, object) as unknown as object;
  const errors: ValidationError[] = await validate(model, {
    skipMissingProperties: false,
    whitelist: false,
    forbidNonWhitelisted: true,
  });

  if (errors.isNotEmpty()) {
    const message = errors.map((error: ValidationError) => {
      let result = "";
      if (error.children)
        error.children.map((el) => {
          if (el.constraints) {
            result += Object.values(el.constraints).join(", ");
          }
        });
      if (error.constraints) result += Object.values(error.constraints).join(", ");
      return result;
    });
    return Result.error(message.join(", \n"));
  } else {
    return Result.ok(this as unknown as T);
  }
};