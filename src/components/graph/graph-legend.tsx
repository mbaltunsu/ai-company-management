"use client";

interface LegendItem {
  color: string;
  label: string;
}

const items: LegendItem[] = [
  { color: "#f59e0b", label: "High Activity" },
  { color: "#6366f1", label: "Medium Activity" },
  { color: "#52525b", label: "Low Activity" },
  { color: "#6366f199", label: "Agent" },
];

export function GraphLegend() {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded-xl bg-[#111113]/80 p-3 backdrop-blur-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-[#a1a1aa]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
