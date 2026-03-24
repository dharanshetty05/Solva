import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow landing page
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Allow static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Block everything else
  return new NextResponse('Not Found', { status: 404 })
}

export const config = {
  matcher: '/:path*',
}