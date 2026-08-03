import type { SignalResult } from "../lib/signal-engine";

export function SignalCard({
  signal,
  symbol,
  timeframe,
}: {
  signal: SignalResult;
  symbol: string;
  timeframe: string;
}) {
  const badgeClasses =
    signal.signal === "Buy"
      ? "bg-emerald-500 text-zinc-950"
      : signal.signal === "Sell"
        ? "bg-rose-500 text-white"
        : "bg-amber-400 text-zinc-950";

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-100 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Live signal
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100">{symbol}</h2>
          <p className="mt-1 text-sm text-zinc-400">{timeframe}</p>
        </div>

        <span
          className={`${badgeClasses} rounded-full px-4 py-1.5 text-sm font-semibold`}
        >
          {signal.signal}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Signal
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">{signal.signal}</dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Direction
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">
            {signal.direction}
          </dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Confidence
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">
            {signal.confidence}%
          </dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Risk
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">
            {signal.risk} risk
          </dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Score
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">{signal.score}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-zinc-800 pt-5">
        <h3 className="text-sm font-semibold text-zinc-200">
          Why this signal
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400 marker:text-zinc-600">
          {signal.reasons.map((reason, index) => (
            <li key={`${reason}-${index}`}>{reason}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
