"use client";

import { useState } from "react";

import { useLogin, useLogout, useMe, useRegister } from "@/hooks/use-auth";

export function AuthForms() {
  const me = useMe();
  const register = useRegister();
  const login = useLogin();
  const logout = useLogout();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (me.data) {
    return (
      <section className="space-y-3 rounded border p-4">
        <h2 className="text-xl font-semibold">Logged in</h2>
        <p>Name: {me.data.name}</p>
        <p>Email: {me.data.email}</p>
        <button
          className="rounded border px-3 py-2"
          onClick={async () => {
            await logout.mutateAsync();
          }}
        >
          Logout
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-5 md:grid-cols-2">
      <form
        className="space-y-3 rounded border p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await register.mutateAsync({ name, email, password });
        }}
      >
        <h2 className="text-xl font-semibold">Create account</h2>
        <input className="w-full rounded border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-white" disabled={register.isPending}>
          {register.isPending ? "Creating..." : "Create User"}
        </button>
        {register.error ? <p className="text-sm text-red-600">{register.error.message}</p> : null}
      </form>

      <form
        className="space-y-3 rounded border p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await login.mutateAsync({ email, password });
        }}
      >
        <h2 className="text-xl font-semibold">Login</h2>
        <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-white" disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Login"}
        </button>
        {login.error ? <p className="text-sm text-red-600">{login.error.message}</p> : null}
      </form>
    </section>
  );
}
