import type { BacktestResult } from "../lib/signal-backtest";

export function BacktestCard({
  result,
  symbol,
  timeframe,
  horizon,
}: {
  result: BacktestResult;
  symbol: string;
  timeframe: string;
  horizon: number;
}) {
  const winRateClasses =
    result.winRate >= 60
      ? "text-emerald-400"
      : result.winRate >= 50
        ? "text-amber-400"
        : "text-rose-400";
  const horizonLabel =
    horizon === 1 ? "1 candle ahead" : `${horizon} candles ahead`;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-100 sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Historical performance
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-100">{symbol}</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {timeframe} / {horizonLabel}
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Total signals
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">
            {result.totalSignals}
          </dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Wins
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">{result.wins}</dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Losses
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">{result.losses}</dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Neutral
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">{result.neutral}</dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Historical win rate
          </dt>
          <dd className={`mt-2 font-medium ${winRateClasses}`}>
            {result.winRate}%
          </dd>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Average return
          </dt>
          <dd className="mt-2 font-medium text-zinc-100">
            {result.averageReturnPercent}%
          </dd>
        </div>
      </dl>

      <p className="mt-6 border-t border-zinc-800 pt-5 text-sm text-zinc-500">
        Historical results do not guarantee future performance.
      </p>
    </section>
  );
}
