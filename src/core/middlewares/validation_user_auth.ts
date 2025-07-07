import { RequestHandler } from "express";
import { SECRET_KEY } from "../../features/authorization/authorization";
import jwt from "jsonwebtoken";

export const userValidationMiddleware = (req: Request, res): boolean => {
  if (req.headers["authorization"] === undefined) {
    res.status(400).json("need authorization");
    return false;
  }

  if (typeof req.headers["authorization"] === "string") {
    return jwt.verify(
      req.headers["authorization"].replaceAll("Bearer ", ""),
      SECRET_KEY,
      (err: any, user: any) => {
        if (err) {
          res.status(400).json("need authorization");
          return;
        }
       
        // @ts-expect-error
        req.user = user;
        return true;
      }
    );
  } else {
    res.status(400).json("need authorization");
    return false;
  }
  return false;
};
