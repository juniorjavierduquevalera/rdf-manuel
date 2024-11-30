import jwt from "jwt-simple";
import moment from "moment";
import { secret } from "../helpers/jwt.js";

export const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "La petición no tiene la cabecera de autenticación",
    });
  }

  try {
    let token = req.headers.authorization.replace(/['"]*/g, "").trim();
    const payload = jwt.decode(token, secret);

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "El token ha expirado",
      });
    }

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Error al procesar el token o token inválido",
    });
  }
};
