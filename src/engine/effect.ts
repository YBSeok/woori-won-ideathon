export type EffectInput = {
  maturityVolume: number;
  retentionDelta: number;
  fundingGap: number;
  conversionAmount: number;
  feeRate: number;
};

export type EffectResult = {
  fundingSave: number;
  feeIncome: number;
  total: number;
};

export const EFFECT_DEFAULTS: EffectInput = {
  maturityVolume: 100_000_000_000_000,
  retentionDelta: 0.01,
  fundingGap: 0.003,
  conversionAmount: 500_000_000_000,
  feeRate: 0.005,
};

export function annualEffect(input: EffectInput): EffectResult {
  const fundingSave = input.maturityVolume * input.retentionDelta * input.fundingGap;
  const feeIncome = input.conversionAmount * input.feeRate;
  return { fundingSave, feeIncome, total: fundingSave + feeIncome };
}
