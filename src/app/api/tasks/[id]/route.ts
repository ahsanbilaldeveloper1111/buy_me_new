import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/server-auth";
import { updateTaskSchema } from "@/models/task";
import { deleteTask, getTaskById, initTaskTable, updateTask } from "@/services/task-service";
import { initUsersTable } from "@/services/auth-service";

function getId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await initUsersTable();
  await initTaskTable();
  const auth = await requireAuth();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { id: rawId } = await params;
  const id = getId(rawId);
  if (!id) return new NextResponse("Invalid id", { status: 400 });

  const task = await getTaskById(id, auth.userId);
  if (!task) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(task);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initUsersTable();
  await initTaskTable();
  const auth = await requireAuth();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { id: rawId } = await params;
  const id = getId(rawId);
  if (!id) return new NextResponse("Invalid id", { status: 400 });

  const json = await request.json();
  const parsed = updateTaskSchema.safeParse(json);
  if (!parsed.success) {
    return new NextResponse(parsed.error.message, { status: 400 });
  }

  const task = await updateTask(id, parsed.data, auth.userId);
  if (!task) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(task);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await initUsersTable();
  await initTaskTable();
  const auth = await requireAuth();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { id: rawId } = await params;
  const id = getId(rawId);
  if (!id) return new NextResponse("Invalid id", { status: 400 });

  const removed = await deleteTask(id, auth.userId);
  if (!removed) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(null, { status: 204 });
}
