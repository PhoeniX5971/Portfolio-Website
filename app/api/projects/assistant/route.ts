import type { NextRequest } from "next/server";

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

    const backendUrl =
      process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:8000";

    // 2. Fetch from Python with a clear timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: body.message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 3. Check if response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response from Python:", text);
      throw new Error("Backend sent non-JSON response");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Assistant API Error:", error.message);
    return Response.json(
      {
        success: false,
        response: "Connection error between Next.js and Python.",
        logs: [{ type: "error", message: `✗ ${error.message}` }],
      },
      { status: 500 },
    );
  }
}
