import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

const SECURITY_DIR = path.join(process.cwd(), "security");
const BLACKLIST_FILE = path.join(SECURITY_DIR, "blacklist.json");
const SESSIONS_FILE = path.join(SECURITY_DIR, "sessions.json");

interface BlacklistEntry {
    reason: string;
    timestamp: string;
    logs: any[];
}

interface SessionEntry {
    lastRequest: number; // timestamp in ms
    sessionIds: string[];
    createdAt: number; // timestamp in ms
}

interface RateLimitResult {
    allowed: boolean;
    reason?: "ban" | "cooldown";
    error?: string;
}

// Ensure security directory exists
const ensureDir = async () => {
    try {
        await fs.access(SECURITY_DIR);
    } catch {
        await fs.mkdir(SECURITY_DIR, { recursive: true });
    }
};

export function hashIP(ip: string): string {
    return createHash("sha256").update(ip).digest("hex");
}

async function loadJson<T>(file: string, defaultValue: T): Promise<T> {
    try {
        await ensureDir();
        const data = await fs.readFile(file, "utf-8");
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}

async function saveJson(file: string, data: any) {
    await ensureDir();
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function checkRateLimit(
    ip: string,
    sessionId: string,
): Promise<RateLimitResult> {
    const ipHash = hashIP(ip);
    const now = Date.now();

    // 1. Load Blacklist
    const blacklist = await loadJson<Record<string, BlacklistEntry>>(
        BLACKLIST_FILE,
        {},
    );

    if (blacklist[ipHash]) {
        return {
            allowed: false,
            reason: "ban",
            error: `Access denied. Reason: ${blacklist[ipHash].reason}`,
        };
    }

    // 2. Load Sessions
    let sessions = await loadJson<Record<string, SessionEntry>>(SESSIONS_FILE, {});

    // Cleanup old sessions (weekly)
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    let cleanNeeded = false;
    for (const key in sessions) {
        if (now - sessions[key].createdAt > ONE_WEEK_MS) {
            delete sessions[key];
            cleanNeeded = true;
        }
    }

    let entry = sessions[ipHash];

    // Initialize if new
    if (!entry) {
        entry = {
            lastRequest: 0,
            sessionIds: [],
            createdAt: now,
        };
    }

    // Rule 1: Cooldown (1 request per second for BAN, 5s for UI warning logic but strict 1s ban here)
    const timeDiff = now - entry.lastRequest;

    if (entry.lastRequest > 0 && timeDiff < 1000) {
        // INSTA BAN Logic
        const reason = "Rate Limit Exceeded (>1 req/s)";
        blacklist[ipHash] = {
            reason,
            timestamp: new Date().toISOString(),
            logs: [{ type: "error", message: "Banned for rapid requests" }],
        };
        await saveJson(BLACKLIST_FILE, blacklist);
        return {
            allowed: false,
            reason: "ban",
            error: "You have been banned for spamming.",
        };
    }

    if (entry.lastRequest > 0 && timeDiff < 5000) {
        return {
            allowed: false,
            reason: "cooldown",
            error: "Please wait 5 seconds between messages.",
        };
    }

    // Rule 2: Session Hopping (Same IP, > 3 different session IDs)
    if (!entry.sessionIds.includes(sessionId)) {
        entry.sessionIds.push(sessionId);
        if (entry.sessionIds.length > 3) {
            // INSTA BAN Logic
            const reason = "Session Hopping Abuse";
            blacklist[ipHash] = {
                reason,
                timestamp: new Date().toISOString(),
                logs: [
                    {
                        type: "error",
                        message: `Banned for using multiple session IDs: ${entry.sessionIds.join(", ")}`,
                    },
                ],
            };
            await saveJson(BLACKLIST_FILE, blacklist);
            return {
                allowed: false,
                reason: "ban",
                error: "Security Check Failed: Session abuse detected.",
            };
        }
    }

    // Update Session State
    entry.lastRequest = now;
    sessions[ipHash] = entry;

    // Save Sessions (including cleanup if happened)
    await saveJson(SESSIONS_FILE, sessions);

    return { allowed: true };
}
