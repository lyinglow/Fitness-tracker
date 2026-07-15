export function StravaConnect({ connected, error }: { connected: boolean; error: string | null }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {connected ? (
        <form action="/api/strava/disconnect" method="POST">
          <button
            type="submit"
            className="rounded-md border border-border px-2.5 py-1 font-medium text-foreground hover:bg-[var(--gridline)]"
            title="Disconnect Strava"
          >
            <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--status-good)]" />
            Strava connected
          </button>
        </form>
      ) : (
        <a
          href="/api/strava/authorize"
          className="rounded-md border border-border px-2.5 py-1 font-medium text-foreground hover:bg-[var(--gridline)]"
        >
          Connect Strava
        </a>
      )}
      {error && <span className="text-[var(--status-critical)]">{error}</span>}
    </div>
  );
}
