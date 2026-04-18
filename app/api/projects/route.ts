import { NextResponse } from "next/server";

import { createNewProject, listProjects } from "../../../lib/project-store";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; weeks?: number };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const parsedWeeks = Number(body.weeks);
  const weeks = Number.isFinite(parsedWeeks) ? Math.max(1, Math.min(104, Math.floor(parsedWeeks))) : 52;

  const project = await createNewProject(name, weeks);
  return NextResponse.json({ project }, { status: 201 });
}
