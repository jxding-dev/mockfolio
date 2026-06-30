/**
 * Gaussian elimination (8×8 augmented) to solve for homography coefficients.
 */
function solve8(A: number[][], b: number[]): number[] {
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < 8; col++) {
    let maxRow = col;
    for (let r = col + 1; r < 8; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const f = M[r][col] / pivot;
      for (let c = col; c <= 8; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[8] / row[i]);
}

/**
 * Compute CSS matrix3d string that maps a w×h image element to four destination
 * points (TL, TR, BL, BR) in stage-pixel coordinates.
 *
 * Apply to the image element with:
 *   position: absolute; left: 0; top: 0;
 *   width: ${w}px; height: ${h}px;
 *   transform-origin: 0 0;
 *   transform: <result of this function>
 */
export function quadToMatrix3d(
  w: number,
  h: number,
  dst: [[number, number], [number, number], [number, number], [number, number]]
): string {
  const src: [number, number][] = [[0, 0], [w, 0], [0, h], [w, h]];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i];
    const [dx, dy] = dst[i];
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dx, dy);
  }
  const h_ = solve8(A, b);
  // h_ = [h00,h01,h02,h10,h11,h12,h20,h21], h22=1
  // CSS matrix3d (column-major):
  // | h00 h10  0  h20 |
  // | h01 h11  0  h21 |
  // |   0   0  1    0 |
  // | h02 h12  0    1 |
  return `matrix3d(${h_[0]},${h_[3]},0,${h_[6]},${h_[1]},${h_[4]},0,${h_[7]},0,0,1,0,${h_[2]},${h_[5]},0,1)`;
}

/** Bilinear interpolation on a unit quad (u,v in [0,1]). */
export function bilinear(
  tl: [number, number], tr: [number, number],
  bl: [number, number], br: [number, number],
  u: number, v: number
): [number, number] {
  const a = 1 - u, b = 1 - v;
  return [
    a * b * tl[0] + u * b * tr[0] + a * v * bl[0] + u * v * br[0],
    a * b * tl[1] + u * b * tr[1] + a * v * bl[1] + u * v * br[1],
  ];
}

/**
 * Compute affine 2×3 matrix that maps triangle (s0,s1,s2) → (d0,d1,d2).
 * Returns [a,b,c,d,e,f] for ctx.transform(a,b,c,d,e,f).
 */
export function triangleAffine(
  s0: [number, number], s1: [number, number], s2: [number, number],
  d0: [number, number], d1: [number, number], d2: [number, number]
): [number, number, number, number, number, number] {
  const [x0, y0] = s0, [x1, y1] = s1, [x2, y2] = s2;
  const [u0, v0] = d0, [u1, v1] = d1, [u2, v2] = d2;
  const det = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
  if (Math.abs(det) < 1e-8) return [1, 0, 0, 1, 0, 0];
  const a = (u0 * (y1 - y2) + u1 * (y2 - y0) + u2 * (y0 - y1)) / det;
  const b = (v0 * (y1 - y2) + v1 * (y2 - y0) + v2 * (y0 - y1)) / det;
  const c = (x0 * (u1 - u2) + x1 * (u2 - u0) + x2 * (u0 - u1)) / det;
  const d = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / det;
  const e = (x0 * (y1 * u2 - y2 * u1) + x1 * (y2 * u0 - y0 * u2) + x2 * (y0 * u1 - y1 * u0)) / det;
  const f = (x0 * (y1 * v2 - y2 * v1) + x1 * (y2 * v0 - y0 * v2) + x2 * (y0 * v1 - y1 * v0)) / det;
  return [a, b, c, d, e, f];
}
