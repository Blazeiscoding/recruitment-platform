import prisma from "../../../lib/prisma";
import { comparePassword, signJwt } from "../../../lib/auth";
import { loginSchema } from "../../../lib/validation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const parse = loginSchema.safeParse(req.body || {});
  if (!parse.success) {
    const first = parse.error.issues?.[0];
    return res
      .status(400)
      .json({ message: first?.message || "Invalid credentials" });
  }
  const { email, password } = parse.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const { id, email: userEmail, firstName, lastName, createdAt } = user;
    const token = signJwt({ sub: id, email: userEmail });
    return res
      .status(200)
      .json({
        message: "Logged in",
        data: {
          user: { id, email: userEmail, firstName, lastName, createdAt },
          token,
        },
      });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
