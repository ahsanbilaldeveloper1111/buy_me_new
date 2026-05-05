"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { LoginInput, RegisterInput } from "@/models/user";
import { fetchMe, loginRequest, logoutRequest, registerRequest } from "@/services/auth-client";

const AUTH_ME_KEY = ["auth-me"];

export function useMe() {
  return useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: fetchMe,
    retry: false
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterInput) => registerRequest(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY })
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginInput) => loginRequest(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY })
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_ME_KEY });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] });
    }
  });
}
