import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rute yang memerlukan autentikasi
const protectedRoutes = ["/customers", "/dashboard", "/products", "/orders", "/"];

export const getCookieValue = (): string | null => {
  // Mengambil semua cookies dalam bentuk string
  const cookieString = document.cookie;

  // Membagi cookies berdasarkan tanda ';' untuk mendapatkan cookie individu
  const cookies = cookieString.split(";");

  // Mencari cookie yang sesuai dengan nama yang diberikan
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("token" + "=")) {
      // Mengambil nilai token dengan cara memotong string setelah '='
      return cookie.substring("token".length + 1); // Mengembalikan nilai token
    }
  }

  // Jika cookie tidak ditemukan, kembalikan null
  return null;
};

export async function middleware(req: NextRequest) {
  // Mengambil token dari cookies
  const token = req.cookies.get("token");

  // Jika rute dilindungi tetapi tidak ada token, redirect ke login
  if (protectedRoutes.includes(req.nextUrl.pathname) && !token) {
    const loginUrl = new URL("/", req.url); // Redirect ke halaman login
    return NextResponse.redirect(loginUrl);
  }

  if (req.nextUrl.pathname === "/" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));

  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/customers/:path*", "/products/:path*", "/orders/:path*"], // Terapkan middleware hanya untuk rute yang dilindungi
};
