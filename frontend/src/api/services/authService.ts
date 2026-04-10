import apiClient from "../client";
import { AUTH } from "../endpoints";
import type { LoginRequest, LoginResponse, RegisterRequest, AuthCheckResponse } from "../types/auth";

export const authService = {
  check(): Promise<AuthCheckResponse> {
    return apiClient.get(AUTH.CHECK).then((r) => ({
      success: r.data.success,
      message: r.data.message,
      profile: r.data.data?.profile,
    }));
  },

  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post(AUTH.LOGIN, data).then((r) => ({
      success: r.data.success,
      message: r.data.message,
      profile: r.data.data?.profile,
    }));
  },

  register(data: RegisterRequest): Promise<LoginResponse> {
    return apiClient.post(AUTH.REGISTER, data).then((r) => ({
      success: r.data.success,
      message: r.data.message,
      profile: r.data.data?.profile,
    }));
  },

  logout(): Promise<void> {
    return apiClient.post(AUTH.LOGOUT).then(() => undefined);
  },
};
