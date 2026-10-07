"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { ALL_DEVICES, type DeviceVisibility } from "@/lib/cms/devices";

const ITEMS = [
  { key: "phone", label: "Telefon", icon: Smartphone },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "desktop", label: "Komputer", icon: Monitor },
] as const;

export function DeviceToggles({
  value,
  onChange,
}: {
  value?: DeviceVisibility;
  onChange: (next: DeviceVisibility) => void;
}) {
  const current = value ?? ALL_DEVICES;
  return (
    <div className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const on = current[item.key];
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange({ ...current, [item.key]: !current[item.key] })}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-ink text-white" : "bg-white text-mauve ring-1 ring-pink-100"}`}
          >
            <Icon size={14} aria-hidden />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
