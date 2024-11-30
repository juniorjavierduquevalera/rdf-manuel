import express from "express";
import {
  createColeccion,
  getAllColecciones,
  getColeccionesByTema,
  getColeccionById,
  updateColeccion,
  deleteColeccion,
} from "../controllers/colecciones.controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js"; 
import { upload } from "../helpers/multer.js";

const router = express.Router();


router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "imgSmall", maxCount: 1 },
    { name: "imgLarge", maxCount: 1 },
  ]),
  createColeccion
);

router.get("/", getAllColecciones);
router.get("/tema/:idTema", getColeccionesByTema);
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

router.delete("/:id", verifyToken, verifyAdmin, deleteColeccion);

export default router;
