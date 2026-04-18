import { NextResponse } from "next/server";

import {
  createDefaultPlan,
  createDefaultRoadmap,
  createEmptyNotes
} from "../../../../lib/plan-template";
import { deleteProject, getProject, updateProject } from "../../../../lib/project-store";

type Params = {
  params: {
    projectId: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  const project = await getProject(params.projectId);
  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(request: Request, { params }: Params) {
  const body = (await request.json()) as {
    action?: "reset" | "rename" | "settings";
    name?: string;
    targetOutcome?: string;
    totalWeeks?: number;
    context?: {
      whyThisExists?: string;
      primaryGoal?: string;
      operatingSystem?: string[];
      toolStrategy?: string[];
      weeklyRhythm?: string[];
      guardrails?: string[];
      nearTermOutcomes?: string[];
    };
    plan?: Array<{
      week: number;
      title: string;
      objective: string;
      whyThisWeek: string;
      developmentOutcome: string;
      deliverables: string[];
      tasks: Array<{
        id: string;
        title: string;
        why: string;
        outcome: string;
        done: boolean;
        userCreated?: boolean;
      }>;
    }>;
    roadmap?: Array<{
      id?: string;
      title?: string;
      startWeek?: number;
      endWeek?: number;
      objective?: string;
      why?: string;
      outcome?: string;
      deliverables?: string[];
    }>;
  };
  if (!body.action) {
    return NextResponse.json({ error: "unsupported action" }, { status: 400 });
  }
  if (body.action === "rename" && !body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const project = await updateProject(params.projectId, (current) => {
    if (body.action === "rename") {
      return {
        ...current,
        name: body.name!.trim()
      };
    }

    if (body.action === "reset") {
      const totalWeeks = Math.max(1, current.plan.length || 52);
      return {
        ...current,
        plan: createDefaultPlan(totalWeeks),
        roadmap: createDefaultRoadmap(totalWeeks),
        notes: createEmptyNotes()
      };
    }

    if (body.action === "settings") {
      const requestedWeeks = Number(body.totalWeeks);
      const totalWeeks = Number.isFinite(requestedWeeks)
        ? Math.max(1, Math.min(104, Math.floor(requestedWeeks)))
        : Math.max(1, current.plan.length || 52);

      const defaultPlan = createDefaultPlan(totalWeeks);
      const defaultRoadmap = createDefaultRoadmap(totalWeeks);
      const requestedPlan = Array.isArray(body.plan) ? body.plan : current.plan;
      const existingWeeks = requestedPlan.length;
      const nextPlan =
        totalWeeks <= existingWeeks
          ? requestedPlan.slice(0, totalWeeks)
          : [...requestedPlan, ...defaultPlan.slice(existingWeeks)];

      const sanitizedPlan = nextPlan.map((week, index) => {
        const fallback = defaultPlan[index];
        return {
          week: week.week || fallback.week,
          title: week.title || fallback.title,
          objective: week.objective || fallback.objective,
          whyThisWeek: week.whyThisWeek || fallback.whyThisWeek,
          developmentOutcome: week.developmentOutcome || fallback.developmentOutcome,
          deliverables: Array.isArray(week.deliverables) ? week.deliverables : fallback.deliverables,
          tasks: Array.isArray(week.tasks)
            ? week.tasks.map((task) => ({
                id: task.id,
                title: task.title,
                why: task.why,
                outcome: task.outcome,
                done: Boolean(task.done),
                userCreated: Boolean(task.userCreated)
              }))
            : fallback.tasks
        };
      });

      const requestedRoadmap = Array.isArray(body.roadmap) ? body.roadmap : current.roadmap;
      const baseRoadmap = requestedRoadmap.length ? requestedRoadmap : defaultRoadmap;
      const sanitizedRoadmap = baseRoadmap
        .map((phase, index) => {
          const fallback = defaultRoadmap[Math.min(index, defaultRoadmap.length - 1)] || defaultRoadmap[0];
          const rawStart = Number(phase.startWeek);
          const rawEnd = Number(phase.endWeek);
          const startWeek = Number.isFinite(rawStart)
            ? Math.max(1, Math.min(totalWeeks, Math.floor(rawStart)))
            : fallback.startWeek;
          const endWeek = Number.isFinite(rawEnd)
            ? Math.max(startWeek, Math.min(totalWeeks, Math.floor(rawEnd)))
            : Math.max(startWeek, Math.min(totalWeeks, fallback.endWeek));
          return {
            id: phase.id || fallback.id || `phase-${index + 1}`,
            title: phase.title?.trim() || fallback.title || `Phase ${index + 1}`,
            startWeek,
            endWeek,
            objective: phase.objective?.trim() || fallback.objective || "",
            why: phase.why?.trim() || fallback.why || "",
            outcome: phase.outcome?.trim() || fallback.outcome || "",
            deliverables: Array.isArray(phase.deliverables) ? phase.deliverables : []
          };
        })
        .filter((phase) => phase.startWeek <= totalWeeks)
        .sort((a, b) => a.startWeek - b.startWeek);

      const nextNotes = Object.fromEntries(
        Object.entries(current.notes || {}).filter(([week]) => Number(week) <= totalWeeks)
      );

      const nextContext = body.context
        ? {
            whyThisExists: body.context.whyThisExists || current.context.whyThisExists,
            primaryGoal: body.context.primaryGoal || current.context.primaryGoal,
            operatingSystem: Array.isArray(body.context.operatingSystem) ? body.context.operatingSystem : current.context.operatingSystem,
            toolStrategy: Array.isArray(body.context.toolStrategy) ? body.context.toolStrategy : current.context.toolStrategy,
            weeklyRhythm: Array.isArray(body.context.weeklyRhythm) ? body.context.weeklyRhythm : current.context.weeklyRhythm,
            guardrails: Array.isArray(body.context.guardrails) ? body.context.guardrails : current.context.guardrails,
            nearTermOutcomes: Array.isArray(body.context.nearTermOutcomes) ? body.context.nearTermOutcomes : current.context.nearTermOutcomes
          }
        : current.context;

      return {
        ...current,
        name: body.name?.trim() ? body.name.trim() : current.name,
        targetOutcome: body.targetOutcome?.trim() || current.targetOutcome,
        plan: sanitizedPlan,
        notes: nextNotes,
        roadmap: sanitizedRoadmap.length ? sanitizedRoadmap : defaultRoadmap,
        context: nextContext
      };
    }

    return current;
  });

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function DELETE(_: Request, { params }: Params) {
  const deleted = await deleteProject(params.projectId);
  if (!deleted) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
