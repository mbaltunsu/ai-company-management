import { NextRequest, NextResponse } from "next/server";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";
import { updateIssueSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

const log = createRequestLogger("PATCH /api/github/issues/[num]");

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ num: string }> }
) {
  try {
    const { num } = await params;
    const issueNumber = parseInt(num);

    if (isNaN(issueNumber)) {
      return NextResponse.json(
        { data: null, error: "Invalid issue number" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateIssueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

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

    const { repo, ...updates } = parsed.data;
    const issue = await github.updateIssue(repo, issueNumber, updates);
    log.info({ repo, issueNumber }, "Issue updated");

    return NextResponse.json({ data: issue, error: null });
  } catch (err) {
    log.error({ err }, "Failed to update issue");
    return NextResponse.json(
      { data: null, error: "Failed to update issue" },
      { status: 500 }
    );
  }
}
