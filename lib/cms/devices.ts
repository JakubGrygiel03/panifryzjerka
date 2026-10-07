export type DeviceVisibility = {
  phone: boolean;
  tablet: boolean;
  desktop: boolean;
};

export const ALL_DEVICES: DeviceVisibility = { phone: true, tablet: true, desktop: true };

export function deviceToken(value?: Partial<DeviceVisibility> | null) {
  const devices = { ...ALL_DEVICES, ...value };
  const token = `${devices.phone ? "p" : ""}${devices.tablet ? "t" : ""}${devices.desktop ? "d" : ""}`;
  return token || "none";
}

export function normalizeDevices(value: unknown): DeviceVisibility {
  if (!value || typeof value !== "object") return { ...ALL_DEVICES };
  const row = value as Partial<DeviceVisibility>;
  return {
    phone: row.phone !== false,
    tablet: row.tablet !== false,
    desktop: row.desktop !== false,
  };
}
