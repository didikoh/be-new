export interface UpdateProfileRequest {
  name: string;
  birthday: string;
  phone: string;
  role: string;
  user_id: string | number;
  profile_pic?: File;
}

export interface ChangePasswordRequest {
  phone: string;
  password_old: string;
  password_new: string;
  user_id: string | number;
}

export interface AdminChangePasswordRequest {
  user_id: string | number;
  role: string;
  password_new: string;
}
