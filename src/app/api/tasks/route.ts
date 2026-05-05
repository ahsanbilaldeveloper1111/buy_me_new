import { NextResponse } from "next/server";

import { createTaskSchema } from "@/models/task";
import { createTask, getTaskAnalytics, initTaskTable, listTasks } from "@/services/task-service";
import { initUsersTable } from "@/services/auth-service";

function getUserIdFromRequest(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return userId;
}

export async function GET(request: Request) {
  await initUsersTable();
  await initTaskTable();
  const userId = getUserIdFromRequest(request);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "analytics") {
    const analytics = await getTaskAnalytics(userId);
    return NextResponse.json(analytics);
  }

  const tasks = await listTasks(userId);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  await initUsersTable();
  await initTaskTable();
  const userId = getUserIdFromRequest(request);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const json = await request.json();
  const parsed = createTaskSchema.safeParse(json);

  if (!parsed.success) {
    return new NextResponse(parsed.error.message, { status: 400 });
  }

  const task = await createTask(parsed.data, userId);
  return NextResponse.json(task, { status: 201 });
}
