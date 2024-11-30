import express from "express";
import {
  createTema,
  getTemas,
  getTemaById,
  updateTema,
  deleteTema,
} from "../controllers/temas.controllers.js";
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
  createTema
);

router.get("/", getTemas);

router.get("/:id", getTemaById);

router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "imgSmall", maxCount: 1 },
    { name: "imgLarge", maxCount: 1 },
  ]),
  updateTema
);

router.delete("/:id", verifyToken, verifyAdmin, deleteTema);

export default router;
