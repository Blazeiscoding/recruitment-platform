import prisma from "../../../lib/prisma";
import { hashPassword, signJwt } from "../../../lib/auth";
import { registerSchema } from "../../../lib/validation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const parse = registerSchema.safeParse(req.body || {});
  if (!parse.success) {
    const first = parse.error.issues?.[0];
    return res
      .status(400)
      .json({ message: first?.message || "Invalid request" });
  }
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    headline,
    bio,
    location,
    skills,
    experienceYears,
    linkedinUrl,
    portfolioUrl,
  } = parse.data;
  const emailNormalized = email;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone,
        headline: headline,
        bio: bio,
        location: location,
        skills: skills ?? [],
        experienceYears: experienceYears ?? undefined,
        linkedinUrl: linkedinUrl,
        portfolioUrl: portfolioUrl,
      },
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

    const token = signJwt({ sub: user.id, email: user.email });
    return res
      .status(201)
      .json({ message: "Registered", data: { user, token } });
  } catch (error) {
    console.error("Register error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
