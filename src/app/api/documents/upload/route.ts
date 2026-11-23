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
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Private document upload restricted to Land Parcel Admin." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Confidential Document";

    if (!file) {
      return NextResponse.json(
        { error: "No document file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".pdf";
    const cleanName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const fileName = `private_${cleanName}_${uniqueSuffix}${ext}`;
    const docId = "doc-" + uniqueSuffix;

    let finalUrl = "";

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const supabaseAdmin = await createAdminClient();

        const { data, error } = await supabaseAdmin.storage
          .from("property-documents")
          .upload(fileName, buffer, {
            contentType: file.type || "application/pdf",
            upsert: true,
          });

        if (!error && data?.path) {
          // Store storage path for signed URL access
          finalUrl = `supabase://property-documents/${data.path}`;
        }
      } catch (err) {
        console.error("Supabase private document upload error:", err);
      }
    }

    if (!finalUrl) {
      const privateDir = path.join(process.cwd(), "data", "private_documents");
      if (!fs.existsSync(privateDir)) {
        fs.mkdirSync(privateDir, { recursive: true });
      }
      const localPath = path.join(privateDir, fileName);
      fs.writeFileSync(localPath, buffer);
      finalUrl = `/api/documents/download?id=${docId}&name=${encodeURIComponent(fileName)}`;
    }

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        title: title.trim(),
        file_url: finalUrl,
        is_private: true,
      },
    });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload confidential document" },
      { status: 500 }
    );
  }
}
