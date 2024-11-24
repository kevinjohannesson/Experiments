// import { NextRequest, NextResponse } from "next/server";
// // import { match } from "@formatjs/intl-localematcher";
// // import Negotiator from "negotiator";

// // let defaultLocale = 'en-US'
// const locales = ["en-US", "nl-NL", "nl"];

// // Get the preferred locale, similar to the above or using a library
// function getLocale(request: NextRequest) {
//   const { headers } = request;
//   console.log({ headers });
//   // const languages = new Negotiator({ headers }).languages()

//   return "en-US";
//   // return match(languages, locales, defaultLocale)
// }

// export function middleware(request: NextRequest) {
//   console.log("middleware");
//   console.log(request);
//   // Check if there is any supported locale in the pathname
//   const { pathname } = request.nextUrl;
//   const pathnameHasLocale = locales.some(
//     (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
//   );

//   if (pathnameHasLocale) return;

//   // Redirect if there is no locale
//   const locale = getLocale(request);
//   request.nextUrl.pathname = `/${locale}${pathname}`;
//   // e.g. incoming request is /products
//   // The new URL is now /en-US/products
//   return NextResponse.redirect(request.nextUrl);
// }

// export const config = {
//   matcher: [
//     // Skip all internal paths (_next)
//     "/((?!_next).*)",
//     // Optional: only run on root (/) URL
//     // '/'
//   ],
// };
import Debug from "debug";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { i18n } from "../i18n-config";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = [...i18n.locales];

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

const debug = Debug("middleware");

export function middleware(request: NextRequest) {
  debug(`Middleware triggered: ${request.url}`);
  const pathname = request.nextUrl.pathname;
  // // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // // If you have one
  // if (
  //   [
  //     '/manifest.json',
  //     '/favicon.ico',
  //     // Your other files in `public`
  //   ].includes(pathname)
  // )
  //   return
  if (pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|css|js|txt)$/)) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // request.nextUrl.pathname = `/foobar`;
    // return NextResponse.redirect(request.nextUrl);
    return;
  }

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
