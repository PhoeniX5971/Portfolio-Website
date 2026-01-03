import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security";
import * as jose from "jose";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate incoming JSON
    const body = await request.json().catch(() => null);
    if (!body || !body.message) {
      return Response.json(
        { success: false, error: "Missing message body" },
        { status: 400 },
      );
    }

    // Security Checks
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    const sessionId = request.headers.get("x-session-id") || "unknown";

    const securityCheck = await checkRateLimit(ip, sessionId);

    if (!securityCheck.allowed) {
      console.warn(`Security Block (${ip}): ${securityCheck.reason}`);
      return Response.json(
        {
          success: false,
          error: securityCheck.error,
          logs: [{ type: "error", message: `⛔ ${securityCheck.error}` }],
        },
        { status: securityCheck.reason === "ban" ? 403 : 429 },
      );
    }

    const backendUrl = "https://phoenix5971-portfolio-assistant.vercel.app";

    // Authentication: Sign JWT using RS256
    const privateKeyContent = await fs.readFile(
      path.join(process.cwd(), "security/private_pkcs8.pem"),
      "utf-8",
    );
    const privateKey = await jose.importPKCS8(privateKeyContent, "RS256");
    const token = await new jose.SignJWT({ iss: "next-app" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setExpirationTime("1m") // Short lived token
      .sign(privateKey);

    // 2. Fetch from Python with a clear timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: body.message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.body) {
      throw new Error("No response body from backend");
    }

    // Proxy the stream directly
    return new Response(response.body, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("Assistant API Timeout");
      return Response.json(
        {
          success: false,
          error: "Request timed out",
          logs: [{ type: "error", message: "✗ Request timed out" }],
        },
        { status: 504 },
      );
    }
    console.error("Assistant API Error:", error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
        logs: [{ type: "error", message: `✗ ${error.message}` }],
      },
      { status: 500 },
    );
  }
}
