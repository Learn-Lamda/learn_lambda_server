import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";

export const validationModelMiddleware = (
  type: any,
  value = "body",
  skipMissingProperties = false,
  whitelist = false,
  forbidNonWhitelisted = true
): RequestHandler => {
  return (req, res, next) => {
    
    if (type === null && type == undefined) {
      next();
      return;
    }
    const model = plainToInstance(type, req[value]);
    
    validate(model, { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(", ");
        return res.status(400).json(message);
      } else {
        req["model"] = model;
        next();
      }
    });
  };
};
