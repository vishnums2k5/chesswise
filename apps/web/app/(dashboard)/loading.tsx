export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50" />
        <p className="animate-pulse text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
