import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export default function proxy(request: NextRequest) {
  // Minimal pass-through proxy for Next.js 16
  // Auth and other middleware logic can be added here
  return NextResponse.next()
}
