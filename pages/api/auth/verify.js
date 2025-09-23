import prisma from "../../../lib/prisma";
import { verifyJwt } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
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
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "OK", data: { user } });
  } catch (error) {
    console.error("Verify error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
