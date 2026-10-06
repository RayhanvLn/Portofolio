/**
 * Outline of a card with a notch cut into its bottom-right corner (the caption sits
 * in the notch). Returns an SVG path in pixels for a box of width × height:
 *
 *   ╭──────────────────────╮
 *   │                      │
 *   │                      │
 *   │          ╭───────────╯   ← raised edge (notchH above the bottom)
 *   ╰─────────╯   Caption 01      ← diagonal step, caption in the notch
 *
 * Corners stay round and the diagonal keeps its angle at any size (computed, not stretched).
 */
export interface NotchSpec {
  width: number;
  height: number;
  /** Width of the raised part (= caption width). */
  notchW: number;
  /** Height of the notch (= caption height). */
  notchH: number;
  radius?: number;
  /** Horizontal run of the diagonal step (default ≈ notch height). */
  diag?: number;
  /** Rounding at both ends of the diagonal. */
  curve?: number;
}

const f = (n: number) => Math.round(n * 10) / 10;

export function notchPath({ width: W, height: H, notchW, notchH, radius = 18, diag, curve = 10 }: NotchSpec): string {
  if (!(W > 40 && H > 40)) return '';
  const s = 0.5; // half the 1px stroke: keeps the line crisp and inside the box
  const L = s;
  const T = s;
  const R = W - s;
  const B = H - s;
  const nh = Math.max(0, Math.min(notchH, H * 0.4));
  const r = Math.max(2, Math.min(radius, (H - nh) / 3, W / 6));
  const d = Math.max(4, diag ?? nh * 1.05);
  const nw = Math.max(r + 4, Math.min(notchW, W - r * 2 - d - 4));
  const raised = B - nh;
  const x1 = R - nw; // top of the diagonal
  const x2 = x1 - d; // bottom of the diagonal
  const len = Math.hypot(d, nh) || 1;
  const ux = d / len;
  const uy = nh / len;
  const c = Math.min(curve, len / 3);

  if (nh < 1) {
    return `M${f(L + r)},${f(T)} H${f(R - r)} Q${f(R)},${f(T)} ${f(R)},${f(T + r)} V${f(B - r)} Q${f(R)},${f(B)} ${f(R - r)},${f(B)} H${f(L + r)} Q${f(L)},${f(B)} ${f(L)},${f(B - r)} V${f(T + r)} Q${f(L)},${f(T)} ${f(L + r)},${f(T)} Z`;
  }
  return [
    `M${f(L + r)},${f(T)}`,
    `H${f(R - r)}`,
    `Q${f(R)},${f(T)} ${f(R)},${f(T + r)}`,
    `V${f(raised - r)}`,
    `Q${f(R)},${f(raised)} ${f(R - r)},${f(raised)}`,
    `H${f(x1 + c)}`,
    `Q${f(x1)},${f(raised)} ${f(x1 - c * ux)},${f(raised + c * uy)}`,
    `L${f(x2 + c * ux)},${f(B - c * uy)}`,
    `Q${f(x2)},${f(B)} ${f(x2 - c)},${f(B)}`,
    `H${f(L + r)}`,
    `Q${f(L)},${f(B)} ${f(L)},${f(B - r)}`,
    `V${f(T + r)}`,
    `Q${f(L)},${f(T)} ${f(L + r)},${f(T)}`,
    'Z',
  ].join(' ');
}
