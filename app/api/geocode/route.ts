import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"
const schema = z.object({ address: z.string().trim().min(3).max(240) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid address." }, { status: 400 })
  const endpoint = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org/search"
  const response = await fetch(`${endpoint}?format=jsonv2&limit=1&q=${encodeURIComponent(parsed.data.address)}`, { headers: { "User-Agent": process.env.NOMINATIM_USER_AGENT || "CivicReport/1.0" }, next: { revalidate: 3600 } })
  if (!response.ok) return NextResponse.json({ error: "Address lookup is unavailable." }, { status: 502 })
  const results = await response.json() as Array<{ lat: string; lon: string; display_name: string }>
  const first = results[0]
  if (!first) return NextResponse.json({ error: "We could not locate that address." }, { status: 404 })
  return NextResponse.json({ lat: Number(first.lat), lng: Number(first.lon), address: first.display_name })
}
