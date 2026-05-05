import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable(),
  status: taskStatusSchema,
  priority: z.number().int().min(1).max(5),
  dueDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  status: taskStatusSchema.optional().default("todo"),
  priority: z.number().int().min(1).max(5).optional().default(3),
  dueDate: z.string().optional().nullable()
});

export const updateTaskSchema = createTaskSchema.partial();

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type TaskAnalytics = {
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  topPriorities: Array<{ priority: number; count: number }>;
  recentCompletedTitles: string[];
};
