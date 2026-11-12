import type { Ref } from 'react'

// Hand-drawn crab for the intro, drawn on a 360×250 canvas with feet resting on
// the bottom edge. Left-side parts are mirrored to build the right side.
const mirror = 'matrix(-1 0 0 1 360 0)'

// Walking legs, front to back. Each is outlined as a tapered, pointed leg whose
// inner end tucks under the shell so the shell's fill hides the join.
const legs = [
  'M104 150C86 138 68 130 54 132C44 158 38 204 34 244C46 210 56 178 64 154C78 154 92 160 108 168',
  'M110 168C94 160 80 158 70 160C64 186 62 218 62 246C70 222 76 198 80 178C92 178 102 182 114 186',
  'M126 180C112 180 102 182 94 186C92 206 94 228 96 246C102 228 104 212 106 200C114 198 122 194 132 188',
]

// Alternating tripod gait: legs in phase "a" lift while legs in phase "b" plant.
const leftPhases = ['a', 'b', 'a'] as const
const rightPhases = ['b', 'a', 'b'] as const

function Claw() {
  return <g data-crab-claw>
    <path d="M100 130C84 124 72 116 66 104" />
    <path d="M98 148C74 144 58 130 54 110" />
    <path d="M54 110C40 98 30 82 30 64C30 44 40 28 54 24C46 34 42 46 48 58C56 50 64 42 72 40C76 52 74 68 70 82C68 92 66 100 66 104" />
    <path d="M40 74C42 80 46 84 52 86" />
  </g>
}

export function IntroCrab({ ref }: { ref?: Ref<SVGSVGElement> }) {
  return <svg ref={ref} className="sb-intro-crab" viewBox="0 0 360 250" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {legs.map((d, index) => <path key={`l${index}`} d={d} data-crab-leg={leftPhases[index]} />)}
    <g transform={mirror}>{legs.map((d, index) => <path key={`r${index}`} d={d} data-crab-leg={rightPhases[index]} />)}</g>
    <g data-crab-body>
      <Claw />
      <g transform={mirror}><Claw /></g>
      <path d="M140 106C136 98 132 90 129 83M150 103C146 96 142 89 140 82M220 106C224 98 228 90 231 83M210 103C214 96 218 89 220 82" />
      <path className="sb-intro-crab-fill" d="M86 156C88 120 128 98 180 98C232 98 272 120 274 156C266 184 228 198 180 198C132 198 94 184 86 156Z" />
      <path d="M130 132C136 124 146 119 156 119M204 119C214 119 224 124 230 132" />
      <path d="M168 168C174 175 186 175 192 168" />
      <circle className="sb-intro-crab-fill" cx="132" cy="70" r="13" />
      <circle className="sb-intro-crab-fill" cx="228" cy="70" r="13" />
      <circle cx="136" cy="71" r="5.5" fill="currentColor" stroke="none" />
      <circle cx="232" cy="71" r="5.5" fill="currentColor" stroke="none" />
      <g transform="rotate(-8 180 100)">
        <path className="sb-intro-crab-fill" d="M156 101L151 64L168 80L180 50L192 80L209 64L204 101C190 105 170 105 156 101Z" />
        <path d="M154 89C170 93 190 93 206 89" />
        <circle className="sb-intro-crab-fill" cx="151" cy="60" r="3.5" />
        <circle className="sb-intro-crab-fill" cx="180" cy="46" r="4" />
        <circle className="sb-intro-crab-fill" cx="209" cy="60" r="3.5" />
        <circle cx="180" cy="96" r="2.2" />
        <circle cx="166" cy="95.5" r="1.6" />
        <circle cx="194" cy="95.5" r="1.6" />
      </g>
    </g>
  </svg>
}
