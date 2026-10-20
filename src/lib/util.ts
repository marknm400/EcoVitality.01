import type { CSSProperties } from 'react'
export const sv = (o: Record<string, string | number>) => o as unknown as CSSProperties
export const mkRng = (seed = 7) => { let s = seed; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296 }
export const RM = '(prefers-reduced-motion: reduce)'
export const GATES = [RM] // só "movimento reduzido" desliga as animações; celular e tablet recebem a versão animada, adaptada por CSS
export const COMPACT = '(max-width: 720px)'
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const isStatic = () => GATES.some(q => matchMedia(q).matches)
