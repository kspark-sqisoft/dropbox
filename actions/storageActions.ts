"use server";

import { createServerSupabaseClient } from "utils/supabase/server";

function handleError(error) {
  if (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadFile(formData: FormData) {
  console.log("Uploading file(s)");

  const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error(
      "NEXT_PUBLIC_STORAGE_BUCKET 환경변수가 설정되지 않았습니다.",
    );
  }

  const supabase = await createServerSupabaseClient();

  const files = Array.from(formData.entries()).map(
    ([name, file]) => file as File,
  );

  console.log(
    "Files to upload:",
    files.map((f) => f.name),
  );
  console.log("Bucket:", bucketName);

  const results = await Promise.all(
    files.map((file) =>
      supabase.storage
        .from(bucketName)
        .upload(file.name, file, { upsert: true }),
    ),
  );

  console.log("Upload results:", results);

  // Check for errors
  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    console.error("Upload errors:", errors);
    throw new Error(
      `Upload failed: ${errors.map((e) => e.error?.message).join(", ")}`,
    );
  }

  return results;
}

export async function searchFiles(search: string = "") {
  const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error(
      "NEXT_PUBLIC_STORAGE_BUCKET 환경변수가 설정되지 않았습니다.",
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.storage.from(bucketName).list(null, {
    search,
  });

  if (error) {
    console.error("Search error:", error);
    throw error;
  }

  return data;
}

export async function deleteFile(fileName: string) {
  console.log("Deleting file:", fileName);

  const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error(
      "NEXT_PUBLIC_STORAGE_BUCKET 환경변수가 설정되지 않았습니다.",
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);

  if (error) {
    console.error("Delete error:", error);
    throw error;
  }

  console.log("Delete successful:", fileName);
  return data;
}
