import express from "express";
import { fetchUsers, createUser } from "../controllers/memberController.js";

const router = express.Router();

router.get("/", fetchUsers);
router.post("/", createUser);

export default router;
