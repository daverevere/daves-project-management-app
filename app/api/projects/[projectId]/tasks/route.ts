import { NextResponse } from "next/server";

import { updateProject } from "../../../../../lib/project-store";

type Params = {
  params: {
    projectId: string;
  };
};

type AddTaskPayload = {
  action: "add";
  week: number;
  title: string;
  why?: string;
  outcome?: string;
};

type ToggleTaskPayload = {
  action: "toggle";
  week: number;
  taskId: string;
};

type RemoveTaskPayload = {
  action: "remove";
  week: number;
  taskId: string;
};

type TaskPayload = AddTaskPayload | ToggleTaskPayload | RemoveTaskPayload;

export async function PUT(request: Request, { params }: Params) {
  const body = (await request.json()) as TaskPayload;
  if (!body.action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }
  if (body.action === "add" && !body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const project = await updateProject(params.projectId, (current) => {
    if (body.action === "add") {
      const title = body.title.trim();

      return {
        ...current,
        plan: current.plan.map((week) => {
          if (week.week !== body.week) return week;
          return {
            ...week,
            tasks: [
              ...week.tasks,
              {
                id: `custom-${body.week}-${Date.now()}`,
                title,
                why: body.why?.trim() || "User-created task.",
                outcome: body.outcome?.trim() || "Custom progress for this week.",
                done: false,
                userCreated: true
              }
            ]
          };
        })
      };
    }

    if (body.action === "toggle") {
      return {
        ...current,
        plan: current.plan.map((week) => {
          if (week.week !== body.week) return week;
          return {
            ...week,
            tasks: week.tasks.map((task) =>
              task.id === body.taskId ? { ...task, done: !task.done } : task
            )
          };
        })
      };
    }

    return {
      ...current,
      plan: current.plan.map((week) => {
        if (week.week !== body.week) return week;
        return {
          ...week,
          tasks: week.tasks.filter((task) => task.id !== body.taskId)
        };
      })
    };
  });

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}
