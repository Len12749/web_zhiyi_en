import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // 公开路由，不需要认证的页面
  publicRoutes: [
    "/",
    "/pdf-to-markdown",
    "/image-to-markdown", 
    "/markdown-translation",
    "/pdf-translation",
    "/format-conversion",
    "/file-history",
    "/notifications",
    "/api/webhooks(.*)",
    "/api/(.*)",
  ],
  // 受保护的路由只有dashboard
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 