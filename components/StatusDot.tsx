import { SOURCE_STATUS_COLOR, SOURCE_STATUS_LABEL } from "@/lib/colors";
import { formatRelativeTime } from "@/lib/format";
import type { SourceStatus } from "@/lib/types";

export function StatusDot({
  status,
  lastUpdated,
  error,
}: {
  status: SourceStatus;
  lastUpdated: string | null;
  error?: string;
}) {
  const title = error
    ? `${SOURCE_STATUS_LABEL[status]} — ${error}`
    : `${SOURCE_STATUS_LABEL[status]} — updated ${formatRelativeTime(lastUpdated)}`;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-subtle" title={title}>
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: SOURCE_STATUS_COLOR[status] }}
      />
      {SOURCE_STATUS_LABEL[status]}
    </span>
  );
}
