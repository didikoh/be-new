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
    if (data.profile_pic instanceof File) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("birthday", data.birthday);
      formData.append("password", data.password);
      formData.append("profile_pic", data.profile_pic);

      // Must unset Content-Type so Axios does NOT convert FormData to JSON.
      // In Axios 1.x, having Content-Type: application/json (our default) causes
      // transformRequest to call JSON.stringify(formDataToJSON(formData)), which
      // silently drops the File. Setting it to undefined lets the browser set
      // multipart/form-data with the correct boundary automatically.
      return apiClient
        .post(AUTH.REGISTER, formData, {
          headers: { "Content-Type": undefined },
        })
        .then((r) => ({
          success: r.data.success,
          message: r.data.message,
          profile: r.data.data?.profile,
        }));
    }

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
