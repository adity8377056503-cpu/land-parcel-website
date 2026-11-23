import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    !key.includes("placeholder") &&
    url.startsWith("https://")
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(request);
    const isAdmin = Boolean(session);

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const allFiles: File[] = [];
    if (singleFile) allFiles.push(singleFile);
    if (files && files.length > 0) {
      files.forEach((f) => {
        if (!allFiles.some((existing) => existing.name === f.name && existing.size === f.size)) {
          allFiles.push(f);
        }
      });
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { error: "No media files provided" },
        { status: 400 }
      );
    }

    // Validate mime types: only images and standard videos
    const ALLOWED_MIME = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    for (const file of allFiles) {
      if (file.type && !ALLOWED_MIME.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `Unsupported media format: ${file.type}. Please upload JPG, PNG, WEBP, or MP4.` },
          { status: 400 }
        );
      }
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum allowed size of 25MB.` },
          { status: 400 }
        );
      }
    }

    const uploadedResults: Array<{ id: string; url: string; file_name: string; is_cover: boolean }> = [];

    // Ensure local upload directory exists for hybrid fallback
    const localUploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    if (!fs.existsSync(localUploadDir)) {
      fs.mkdirSync(localUploadDir, { recursive: true });
    }

    let supabaseAdmin: any = null;
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        supabaseAdmin = await createAdminClient();
      } catch (err) {
        console.error("Failed to initialize Supabase admin for media upload:", err);
      }
    }

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const cleanName = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      const fileName = `${cleanName}-${uniqueSuffix}${ext}`;
      const fileId = "img-" + uniqueSuffix;

      let finalUrl = "";

      if (supabaseAdmin) {
        try {
          const { data, error } = await supabaseAdmin.storage
            .from("properties")
            .upload(fileName, buffer, {
              contentType: file.type || "image/jpeg",
              upsert: true,
            });

          if (!error && data?.path) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from("properties")
              .getPublicUrl(data.path);
            finalUrl = publicUrlData.publicUrl;
          }
        } catch (storageErr) {
          console.error("Supabase storage upload error:", storageErr);
        }
      }

      // If Supabase Storage upload was not completed, persist to local server storage
      if (!finalUrl) {
        const localFilePath = path.join(localUploadDir, fileName);
        fs.writeFileSync(localFilePath, buffer);
        finalUrl = `/uploads/properties/${fileName}`;
      }

      uploadedResults.push({
        id: fileId,
        url: finalUrl,
        file_name: file.name,
        is_cover: i === 0,
      });
    }

    return NextResponse.json({
      success: true,
      count: uploadedResults.length,
      media: uploadedResults,
    });
  } catch (err: any) {
    console.error("Media upload error:", err);
    return NextResponse.json(
      { error: "Failed to process media upload", details: err?.message },
      { status: 500 }
    );
  }
}
