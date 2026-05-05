-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'todo',
  "priority" INTEGER NOT NULL DEFAULT 3,
  "due_date" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tasks_status_check" CHECK ("status" IN ('todo', 'in_progress', 'done')),
  CONSTRAINT "tasks_priority_check" CHECK ("priority" BETWEEN 1 AND 5)
);

-- Task indexes
CREATE INDEX IF NOT EXISTS "idx_tasks_status" ON "tasks"("status");
CREATE INDEX IF NOT EXISTS "idx_tasks_user_id" ON "tasks"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_priority" ON "tasks"("priority");
CREATE INDEX IF NOT EXISTS "idx_tasks_due_date" ON "tasks"("due_date");
