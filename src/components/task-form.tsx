"use client";

import { useState } from "react";

import type { CreateTaskInput } from "@/models/task";

type TaskFormProps = {
  onSubmit: (payload: CreateTaskInput) => Promise<void> | void;
  pending?: boolean;
};

export function TaskForm({ onSubmit, pending = false }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(3);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        await onSubmit({
          title,
          description,
          priority,
          status: "todo",
          dueDate: null
        });

        setTitle("");
        setDescription("");
        setPriority(3);
      }}
      className="space-y-3 rounded border p-4"
    >
      <h3 className="text-lg font-semibold">Create task</h3>
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full rounded border px-3 py-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label className="block text-sm">
        Priority (1-5)
        <input
          type="number"
          min={1}
          max={5}
          className="ml-2 w-20 rounded border px-2 py-1"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-40"
      >
        {pending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
