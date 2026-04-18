import { NextResponse } from "next/server";

import { updateProject } from "../../../../../lib/project-store";

type Params = {
  params: {
    projectId: string;
  };
};

type NotesPayload = {
  week: number;
  value: string;
};

export async function PUT(request: Request, { params }: Params) {
  const body = (await request.json()) as NotesPayload;
  if (!Number.isInteger(body.week)) {
    return NextResponse.json({ error: "week is required" }, { status: 400 });
  }

  const project = await updateProject(params.projectId, (current) => ({
    ...current,
    notes: {
      ...current.notes,
      [body.week]: body.value ?? ""
    }
  }));

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}
