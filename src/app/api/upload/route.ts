import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive } from "@/lib/trial";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif", "application/pdf"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "upload"), 20, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "TENANT" && session.user.tenantId) {
    const tenant = await db.tenant.findUnique({ where: { id: session.user.tenantId }, select: { plan: true, trialEndsAt: true } });
    if (!tenant || !isTrialActive(tenant)) {
      return NextResponse.json({ error: "Your trial has ended. Upgrade to upload images." }, { status: 402 });
    }
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, AVIF, or PDF files are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Files must be smaller than 10MB." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type === "application/pdf" ? "raw" : "image";
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "professional-portfolios", resource_type: resourceType, use_filename: false, unique_filename: true },
        (error, response) => {
          if (error || !response?.secure_url) reject(error ?? new Error("Cloudinary upload failed."));
          else resolve({ secure_url: response.secure_url });
        },
      );
      upload.end(buffer);
    });
    return NextResponse.json({ url: result.secure_url, resourceType });
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
