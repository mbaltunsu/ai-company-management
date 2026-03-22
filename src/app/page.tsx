import { Header } from "@/components/layout/header";

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {["Total Projects", "Active Agents", "Open Issues", "Commits This Week"].map(
            (label) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">—</p>
              </div>
            )
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="col-span-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              No activity yet. Connect a project to get started.
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Project Health</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              No projects registered yet.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
