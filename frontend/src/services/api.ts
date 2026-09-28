const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8765";


export type LoginResponse = {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
};


export type CurrentUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
};


export type Device = {
  id: number;
  device_uid: string;
  name: string;
  device_type: string;
  status: string;
  ip_address: string | null;
  last_seen_at: string | null;
  created_at: string;
};


export type DeviceModeOption = {
  key: string;
  label: string;
  landing_path: string;
};


export type DeviceModeResponse = {
  device_id: number;
  device_uid: string;
  desired_mode: string;
  current_mode: string | null;
  label: string;
  landing_path: string;
  modes: DeviceModeOption[];
};


async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(
    options.headers,
  );

  headers.set(
    "Content-Type",
    "application/json",
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      "Something went wrong. Please try again.";

    throw new Error(
      typeof message === "string"
        ? message
        : "Request failed.",
    );
  }

  return data as T;
}


export function login(
  email: string,
  password: string,
) {
  return request<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );
}


export function getCurrentUser(
  token: string,
) {
  return request<CurrentUser>(
    "/api/auth/me",
    {
      method: "GET",
    },
    token,
  );
}


export function getDevices(
  token: string,
) {
  return request<Device[]>(
    "/api/devices",
    {
      method: "GET",
    },
    token,
  );
}


export function getDeviceMode(
  deviceId: number,
  token: string,
) {
  return request<DeviceModeResponse>(
    `/api/devices/${deviceId}/mode`,
    {
      method: "GET",
    },
    token,
  );
}


export function setDeviceMode(
  deviceId: number,
  modeKey: string,
  token: string,
) {
  return request<DeviceModeResponse>(
    `/api/devices/${deviceId}/mode`,
    {
      method: "POST",
      body: JSON.stringify({
        mode_key: modeKey,
      }),
    },
    token,
  );
}