import { verifyToken } from "./auth.js";

export const verifyAdmin = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          status: "error",
          message:
            "Se requiere el rol de administrador para realizar esta acción",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Error al verificar el rol de admin:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Error al verificar permisos",
    });
  }
};
