import prisma from "../../../../lib/prisma";
import { hashPassword, signJwt } from "../../../../lib/auth";
import { registerSchema } from "../../../../lib/validation";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues?.[0];
      return Response.json(
        { message: first?.message || "Invalid request" },
        { status: 400 }
      );
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
    } = parsed.data;
    const emailNormalized = email;

    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      return Response.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        headline,
        bio,
        location,
        skills: skills ?? [],
        experienceYears: experienceYears ?? undefined,
        linkedinUrl,
        portfolioUrl,
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
    return Response.json(
      { message: "Registered", data: { user, token } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register route error", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
