"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateTaskInput, UpdateTaskInput } from "@/models/task";
import {
  createTaskRequest,
  deleteTaskRequest,
  fetchTaskAnalytics,
  fetchTasks,
  updateTaskRequest
} from "@/services/task-client";

const TASKS_KEY = ["tasks"];
const TASK_ANALYTICS_KEY = ["task-analytics"];

export function useTasks() {
  return useQuery({ queryKey: TASKS_KEY, queryFn: fetchTasks });
}

export function useTaskAnalytics() {
  return useQuery({ queryKey: TASK_ANALYTICS_KEY, queryFn: fetchTaskAnalytics });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskInput) => createTaskRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: TASK_ANALYTICS_KEY });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskInput }) => updateTaskRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: TASK_ANALYTICS_KEY });
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTaskRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: TASK_ANALYTICS_KEY });
    }
  });
}
