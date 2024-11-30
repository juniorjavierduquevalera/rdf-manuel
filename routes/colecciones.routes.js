import express from "express";
import {
  createColeccion,
  getAllColecciones,
  getColeccionesByTema,
  getColeccionById,
  updateColeccion,
  deleteColeccion,
} from "../controllers/colecciones.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../helpers/multer.js";

const router = express.Router();

// Crear una colección
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "imgSmall", maxCount: 1 },
    { name: "imgLarge", maxCount: 1 },
  ]),
  createColeccion
);

router.get("/", verifyToken, getAllColecciones);
router.get("/tema/:idTema", verifyToken, getColeccionesByTema);
router.get("/:id", verifyToken, getColeccionById);
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "imgSmall", maxCount: 1 },
    { name: "imgLarge", maxCount: 1 },
  ]),
  updateColeccion
);
router.delete("/:id", verifyToken, deleteColeccion);

export default router;
