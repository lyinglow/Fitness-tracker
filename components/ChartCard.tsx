export function ChartCard({
  title,
  subtitle,
  tableHeaders,
  tableRows,
  children,
}: {
  title: string;
  subtitle?: string;
  tableHeaders: string[];
  tableRows: (string | number)[][];
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-subtle">{subtitle}</p>}
        </div>
        <details className="text-xs text-subtle">
          <summary className="cursor-pointer select-none hover:text-foreground">Table</summary>
          <div className="absolute right-3 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-surface p-2 shadow-lg">
            <table className="text-xs [font-variant-numeric:tabular-nums]">
              <thead>
                <tr>
                  {tableHeaders.map((h) => (
                    <th key={h} className="pr-3 text-left font-medium text-subtle">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="pr-3 text-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
