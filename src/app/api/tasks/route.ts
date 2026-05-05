import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/server-auth";
import { createTaskSchema } from "@/models/task";
import { createTask, getTaskAnalytics, initTaskTable, listTasks } from "@/services/task-service";
import { initUsersTable } from "@/services/auth-service";

export async function GET(request: Request) {
  await initUsersTable();
  await initTaskTable();
  const auth = await requireAuth();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "analytics") {
    const analytics = await getTaskAnalytics(auth.userId);
    return NextResponse.json(analytics);
  }

  const tasks = await listTasks(auth.userId);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  await initUsersTable();
  await initTaskTable();
  const auth = await requireAuth();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const json = await request.json();
  const parsed = createTaskSchema.safeParse(json);

  if (!parsed.success) {
    return new NextResponse(parsed.error.message, { status: 400 });
  }

  const task = await createTask(parsed.data, auth.userId);
  return NextResponse.json(task, { status: 201 });
}
