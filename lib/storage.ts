import { createSupabaseAdminClient } from "./supabase/admin"
import { getSupabaseSecretKey } from "./supabase/config"

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "issue-images"

export async function uploadImage(file: Blob, filename: string, contentType: string) {
  if (!getSupabaseSecretKey()) return null
  const path = `issues/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}`
  const bytes = Buffer.from(await file.arrayBuffer())
  const client = createSupabaseAdminClient()
  const buckets = await client.storage.listBuckets()
  if (!buckets.data?.some((item) => item.name === bucket)) {
    const created = await client.storage.createBucket(bucket, { public: true, fileSizeLimit: "10MB" })
    if (created.error && !created.error.message.toLowerCase().includes("already exists")) throw new Error(created.error.message)
  }
  const { error } = await client.storage.from(bucket).upload(path, bytes, { contentType, cacheControl: "31536000", upsert: false })
  if (error) throw new Error(error.message)
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
