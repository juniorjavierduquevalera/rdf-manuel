import jwt from "jwt-simple";
import moment from "moment";
import { secret } from "../helpers/jwt.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({
      status: "error",
      message: "La petición no tiene la cabecera de autenticación",
    });
  }

  try {
    const token = authHeader.replace(/['"]*/g, "").trim();
    const payload = jwt.decode(token, secret);

    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "error",
        message: "El token ha expirado",
      });
    }

    req.user = payload;

    next();
  } catch (error) {
    console.error("Error al procesar el token:", error.message);
    return res.status(401).json({
      status: "error",
      message: "Token inválido o error al procesarlo",
    });
  }
};
