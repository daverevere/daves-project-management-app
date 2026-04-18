import { NextResponse } from "next/server";

import {
  createDefaultPlan,
  createDefaultRoadmap,
  createDefaultScorecardMetrics,
  createEmptyNotes,
  ScorecardMetricConfig
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
    scorecardMetrics?: ScorecardMetricConfig[];
  };
  if (!body.action) {
    return NextResponse.json({ error: "unsupported action" }, { status: 400 });
  }
  if (body.action === "rename" && !body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const project = await updateProject(params.projectId, (current) => {
    const sanitizeMetrics = (
      metrics: ScorecardMetricConfig[] | undefined,
      weekCount: number
    ): ScorecardMetricConfig[] => {
      if (!metrics || !metrics.length) {
        return createDefaultScorecardMetrics(weekCount);
      }
      return metrics.map((metric, index) => ({
        id: metric.id || `metric-${index + 1}`,
        label: metric.label || `Metric ${index + 1}`,
        help: metric.help || "Project-defined scorecard signal.",
        kind: metric.kind === "completionRate" ? "completionRate" : "keywordSignals",
        target: Math.max(0, Math.floor(metric.target || 0)),
        keywords: metric.keywords || [],
        matchFields: metric.matchFields || ["title", "why", "outcome"]
      }));
    };

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
        scorecardMetrics: createDefaultScorecardMetrics(totalWeeks),
        notes: createEmptyNotes()
      };
    }

    if (body.action === "settings") {
      const requestedWeeks = Number(body.totalWeeks);
      const totalWeeks = Number.isFinite(requestedWeeks)
        ? Math.max(1, Math.min(104, Math.floor(requestedWeeks)))
        : Math.max(1, current.plan.length || 52);

      const defaultPlan = createDefaultPlan(totalWeeks);
      const existingWeeks = current.plan.length;
      const nextPlan =
        totalWeeks <= existingWeeks
          ? current.plan.slice(0, totalWeeks)
          : [...current.plan, ...defaultPlan.slice(existingWeeks)];

      const nextNotes = Object.fromEntries(
        Object.entries(current.notes || {}).filter(([week]) => Number(week) <= totalWeeks)
      );

      return {
        ...current,
        name: body.name?.trim() ? body.name.trim() : current.name,
        targetOutcome: body.targetOutcome?.trim() || current.targetOutcome,
        plan: nextPlan,
        notes: nextNotes,
        roadmap: createDefaultRoadmap(totalWeeks),
        scorecardMetrics: sanitizeMetrics(body.scorecardMetrics, totalWeeks)
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
