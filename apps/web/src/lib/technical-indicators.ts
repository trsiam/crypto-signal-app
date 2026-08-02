function calculateEmaSeries(
  values: number[],
  period: number,
): Array<number | null> {
  const multiplier = 2 / (period + 1);
  const output: Array<number | null> = Array(values.length).fill(null);

  if (values.length < period) {
    return output;
  }

  const firstAverage =
    values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  output[period - 1] = firstAverage;

  for (let index = period; index < values.length; index += 1) {
    const previousEma = output[index - 1];

    if (previousEma === null) {
      continue;
    }

    output[index] = (values[index] - previousEma) * multiplier + previousEma;
  }

  return output;
}

export function calculateSma(
  values: number[],
  period: number,
): Array<number | null> {
  const output: Array<number | null> = Array(values.length).fill(null);

  for (let index = period - 1; index < values.length; index += 1) {
    const recentValues = values.slice(index - period + 1, index + 1);
    const total = recentValues.reduce((sum, value) => sum + value, 0);
    output[index] = total / period;
  }

  return output;
}

export function calculateRsi(
  values: number[],
  period: number,
): Array<number | null> {
  if (values.length < 2) {
    return Array(values.length).fill(null);
  }

  const changes = values.slice(1).map((value, index) => {
    const change = value - values[index];

    return {
      gain: change > 0 ? change : 0,
      loss: change < 0 ? Math.abs(change) : 0,
    };
  });

  const output: Array<number | null> = Array(values.length).fill(null);

  for (let index = period; index < values.length; index += 1) {
    const recentChanges = changes.slice(index - period + 1, index + 1);
    const averageGain =
      recentChanges.reduce((sum, change) => sum + change.gain, 0) / period;
    const averageLoss =
      recentChanges.reduce((sum, change) => sum + change.loss, 0) / period;

    if (averageLoss === 0) {
      output[index] = 100;
      continue;
    }

    output[index] = 100 - 100 / (1 + averageGain / averageLoss);
  }

  return output;
}

export function calculateEma(
  values: number[],
  period: number,
): Array<number | null> {
  return calculateEmaSeries(values, period);
}

export type MacdPoint = {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
};

export function calculateMacd(
  values: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MacdPoint[] {
  const fastEmaValues = calculateEmaSeries(values, fastPeriod);
  const slowEmaValues = calculateEmaSeries(values, slowPeriod);
  const macdLineValues = values.map((_, index) => {
    const fastEma = fastEmaValues[index];
    const slowEma = slowEmaValues[index];

    if (fastEma === null || slowEma === null) {
      return null;
    }

    return fastEma - slowEma;
  });

  const macdAvailable = macdLineValues
    .map((value, index) => ({ value, index }))
    .filter(
      (
        item,
      ): item is {
        value: number;
        index: number;
      } => item.value !== null,
    );

  const signalValues: Array<number | null> = Array(values.length).fill(null);

  if (macdAvailable.length >= signalPeriod) {
    const macdSeries = macdAvailable.map((item) => item.value);
    const emaSeries = calculateEmaSeries(macdSeries, signalPeriod);

    emaSeries.forEach((signalValue, compactIndex) => {
      if (signalValue === null) {
        return;
      }

      const sourceIndex = macdAvailable[compactIndex].index;
      signalValues[sourceIndex] = signalValue;
    });
  }

  return values.map((_, index) => {
    const macd = macdLineValues[index];
    const signal = signalValues[index];

    if (macd === null || signal === null) {
      return {
        macd: macd,
        signal,
        histogram: null,
      };
    }

    return {
      macd,
      signal,
      histogram: macd - signal,
    };
  });
}
