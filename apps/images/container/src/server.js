/**
 * Image Transformer HTTP Server
 * Runs inside Cloudflare Container
 * Converts images to WebP using sharp
 */

import { createServer } from "node:http";
import sharp from "sharp";

const PORT = process.env.PORT || 8080;

/**
 * Parse multipart form data (simplified)
 */
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/**
 * Transform image to WebP
 */
async function transformToWebP(imageBuffer, options = {}) {
  const { width, height, quality = 80 } = options;

  let pipeline = sharp(imageBuffer);

  // Resize if dimensions specified
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to WebP
  const webpBuffer = await pipeline
    .webp({
      quality,
      effort: 4, // Balance between speed and compression
    })
    .toBuffer();

  return webpBuffer;
}

/**
 * HTTP request handler
 */
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (url.pathname === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "image-transformer" }));
    return;
  }

  // Transform endpoint
  if (url.pathname === "/transform" && req.method === "POST") {
    try {
      const imageBuffer = await parseBody(req);

      if (!imageBuffer || imageBuffer.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No image data provided" }));
        return;
      }

      // Parse options from query params
      const options = {
        width: url.searchParams.get("width")
          ? parseInt(url.searchParams.get("width"), 10)
          : undefined,
        height: url.searchParams.get("height")
          ? parseInt(url.searchParams.get("height"), 10)
          : undefined,
        quality: url.searchParams.get("quality")
          ? parseInt(url.searchParams.get("quality"), 10)
          : 80,
      };

      const webpBuffer = await transformToWebP(imageBuffer, options);

      res.writeHead(200, {
        "Content-Type": "image/webp",
        "Content-Length": webpBuffer.length,
        "X-Original-Size": imageBuffer.length,
        "X-Transformed-Size": webpBuffer.length,
      });
      res.end(webpBuffer);
    } catch (error) {
      console.error("Transform error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to transform image",
          message: error.message,
        }),
      );
    }
    return;
  }

  // Get image info
  if (url.pathname === "/info" && req.method === "POST") {
    try {
      const imageBuffer = await parseBody(req);
      const metadata = await sharp(imageBuffer).metadata();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          size: imageBuffer.length,
          hasAlpha: metadata.hasAlpha,
        }),
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Not found",
      endpoints: {
        health: "GET /health",
        transform: "POST /transform?width=&height=&quality=",
        info: "POST /info",
      },
    }),
  );
}

// Create and start server
const server = createServer(handleRequest);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Image Transformer running on port ${PORT}`);
  console.log(`Instance ID: ${process.env.CLOUDFLARE_DEPLOYMENT_ID || "local"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
