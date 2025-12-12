import { NextResponse } from 'next/server'

export async function POST() {
  // Hook up to tag-based revalidation if needed
  return NextResponse.json({ revalidated: true })
}
