import apiClient from "../client";
import { PROFILE } from "../endpoints";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  AdminChangePasswordRequest,
} from "../types/profile";

export const profileService = {
  update(data: UpdateProfileRequest): Promise<{ success: boolean; message?: string }> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("birthday", data.birthday);
    formData.append("phone", data.phone);
    formData.append("role", data.role);
    formData.append("user_id", String(data.user_id));
    console.log("Updating profile with data:", data);
    console.log("Updating profile with data:", Array.from(formData.entries()));
    if (data.profile_pic) {
      formData.append("profile_pic", data.profile_pic);
    }
    return apiClient
      .put(PROFILE.UPDATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.put(PROFILE.CHANGE_PASSWORD, data).then((r) => r.data);
  },

  adminChangePassword(data: AdminChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.put(PROFILE.ADMIN_CHANGE_PASSWORD, data).then((r) => r.data);
  },
};
