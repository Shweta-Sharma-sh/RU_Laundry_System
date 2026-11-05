// routes/auth.js
// --------------
// POST /api/auth/login     { portal: "student" | "worker" | "admin", identifier, password }
//                          -> { token, user }
// POST /api/auth/logout    -> { ok: true }
// GET  /api/auth/session   -> { user }   (user is null when not signed in)

import express from "express";
import { login, logout, getUserFromRequest, publicUser } from "../auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { portal, identifier, password } = req.body;
  const answer = await login(portal, identifier, password);
  res.json(answer);
});

router.post("/logout", async (req, res) => {
  await logout(req);
  res.json({ ok: true });
});

router.get("/session", async (req, res) => {
  const user = await getUserFromRequest(req);
  res.json({ user: user ? await publicUser(user) : null });
});

export default router;
