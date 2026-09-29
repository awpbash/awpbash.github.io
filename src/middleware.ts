import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(({ url }, next) => {
  // Images are generated at build time. Keep Astro's runtime image optimizer unreachable.
  if (url.pathname === "/_image" || url.pathname === "/_image/") {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return next();
});
