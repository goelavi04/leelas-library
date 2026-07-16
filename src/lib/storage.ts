import "server-only";
import sharp from "sharp";
import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const COVER_BUCKET = "book-covers";
const MAX_DIMENSION = 800;

/** Resizes/compresses an uploaded cover image and stores it in Supabase Storage. Returns the storage path. */
export async function uploadCoverImage(
  supabase: SupabaseClient<Database>,
  file: File
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const path = `${randomUUID()}.webp`;

  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, outputBuffer, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) throw new Error(`Couldn't upload cover image: ${error.message}`);

  return path;
}

export async function deleteCoverImage(
  supabase: SupabaseClient<Database>,
  path: string | null
): Promise<void> {
  if (!path) return;
  await supabase.storage.from(COVER_BUCKET).remove([path]);
}
