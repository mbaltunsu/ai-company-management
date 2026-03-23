import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";

const log = createRequestLogger("GET /api/github/user");

export async function GET() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { data: null, error: "GitHub not connected" },
        { status: 401 }
      );
    }

    const github = createGitHubServiceFromSession(session);
    if (!github) {
      return NextResponse.json(
        { data: null, error: "GitHub not connected" },
        { status: 401 }
      );
    }

    const user = await github.getAuthenticatedUser();
    log.info({ login: user.login }, "GitHub user fetched");

    return NextResponse.json({ data: user, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch GitHub user");
    return NextResponse.json(
      { data: null, error: "Failed to fetch GitHub user" },
      { status: 500 }
    );
  }
}
