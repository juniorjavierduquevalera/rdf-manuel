import express from "express";
import {
  register,
  login,
  profile,
  update,
  remove,
  renovarToken,
} from "../controllers/users.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile/:id", verifyToken, profile);
router.put("/update/:id", verifyToken, update);
router.delete("/remove/:id", verifyToken, remove);
router.get("/renew", verifyToken, renovarToken);
router.post("/logout", verifyToken, renovarToken);

export default router;
