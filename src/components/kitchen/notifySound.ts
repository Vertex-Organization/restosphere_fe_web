export type KitchenSound = 'new-dish' | 'start' | 'complete'

export const DEFAULT_VOLUME = 0.8

interface Note {
  frequency: number
  at: number
  peak: number
  decay: number
  wave: OscillatorType
  partials: readonly number[]
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5

const BELL_PARTIALS = [1, 0.35, 0.18] as const

function bell(frequency: number, at: number, peak: number, decay: number): Note {
  return { frequency, at, peak, decay, wave: 'sine', partials: BELL_PARTIALS }
}

function knock(at: number): Note {
  return { frequency: 900, at, peak: 0.5, decay: 0.06, wave: 'triangle', partials: [1] }
}

const SOUNDS: Record<KitchenSound, Note[]> = {
  'new-dish': [0, 0.5].flatMap((offset) => [
    bell(E5, offset, 0.7, 0.8),
    bell(G5, offset + 0.15, 0.7, 0.8),
    bell(C6, offset + 0.3, 0.7, 0.9),
  ]),
  start: [knock(0), knock(0.12)],
  complete: [
    bell(C5, 0, 0.45, 0.6),
    bell(E5, 0.08, 0.45, 0.6),
    bell(G5, 0.16, 0.45, 0.6),
    bell(C6, 0.24, 0.5, 0.8),
  ],
}

export const VIBRATION_PATTERNS: Record<KitchenSound, number[]> = {
  'new-dish': [300, 120, 300, 120, 300],
  start: [80],
  complete: [150, 80, 150],
}

interface Chain {
  ctx: AudioContext
  master: GainNode
  input: DynamicsCompressorNode
}

let chain: Chain | null = null
let volume = DEFAULT_VOLUME

function audioChain() {
  if (chain) return chain
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    const ctx = new Ctor()
    const input = ctx.createDynamicsCompressor()
    const master = ctx.createGain()
    master.gain.value = volume
    input.connect(master)
    master.connect(ctx.destination)
    chain = { ctx, master, input }
  } catch {
    chain = null
  }
  return chain
}

export function setMasterVolume(next: number) {
  volume = Math.min(1, Math.max(0, next))
  if (chain) chain.master.gain.value = volume
}

export function unlockAudio() {
  const current = audioChain()
  if (current && current.ctx.state === 'suspended') void current.ctx.resume().catch(() => undefined)
}

function playNote({ ctx, input }: Chain, note: Note, origin: number) {
  const from = origin + note.at
  const to = from + note.decay
  note.partials.forEach((level, index) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = note.wave
    oscillator.frequency.value = note.frequency * (index + 1)
    gain.gain.setValueAtTime(0.0001, from)
    gain.gain.exponentialRampToValueAtTime(note.peak * level, from + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, to)
    oscillator.connect(gain)
    gain.connect(input)
    oscillator.start(from)
    oscillator.stop(to + 0.02)
  })
}

export function playKitchenSound(sound: KitchenSound) {
  const current = audioChain()
  if (!current) return
  if (current.ctx.state === 'suspended') void current.ctx.resume().catch(() => undefined)
  const origin = current.ctx.currentTime + 0.02
  for (const note of SOUNDS[sound]) playNote(current, note, origin)
}

export function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export function vibrateDevice(sound: KitchenSound) {
  if (!canVibrate()) return false
  try {
    return navigator.vibrate(VIBRATION_PATTERNS[sound])
  } catch {
    return false
  }
}
