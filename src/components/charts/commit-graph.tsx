"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { GitHubCommit } from "@/types";

interface CommitGraphProps {
  commits: GitHubCommit[];
}

function aggregateByDay(commits: GitHubCommit[]) {
  const counts: Record<string, number> = {};

  for (const commit of commits) {
    const date = new Date(commit.date).toISOString().split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  }

  // Fill in missing days in the range
  const dates = Object.keys(counts).sort();
  if (dates.length === 0) return [];

  const start = new Date(dates[0]);
  const end = new Date(dates[dates.length - 1]);
  const result: { date: string; commits: number }[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    result.push({ date: key, commits: counts[key] || 0 });
  }

  return result;
}

export function CommitGraph({ commits }: CommitGraphProps) {
  const data = aggregateByDay(commits);

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">No commit data to display</p>
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickFormatter={(value: string) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#201f20",
              border: "1px solid #1f1f23",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#f8f8f8",
            }}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#commitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
