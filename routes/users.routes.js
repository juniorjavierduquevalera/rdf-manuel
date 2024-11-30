import express from "express";
import {
  register,
  login,
  profile,
  update,
  remove,
  renovarToken,
} from "../controllers/users.controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js"; 

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile/:id", verifyToken, profile);
router.put("/update/:id", verifyToken, update);
router.delete("/remove/:id", verifyToken, verifyAdmin, remove);

router.get("/renew", verifyToken, renovarToken);

export default router;
