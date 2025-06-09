/**
 * 정규분포의 역함수(Inverse Normal Distribution Function)
 * Beasley-Springer-Moro 알고리즘을 사용하여 근사값을 계산합니다.
 * @param p - 확률 (0 < p < 1)
 * @returns - 해당 확률에 대한 z-score
 */
export function normInv(p: number): number {
  // Beasley-Springer-Moro approximation
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

  const p_low = 0.02425;
  const p_high = 1 - p_low;
  
  let q: number, r: number, ret: number;

  if (p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    ret = (((((c[4] * q + c[3]) * q + c[2]) * q + c[1]) * q + c[0]) /
           ((((d[3] * q + d[2]) * q + d[1]) * q + d[0]) * q + 1));
  } else if (p <= p_high) {
    q = p - 0.5;
    r = q * q;
    ret = (((((a[5] * r + a[4]) * r + a[3]) * r + a[2]) * r + a[1]) * r + a[0]) * q /
          (((((b[4] * r + b[3]) * r + b[2]) * r + b[1]) * r + 1));
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    ret = -(((((c[4] * q + c[3]) * q + c[2]) * q + c[1]) * q + c[0]) /
            ((((d[3] * q + d[2]) * q + d[1]) * q + d[0]) * q + 1));
  }
  return ret;
} 