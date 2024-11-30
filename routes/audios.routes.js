import express from "express";
import {
  createAudio,
  getAllAudios,
  getAudiosByColeccion,
  getAudioById,
  updateAudio,
  deleteAudio,
} from "../controllers/audios.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../helpers/multer.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "imageSmall", maxCount: 1 },
    { name: "imageLarge", maxCount: 1 },
  ]),
  createAudio
);

router.get("/", verifyToken, getAllAudios);
router.get("/coleccion/:idColeccion", verifyToken, getAudiosByColeccion);

router.get("/:id", verifyToken, getAudioById);

router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "imageSmall", maxCount: 1 },
    { name: "imageLarge", maxCount: 1 },
  ]),
  updateAudio
);

router.delete("/:id", verifyToken, deleteAudio);

export default router;
