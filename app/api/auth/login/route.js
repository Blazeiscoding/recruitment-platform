import prisma from "../../../../lib/prisma";
import { comparePassword, signJwt } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validation";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues?.[0];
      return Response.json(
        { message: first?.message || "Invalid credentials" },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    const { id, email: userEmail, firstName, lastName, createdAt } = user;
    const token = signJwt({ sub: id, email: userEmail });
    return Response.json(
      {
        message: "Logged in",
        data: {
          user: { id, email: userEmail, firstName, lastName, createdAt },
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login route error", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
