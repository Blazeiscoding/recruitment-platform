import prisma from "../../../../lib/prisma";
import { verifyJwt } from "../../../../lib/auth";

export async function GET(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return Response.json({ message: "Missing token" }, { status: 401 });
  }
  const decoded = verifyJwt(token);
  if (!decoded) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        headline: true,
        bio: true,
        location: true,
        skills: true,
        experienceYears: true,
        linkedinUrl: true,
        portfolioUrl: true,
        createdAt: true,
      },
    });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    return Response.json({ message: "OK", data: { user } }, { status: 200 });
  } catch (error) {
    console.error("Verify route error", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
