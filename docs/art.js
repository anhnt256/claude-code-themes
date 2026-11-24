// Illustrated scenes. Unlike the wide landscapes in scenes.js, these are drawn in window pixels
// and pinned to the corners, so the characters stay clear of the conversation in the middle.
// Each scene returns { defs, full, tl, tr, bl, br }: full is behind everything, the rest are
// measured from one corner (bl: x right, y up is negative; br: x left is negative; and so on).

const n1 = (x) => +x.toFixed(1)
const EASE = 'calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"'
/** Rocks its parent between two angles around a point, easing in and out. */
const rock = (a, b, cx, cy, dur, begin = 0) => `<animateTransform attributeName="transform" type="rotate" values="${a} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy}" dur="${n1(dur)}s" begin="-${n1(begin)}s" repeatCount="indefinite" ${EASE}/>`
/** Eases one attribute there and back. */
const pulse = (attr, a, b, dur, begin = 0) => `<animate attributeName="${attr}" values="${a};${b};${a}" dur="${n1(dur)}s" begin="-${n1(begin)}s" repeatCount="indefinite" ${EASE}/>`
const blink = (ry, dur, begin = 0) => `<animate attributeName="ry" values="${ry};${ry};0.6;${ry};${ry}" keyTimes="0;.9;.94;.98;1" dur="${n1(dur)}s" begin="-${n1(begin)}s" repeatCount="indefinite"/>`
const pick = (r, list) => list[Math.floor(r() * list.length)]

const INK = '#2a2430', CREAM = '#fbf3e4', PINK = '#f29aa8'
const wood = (light) => (light ? ['#e2c193', '#c9a473', '#a9814f'] : ['#6e4d36', '#573b29', '#3d2a1d'])

export const STYLE_ART = `.steam{animation:steam 4s ease-in-out infinite}.zz{animation:zz 4.5s ease-in-out infinite}.bounce{animation:bounce .62s cubic-bezier(.2,.65,.45,1) infinite alternate}`
  + `.squash{animation:squash .62s cubic-bezier(.2,.65,.45,1) infinite alternate}.roam{animation:roam 60s ease-in-out infinite alternate}.wing{animation:wing 44s linear infinite}.rail{animation:rail 46s linear infinite}`
  + `@keyframes steam{0%{transform:translate(0,6px);opacity:0}30%{opacity:.7}100%{transform:translate(6px,-34px);opacity:0}}`
  + `@keyframes zz{0%{transform:translate(0,0);opacity:0}25%{opacity:.9}100%{transform:translate(-22px,-46px);opacity:0}}`
  + `@keyframes bounce{from{transform:translate(0,0)}to{transform:translate(0,-150px)}}@keyframes squash{from{opacity:.3}to{opacity:.08}}`
  + `@keyframes roam{from{transform:translate(-36px,0)}to{transform:translate(44px,-8px)}}`
  + `@keyframes wing{from{transform:translate(-200px,0)}to{transform:translate(3400px,-160px)}}`
  + `@keyframes rail{0%{transform:translate(-1100px,0)}34%,100%{transform:translate(4200px,0)}}`

// A window onto the weather, hung from the top-right corner. Shared by the room scenes.
function pane(p, r, x, uid) {
  const night = !x.light, X = -330, Y = 78, Wd = 230, Hd = 270
  const stars = night ? Array.from({ length: 12 }, () => `<circle class="tw" cx="${n1(X + 14 + r() * (Wd - 28))}" cy="${n1(Y + 12 + r() * 150)}" r="${n1(0.9 + r() * 1.3)}" fill="#fff" style="animation-duration:${n1(2 + r() * 4)}s;animation-delay:-${n1(r() * 5)}s"/>`).join('') : ''
  const cloud = (cx, cy, s) => `<g class="roam" style="animation-duration:${n1((40 + r() * 30) / x.v)}s;animation-delay:-${n1(r() * 40)}s"><ellipse cx="${cx}" cy="${cy}" rx="${34 * s}" ry="${12 * s}" fill="#fff" opacity="${night ? 0.16 : 0.92}"/><ellipse cx="${cx - 12 * s}" cy="${cy - 9 * s}" rx="${16 * s}" ry="${11 * s}" fill="#fff" opacity="${night ? 0.16 : 0.92}"/></g>`
  return `<rect x="${X + 10}" y="${Y + 12}" width="${Wd}" height="${Hd}" rx="6" fill="${INK}" opacity=".18"/>`
    + `<svg x="${X}" y="${Y}" width="${Wd}" height="${Hd}" viewBox="${X} ${Y} ${Wd} ${Hd}"><rect x="${X}" y="${Y}" width="${Wd}" height="${Hd}" fill="url(#pane${uid})"/>${stars}`
    + (night ? `<circle cx="${X + 168}" cy="${Y + 62}" r="26" fill="#fdf3cf"/><circle cx="${X + 180}" cy="${Y + 54}" r="24" fill="url(#pane${uid})"/>` : `<circle cx="${X + 166}" cy="${Y + 64}" r="28" fill="#ffd978"/>`)
    + cloud(X + 70, Y + 110, 1) + cloud(X + 150, Y + 170, 0.8)
    + `<path d="M${X} ${Y + Hd} L${X} ${Y + 214} Q${X + 60} ${Y + 180} ${X + 120} ${Y + 212} T${X + Wd} ${Y + 196} L${X + Wd} ${Y + Hd} Z" fill="${night ? '#1a2148' : '#8fc58a'}"/></svg>`
    + `<rect x="${X}" y="${Y}" width="${Wd}" height="${Hd}" rx="4" fill="none" stroke="${CREAM}" stroke-width="10"/><path d="M${X + Wd / 2} ${Y} v${Hd} M${X} ${Y + Hd / 2} h${Wd}" stroke="${CREAM}" stroke-width="6"/>`
    + `<rect x="${X - 16}" y="${Y + Hd + 2}" width="${Wd + 32}" height="12" rx="3" fill="${CREAM}"/>`
    + `<path d="M${X - 30} ${Y - 14} h${Wd + 60}" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`
    + `<path d="M${X - 22} ${Y - 12} c-4 90 14 190 -8 ${Hd + 6} l52 0 c-22 -70 -8 -200 -2 -${Hd + 6} Z" fill="${p.a}" opacity=".92"/><path d="M${X + Wd + 22} ${Y - 12} c4 90 -14 190 8 ${Hd + 6} l-52 0 c22 -70 8 -200 2 -${Hd + 6} Z" fill="${p.a}" opacity=".92"/>`
}
const paneDefs = (x, uid) => `<linearGradient id="pane${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${x.light ? '#7fc0f0' : '#141b45'}"/><stop offset="1" stop-color="${x.light ? '#e3f3fc' : '#41509a'}"/></linearGradient>`

// A row of lights along the top-left.
function lights(p, r, x) {
  const pts = Array.from({ length: 9 }, (_, i) => [i * 58 + 10, 26 + Math.sin((i / 8) * Math.PI) * 34])
  return `<path d="M-10 18 Q240 96 500 22" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".6"/>`
    + pts.map(([cx, cy], i) => { const col = [p.a, p.b, p.c, '#ffd978'][i % 4]; return `<g class="tw" style="animation-duration:${n1(2.4 + r() * 3)}s;animation-delay:-${n1(r() * 4)}s"><circle cx="${cx}" cy="${n1(cy + 14)}" r="16" fill="${col}" opacity=".22"/><ellipse cx="${cx}" cy="${n1(cy + 14)}" rx="6" ry="8" fill="${col}"/></g><rect x="${cx - 3}" y="${n1(cy + 3)}" width="6" height="5" fill="${INK}" opacity=".7"/>` }).join('')
}

function plant(cx, base, p, r, v) {
  const leaf = (a, len, col) => `<g><path d="M${cx} ${base - 44} q${n1(len * 0.5)} ${-len * 0.9} 0 ${-len} q${n1(-len * 0.5)} ${len * 0.1} 0 ${len} Z" fill="${col}" transform="rotate(${a} ${cx} ${base - 44})"/>${rock(-2.5, 2.5, cx, base - 44, (5 + r() * 3) / v, r() * 5)}</g>`
  return [[-52, 64, '#4f9a5d'], [-24, 84, '#63b06d'], [4, 92, '#4f9a5d'], [30, 78, '#6dbb78'], [56, 60, '#4f9a5d']].map(([a, l, c]) => leaf(a, l, c)).join('')
    + `<path d="M${cx - 30} ${base - 48} h60 l-8 48 h-44 Z" fill="${p.b}"/><rect x="${cx - 34}" y="${base - 54}" width="68" height="12" rx="4" fill="${p.b}"/><rect x="${cx - 34}" y="${base - 54}" width="68" height="12" rx="4" fill="${INK}" opacity=".12"/>`
}

export const ART = {
  // A cat asleep on a desk, with a lamp, a mug, a plant and a window.
  cat(p, r, x, uid) {
    const [w1, w2, w3] = wood(x.light), D = 64, v = x.v
    const [fur, dark] = pick(r, [['#eba55f', '#c97f3a'], ['#9b9ba6', '#74747f'], ['#463f4d', '#2c2733'], ['#f6ecd9', '#d8c4a2'], ['#b98a5e', '#8d6541']])
    const cx = -270, by = -D
    const cat = `<ellipse cx="${cx}" cy="${by + 2}" rx="132" ry="9" fill="${INK}" opacity=".22"/>`
      + `<g><path d="M${cx + 96} ${by - 26} C${cx + 150} ${by - 22} ${cx + 160} ${by - 62} ${cx + 126} ${by - 70}" fill="none" stroke="${fur}" stroke-width="17" stroke-linecap="round"/><path d="M${cx + 138} ${by - 62} q-4 -8 -12 -8" fill="none" stroke="${dark}" stroke-width="17" stroke-linecap="round"/>${rock(-5, 9, cx + 96, by - 26, 3.8 / v)}</g>`
      + `<ellipse cx="${cx}" cy="${by - 44}" rx="108" ry="45" fill="${fur}">${pulse('ry', 45, 48.5, 3.6 / v)}${pulse('cy', by - 44, by - 47.5, 3.6 / v)}</ellipse>`
      + [-30, 4, 38].map((dx) => `<path d="M${cx + dx} ${by - 88} q6 14 -2 26" fill="none" stroke="${dark}" stroke-width="7" stroke-linecap="round" opacity=".8"/>`).join('')
      + `<path d="M${cx - 118} ${by - 76} l-6 -40 l34 20 Z M${cx - 62} ${by - 82} l10 -40 l-36 16 Z" fill="${fur}"/><path d="M${cx - 114} ${by - 84} l-3 -20 l18 11 Z M${cx - 64} ${by - 88} l5 -20 l-19 9 Z" fill="${PINK}"/>`
      + `<ellipse cx="${cx - 90}" cy="${by - 50}" rx="46" ry="40" fill="${fur}"/>`
      + `<path d="M${cx - 112} ${by - 52} q8 7 16 0 M${cx - 84} ${by - 52} q8 7 16 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<path d="M${cx - 94} ${by - 40} l8 0 l-4 5 Z" fill="${PINK}"/><path d="M${cx - 90} ${by - 35} q-5 6 -10 2 M${cx - 90} ${by - 35} q5 6 10 2" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`
      + `<path d="M${cx - 120} ${by - 40} h-22 M${cx - 120} ${by - 34} l-20 6 M${cx - 60} ${by - 40} h22 M${cx - 60} ${by - 34} l20 6" stroke="${CREAM}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
      + `<ellipse cx="${cx - 104}" cy="${by - 8}" rx="20" ry="10" fill="${CREAM}"/><ellipse cx="${cx - 66}" cy="${by - 8}" rx="20" ry="10" fill="${CREAM}"/>`
      + [0, 1.5, 3].map((d, i) => `<path class="zz" style="animation-delay:-${d}s" d="M${cx - 130 - i * 4} ${by - 112} h${10 + i * 3} l-${10 + i * 3} ${10 + i * 3} h${10 + i * 3}" fill="none" stroke="${CREAM}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')
    const mug = `<path d="M-74 ${by - 40} c22 0 22 28 0 28" fill="none" stroke="${p.c}" stroke-width="7"/><rect x="-118" y="${by - 52}" width="46" height="52" rx="7" fill="${p.c}"/><rect x="-118" y="${by - 52}" width="46" height="9" rx="4" fill="${INK}" opacity=".18"/>`
      + [0, 1.4, 2.7].map((d, i) => `<path class="steam" style="animation-delay:-${d}s;animation-duration:${n1(4 / v)}s" d="M${-106 + i * 11} ${by - 60} q6 -8 0 -16 q-6 -8 0 -16" fill="none" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>`).join('')
    const lamp = `<path d="M96 ${by} h92 l-14 -12 h-64 Z" fill="${INK}"/><path d="M142 ${by - 10} L126 ${by - 150} L214 ${by - 236}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="126" cy="${by - 150}" r="7" fill="${p.a}"/>`
      + `<path d="M246 ${by - 198} L330 ${by - 4} L120 ${by - 4} Z" fill="url(#glow${uid})">${pulse('opacity', 0.9, 0.62, 5 / v)}</path>`
      + `<path d="M196 ${by - 254} l64 26 l-22 46 l-74 -30 Z" fill="${p.a}"/><ellipse cx="231" cy="${by - 208}" rx="34" ry="9" transform="rotate(22 231 ${by - 208})" fill="#ffe9a8"/>`
    const books = [[352, 150, 22, p.b], [364, 126, 20, p.c], [356, 138, 18, p.a]].reduce((acc, [bx, bw, bh, col]) => { acc.y -= bh; acc.s += `<rect x="${bx}" y="${acc.y}" width="${bw}" height="${bh}" rx="3" fill="${col}"/><rect x="${bx + 10}" y="${acc.y + 4}" width="8" height="${bh - 8}" fill="${CREAM}" opacity=".7"/>`; return acc }, { y: by, s: '' }).s
    return {
      defs: paneDefs(x, uid) + `<linearGradient id="glow${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient>`,
      full: '',
      tl: lights(p, r, x), tr: pane(p, r, x, uid),
      bl: `<rect x="-20" y="${by}" width="9000" height="${D + 20}" fill="${w1}"/><rect x="-20" y="${by}" width="9000" height="7" fill="${CREAM}" opacity=".22"/><rect x="-20" y="${by + 22}" width="9000" height="3" fill="${w3}" opacity=".5"/>` + lamp + books,
      br: plant(-520, by, p, r, v) + cat + mug,
      edge: w2,
    }
  },

  // A puppy waiting to play, with a ball that never stops bouncing.
  dog(p, r, x, uid) {
    const [w1, , w3] = wood(x.light), F = 58, by = -F, v = x.v
    const [fur, dark] = pick(r, [['#e6a45c', '#bd7c3b'], ['#a3adb8', '#6f7985'], ['#8f5f40', '#6c452d'], ['#f3ecdf', '#d6c8b0'], ['#3f3a46', '#2a2630']])
    const neck = [300, by - 150]
    const dog = `<ellipse cx="262" cy="${by + 2}" rx="110" ry="9" fill="${INK}" opacity=".22"/>`
      + `<g><path d="M204 ${by - 44} C160 ${by - 56} 150 ${by - 104} 180 ${by - 124}" fill="none" stroke="${fur}" stroke-width="19" stroke-linecap="round"/><path d="M168 ${by - 112} q4 -10 12 -12" fill="none" stroke="${CREAM}" stroke-width="19" stroke-linecap="round"/>${rock(-12, 16, 204, by - 44, 0.46 / v)}</g>`
      + `<ellipse cx="226" cy="${by - 22}" rx="46" ry="24" fill="${dark}"/>`
      + `<path d="M196 ${by - 30} C190 ${by - 120} 250 ${by - 176} 306 ${by - 150} C340 ${by - 120} 336 ${by - 40} 320 ${by - 4} L212 ${by - 4} Z" fill="${fur}"/>`
      + `<path d="M270 ${by - 132} C312 ${by - 136} 330 ${by - 90} 316 ${by - 8} L276 ${by - 8} C262 ${by - 60} 256 ${by - 100} 270 ${by - 132} Z" fill="${CREAM}"/>`
      + `<rect x="272" y="${by - 76}" width="22" height="74" rx="11" fill="${fur}"/><rect x="302" y="${by - 76}" width="22" height="74" rx="11" fill="${fur}"/><ellipse cx="284" cy="${by - 5}" rx="17" ry="9" fill="${CREAM}"/><ellipse cx="314" cy="${by - 5}" rx="17" ry="9" fill="${CREAM}"/>`
      + `<g><path d="M262 ${by - 222} l-22 -34 l48 14 Z" fill="${dark}"/><path d="M330 ${by - 228} l26 -30 l-48 8 Z" fill="${dark}"/>`
      + `<ellipse cx="298" cy="${by - 196}" rx="52" ry="46" fill="${fur}"/><ellipse cx="316" cy="${by - 180}" rx="32" ry="25" fill="${CREAM}"/>`
      + `<ellipse cx="282" cy="${by - 206}" rx="5.5" ry="6.5" fill="${INK}">${blink(6.5, 4.2)}</ellipse><ellipse cx="320" cy="${by - 208}" rx="5.5" ry="6.5" fill="${INK}">${blink(6.5, 4.2)}</ellipse>`
      + `<circle cx="284" cy="${by - 209}" r="1.8" fill="#fff"/><circle cx="322" cy="${by - 211}" r="1.8" fill="#fff"/>`
      + `<ellipse cx="266" cy="${by - 190}" rx="9" ry="5" fill="${PINK}" opacity=".6"/><ellipse cx="340" cy="${by - 192}" rx="8" ry="5" fill="${PINK}" opacity=".6"/>`
      + `<ellipse cx="322" cy="${by - 190}" rx="9" ry="6.5" fill="${INK}"/><path d="M322 ${by - 184} v8 q-10 10 -20 2 M322 ${by - 176} q10 10 20 2" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<ellipse cx="322" cy="${by - 164}" rx="8" ry="10" fill="${PINK}">${pulse('ry', 10, 13.5, 0.42 / v)}</ellipse>`
      + rock(-3.5, 4, neck[0], neck[1], 2.8 / v) + `</g>`
      + `<path d="M262 ${by - 142} q40 22 76 4" fill="none" stroke="${p.a}" stroke-width="9" stroke-linecap="round"/><circle cx="304" cy="${by - 126}" r="7" fill="#ffd978"/>`
    const ball = `<ellipse class="squash" cx="-210" cy="${by + 2}" rx="26" ry="6" fill="${INK}" style="animation-duration:${n1(0.62 / v)}s"/>`
      + `<g class="bounce" style="animation-duration:${n1(0.62 / v)}s"><circle cx="-210" cy="${by - 24}" r="24" fill="${p.a}"/><path d="M-233 ${by - 30} q23 -14 46 0 M-233 ${by - 18} q23 14 46 0" fill="none" stroke="${CREAM}" stroke-width="4"/></g>`
    const bowl = `<path d="M-420 ${by - 34} h100 l-12 34 h-76 Z" fill="${p.b}"/><ellipse cx="-370" cy="${by - 34}" rx="50" ry="9" fill="${INK}" opacity=".25"/><path d="M-388 ${by - 14} h36 M-392 ${by - 18} a5 5 0 1 0 0 8 M-348 ${by - 18} a5 5 0 1 1 0 8" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/>`
    const flags = `<path d="M-10 26 Q230 110 520 30" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".6"/>` + Array.from({ length: 9 }, (_, i) => { const fx = 14 + i * 56, fy = 30 + Math.sin(((i + 0.5) / 9) * Math.PI) * 38; return `<g><path d="M${fx} ${n1(fy)} l36 4 l-20 40 Z" fill="${[p.a, p.b, p.c][i % 3]}"/>${rock(-4, 4, fx + 18, n1(fy), (3 + r() * 2) / v, r() * 4)}</g>` }).join('')
    const paws = Array.from({ length: 5 }, (_, i) => { const px = 620 + i * 86, py = by - 150 - (i % 2) * 34; return `<g opacity=".14" fill="${INK}" transform="rotate(${-18 + (i % 2) * 30} ${px} ${py})"><ellipse cx="${px}" cy="${py}" rx="11" ry="9"/><circle cx="${px - 12}" cy="${py - 12}" r="4.5"/><circle cx="${px - 4}" cy="${py - 17}" r="4.5"/><circle cx="${px + 5}" cy="${py - 17}" r="4.5"/><circle cx="${px + 13}" cy="${py - 12}" r="4.5"/></g>` }).join('')
    return {
      defs: paneDefs(x, uid), full: '', tl: flags, tr: pane(p, r, x, uid),
      bl: `<rect x="-20" y="${by}" width="9000" height="${F + 20}" fill="${w1}"/><rect x="-20" y="${by}" width="9000" height="6" fill="${w3}" opacity=".45"/><ellipse cx="300" cy="${by + 30}" rx="290" ry="21" fill="${p.c}" opacity=".9"/><ellipse cx="300" cy="${by + 30}" rx="262" ry="15" fill="none" stroke="${CREAM}" stroke-width="3" opacity=".55"/>` + paws + dog,
      br: `<g transform="translate(100 0)">${bowl}${ball}</g>`,
    }
  },

  // A wide evening sky: towering clouds, wires, a train going home.
  anime(p, r, x, uid) {
    const v = x.v, day = x.light
    const cloud = (cx, cy, s, shade) => {
      const puffs = [[0, 0, 70], [-70, 26, 54], [72, 22, 58], [-28, -48, 54], [34, -62, 46], [-118, 52, 40], [124, 50, 42], [8, -104, 34]]
      return `<g class="roam" style="animation-duration:${n1((50 + r() * 40) / v)}s;animation-delay:-${n1(r() * 60)}s">`
        + puffs.map(([dx, dy, rad]) => `<circle cx="${n1(cx + dx * s)}" cy="${n1(cy + dy * s + 12 * s)}" r="${n1(rad * s)}" fill="${shade}"/>`).join('')
        + puffs.map(([dx, dy, rad]) => `<circle cx="${n1(cx + dx * s)}" cy="${n1(cy + dy * s)}" r="${n1(rad * s)}" fill="${puff}"/>`).join('')
        + `<rect x="${n1(cx - 170 * s)}" y="${n1(cy + 40 * s)}" width="${n1(340 * s)}" height="${n1(400 * s)}" fill="${puff}"/></g>`
    }
    const shade = day ? '#bcd8f2' : '#b98fca', puff = day ? '#ffffff' : '#ffe8d8'
    const roofs = (dir) => { let d = `M${dir * -40} 0`, px = 0; for (let i = 0; i < 9; i++) { const w = 70 + r() * 80, h = 44 + r() * 70; d += ` L${dir * px} ${-h} l${dir * w * 0.5} ${-26 - r() * 20} l${dir * w * 0.5} ${26} L${dir * (px + w)} 0`; px += w + 6 } return `<path d="${d} Z" fill="${INK}"/>` }
    const lit = (dir) => Array.from({ length: Math.round(8 + x.density * 14) }, () => `<rect class="tw" x="${n1(dir * (30 + r() * 700))}" y="${n1(-18 - r() * 34)}" width="9" height="11" fill="#ffd978" style="animation-duration:${n1(4 + r() * 6)}s;animation-delay:-${n1(r() * 8)}s"/>`).join('')
    const pole = `<rect x="-196" y="-470" width="12" height="470" fill="${INK}"/><rect x="-266" y="-446" width="152" height="9" fill="${INK}"/><rect x="-246" y="-404" width="112" height="8" fill="${INK}"/>`
      + [-258, -224, -156, -122].map((ix) => `<rect x="${ix}" y="-458" width="7" height="12" fill="${INK}"/>`).join('')
      + [[-258, -452, 150], [-224, -452, 190], [-240, -398, 240]].map(([wx, wy, sag]) => `<path d="M${wx} ${wy} Q${wx - 900} ${wy + sag} ${wx - 2400} ${wy - 60}" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M${wx + 106} ${wy} Q${wx + 300} ${wy + 40} ${wx + 700} ${wy - 20}" fill="none" stroke="${INK}" stroke-width="2.2"/>`).join('')
    const train = `<g class="rail" style="animation-duration:${n1(46 / v)}s">` + Array.from({ length: 5 }, (_, i) => `<rect x="${i * 196}" y="-70" width="188" height="44" rx="8" fill="${day ? '#f2f6fa' : '#3a3f63'}"/><rect x="${i * 196}" y="-40" width="188" height="6" fill="${p.a}"/>` + Array.from({ length: 6 }, (_, j) => `<rect x="${i * 196 + 12 + j * 29}" y="-62" width="20" height="16" rx="2" fill="${day ? '#6aa9de' : '#ffe9a8'}"/>`).join('')).join('') + `</g>`
    const birds = Array.from({ length: 5 }, (_, i) => `<g class="wing" style="animation-duration:${n1((40 + i * 5) / v)}s;animation-delay:-${n1(r() * 40)}s"><path d="M0 0 q8 -8 16 0 q8 -8 16 0" transform="translate(${i * 40} ${200 + i * 26 + r() * 30})" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"><animate attributeName="d" values="M0 0 q8 -8 16 0 q8 -8 16 0;M0 0 q8 4 16 0 q8 4 16 0;M0 0 q8 -8 16 0 q8 -8 16 0" dur="${n1(0.7 + r() * 0.3)}s" repeatCount="indefinite"/></path></g>`).join('')
    const petals = Array.from({ length: Math.round(10 + x.density * 40) }, () => `<g class="blow" style="animation-duration:${n1((14 + r() * 12) / v)}s;animation-delay:-${n1(r() * 26)}s"><path transform="translate(${n1(-r() * 1600)} ${n1(-80 - r() * 160)}) rotate(${Math.round(r() * 360)})" d="M0 0 C6 -9 19 -9 24 0 C19 9 6 9 0 0 Z" fill="${PINK}" opacity="${n1(0.6 + r() * 0.4)}"/></g>`).join('')
    return {
      defs: `<linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1">` + (day ? `<stop offset="0" stop-color="#2f7fe0"/><stop offset=".6" stop-color="#7fc0f0"/><stop offset="1" stop-color="#dff2fd"/>` : `<stop offset="0" stop-color="#151a45"/><stop offset=".5" stop-color="#4a3f8e"/><stop offset=".82" stop-color="${p.a}"/><stop offset="1" stop-color="#ffd9a0"/>`) + `</linearGradient>`
        + `<radialGradient id="sun${uid}"><stop offset="0" stop-color="#fff6d8"/><stop offset=".25" stop-color="#ffe9a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>`,
      sky: `url(#sky${uid})`,
      full: `<circle cx="74%" cy="${day ? '20%' : '86%'}" r="260" fill="url(#sun${uid})"/>`,
      tl: (day ? '' : Array.from({ length: Math.round(20 + x.density * 50) }, () => `<circle class="tw" cx="${n1(r() * 2400)}" cy="${n1(r() * 340)}" r="${n1(0.7 + r() * 1.4)}" fill="#fff" style="animation-duration:${n1(2 + r() * 5)}s;animation-delay:-${n1(r() * 6)}s"/>`).join('')) + birds,
      tr: petals,
      bl: cloud(210, -330, 1.7, shade) + cloud(560, -190, 1.05, shade) + roofs(1) + lit(1) + train,
      br: cloud(-260, -400, 1.9, shade) + cloud(-640, -210, 1.1, shade) + roofs(-1) + lit(-1) + pole,
    }
  },

  // A cork pinboard of handmade things: notes, photos, stamps, a thread between pins.
  pinboard(p, r, x, uid) {
    const v = x.v, paper = '#f6efe0', line = p.b
    const pin = (cx, cy, col) => `<circle cx="${cx + 2}" cy="${cy + 3}" r="8" fill="${INK}" opacity=".3"/><circle cx="${cx}" cy="${cy}" r="8" fill="${col}"/><circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="2.6" fill="#fff" opacity=".7"/>`
    const hang = (cx, cy, rot, body, sway = 1.4) => `<g transform="rotate(${rot} ${cx} ${cy})"><g>${body}${rock(-sway, sway, cx, cy, (6 + r() * 5) / v, r() * 8)}</g></g>`
    const note = (cx, cy, w, h, rot, col) => hang(cx, cy, rot, `<rect x="${cx - w / 2 + 4}" y="${cy - 6}" width="${w}" height="${h}" fill="${INK}" opacity=".2"/><rect x="${cx - w / 2}" y="${cy - 10}" width="${w}" height="${h}" fill="${paper}"/>`
      + `<path d="M${cx - w / 2 + 16} ${cy + 22} h${w * 0.5}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`
      + Array.from({ length: Math.floor((h - 60) / 20) }, (_, i) => `<path d="M${cx - w / 2 + 16} ${cy + 48 + i * 20} h${n1(w - 32 - r() * w * 0.3)}" stroke="${line}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`).join('') + pin(cx, cy, col))
    const pics = {
      moon: (px, py) => `<rect x="${px}" y="${py}" width="130" height="118" fill="#1b2350"/><circle cx="${px + 86}" cy="${py + 40}" r="20" fill="#fdf3cf"/><circle cx="${px + 95}" cy="${py + 34}" r="18" fill="#1b2350"/>` + Array.from({ length: 7 }, () => `<circle class="tw" cx="${n1(px + 10 + r() * 110)}" cy="${n1(py + 10 + r() * 60)}" r="1.5" fill="#fff" style="animation-duration:${n1(2 + r() * 3)}s"/>`).join('') + `<path d="M${px} ${py + 118} v-30 q30 -16 60 -2 t70 -6 v38 Z" fill="#0f1535"/>`,
      cat: (px, py) => `<rect x="${px}" y="${py}" width="130" height="118" fill="${p.a}"/><path d="M${px + 36} ${py + 52} l-4 -30 l26 16 Z M${px + 94} ${py + 52} l4 -30 l-26 16 Z" fill="${INK}"/><ellipse cx="${px + 65}" cy="${py + 70}" rx="38" ry="32" fill="${INK}"/><ellipse cx="${px + 52}" cy="${py + 66}" rx="5" ry="6" fill="#ffd978">${blink(6, 5)}</ellipse><ellipse cx="${px + 78}" cy="${py + 66}" rx="5" ry="6" fill="#ffd978">${blink(6, 5)}</ellipse><path d="M${px + 61} ${py + 78} h8 l-4 5 Z" fill="${PINK}"/>`,
      hill: (px, py) => `<rect x="${px}" y="${py}" width="130" height="118" fill="#ffd9a0"/><circle cx="${px + 66}" cy="${py + 64}" r="24" fill="#ff9a62"/><path d="M${px} ${py + 118} v-44 q34 -26 66 -6 t64 -10 v60 Z" fill="${p.c}"/><path d="M${px} ${py + 118} v-22 q40 -18 80 -2 t50 -4 v28 Z" fill="${INK}" opacity=".5"/>`,
    }
    const photo = (cx, cy, rot, kind, col) => hang(cx, cy, rot, `<rect x="${cx - 71}" y="${cy - 6}" width="150" height="176" fill="${INK}" opacity=".22"/><rect x="${cx - 75}" y="${cy - 12}" width="150" height="176" fill="#fff"/>${pics[kind](cx - 65, cy - 2)}<path d="M${cx - 40} ${cy + 140} h80" stroke="${line}" stroke-width="3" stroke-linecap="round" opacity=".5"/>` + pin(cx, cy - 4, col), 1)
    const stamp = (sx, sy, col, icon) => `<g transform="rotate(${n1(r() * 10 - 5)} ${sx + 40} ${sy + 48})"><rect x="${sx}" y="${sy}" width="80" height="96" fill="${paper}" stroke="${paper}" stroke-width="7" stroke-dasharray="1 8" stroke-linecap="round"/><rect x="${sx + 7}" y="${sy + 7}" width="66" height="82" fill="${col}"/>${icon(sx + 40, sy + 48)}</g>`
    const paw = (cx, cy) => `<g fill="${paper}"><ellipse cx="${cx}" cy="${cy + 8}" rx="15" ry="12"/><circle cx="${cx - 16}" cy="${cy - 8}" r="6"/><circle cx="${cx - 5}" cy="${cy - 15}" r="6"/><circle cx="${cx + 7}" cy="${cy - 15}" r="6"/><circle cx="${cx + 18}" cy="${cy - 8}" r="6"/></g>`
    const star = (cx, cy) => `<path d="M${cx} ${cy - 22} l6 15 l16 1 l-12 10 l4 16 l-14 -9 l-14 9 l4 -16 l-12 -10 l16 -1 Z" fill="${paper}"/>`
    const heart = (cx, cy) => `<path d="M${cx} ${cy + 20} C${cx - 34} ${cy - 2} ${cx - 16} ${cy - 28} ${cx} ${cy - 10} C${cx + 16} ${cy - 28} ${cx + 34} ${cy - 2} ${cx} ${cy + 20} Z" fill="${paper}"/>`
    const tape = (tx, ty, rot, col) => `<rect x="${tx}" y="${ty}" width="74" height="22" fill="${col}" opacity=".7" transform="rotate(${rot} ${tx + 37} ${ty + 11})"/>`
    const thread = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 40} ${x2} ${y2}" fill="none" stroke="#c8413b" stroke-width="2"/>`
    const cork = x.light ? ['#c99a66', '#b9844f', '#8d5f33'] : ['#6a4a31', '#553a26', '#33221a']
    return {
      defs: `<linearGradient id="sky${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cork[0]}"/><stop offset="1" stop-color="${cork[1]}"/></linearGradient>`,
      sky: `url(#sky${uid})`,
      full: Array.from({ length: Math.round(60 + x.density * 240) }, () => `<circle cx="${n1(r() * 100)}%" cy="${n1(r() * 100)}%" r="${n1(0.8 + r() * 1.8)}" fill="${cork[2]}" opacity="${n1(0.25 + r() * 0.4)}"/>`).join(''),
      tl: note(150, 70, 230, 250, -3, p.a) + thread(150, 70, 330, 392) + photo(330, 392, 5, 'moon', '#f2c14e') + tape(40, 56, -24, p.b),
      bl: photo(140, -420, -5, 'cat', p.b) + note(330, -250, 200, 190, 4, p.c) + stamp(60, -130, p.a, paw) + stamp(160, -124, p.c, star),
      tr: note(-170, 80, 220, 180, 3, p.b) + photo(-330, 330, -4, 'hill', '#c8413b') + thread(-170, 80, -60, 420) + pin(-60, 420, p.a) + tape(-120, 60, 18, p.a),
      br: note(-320, -330, 210, 230, -4, p.a) + stamp(-130, -150, p.b, heart) + stamp(-232, -142, '#3f6b4a', paw)
        + `<g transform="rotate(-6 -150 -420)"><rect x="-240" y="-456" width="190" height="76" rx="6" fill="${p.a}"/><path d="M-196 -456 v76" stroke="${paper}" stroke-width="2" stroke-dasharray="5 6"/><path d="M-176 -430 h96 M-176 -408 h60" stroke="${paper}" stroke-width="5" stroke-linecap="round" opacity=".85"/></g>`,
    }
  },

  camp(p, r, x, uid) {
    const v = x.v, G = 70, gy = -G
    const w = wood(x.light)
    const fx = 260, base = gy + 8   
    const b = base - 10            

 
    const glow = `<circle cx="${fx}" cy="${b - 40}" r="130" fill="url(#fg${uid})">${pulse('opacity', 1, 0.65, 2.2 / v)}</circle>`

    const flame = `<g>`
      + `<path d="M${fx} ${b - 96} C${fx + 36} ${b - 56} ${fx + 32} ${b - 6} ${fx} ${b} C${fx - 32} ${b - 6} ${fx - 36} ${b - 56} ${fx} ${b - 96} Z" fill="${p.a}"/>`
      + `<path d="M${fx} ${b - 56} C${fx + 18} ${b - 34} ${fx + 16} ${b - 4} ${fx} ${b} C${fx - 16} ${b - 4} ${fx - 18} ${b - 34} ${fx} ${b - 56} Z" fill="#ffd978"/>`
      + rock(-4, 4, fx, b, 2.2 / v) + `</g>`

    const logs = `<rect x="${fx - 50}" y="${base - 16}" width="100" height="16" rx="8" fill="${w[1]}" transform="rotate(14 ${fx} ${base - 8})"/>`
      + `<rect x="${fx - 50}" y="${base - 16}" width="100" height="16" rx="8" fill="${w[2]}" transform="rotate(-14 ${fx} ${base - 8})"/>`

    const embers = [0, 1, 2].map((i) => `<circle class="steam" style="animation-delay:-${i * 1.1}s;animation-duration:${n1(3.3 / v)}s" cx="${fx - 14 + i * 14}" cy="${b - 70}" r="2.4" fill="#ffd978"/>`).join('')

    const tx = 100, tb = base
    const tent = `<ellipse cx="${tx + 10}" cy="${tb}" rx="105" ry="8" fill="${INK}" opacity=".25"/>`
      + `<path d="M${tx} ${tb - 132} L${tx + 90} ${tb} L${tx - 90} ${tb} Z" fill="${p.b}"/>`
      + `<path d="M${tx} ${tb - 132} L${tx + 90} ${tb} L${tx + 28} ${tb} Z" fill="${INK}" opacity=".18"/>`
      + `<path d="M${tx} ${tb - 132} L${tx + 30} ${tb} L${tx - 30} ${tb} Z" fill="${p.ink2}"/>`
      + `<path d="M${tx} ${tb - 70} L${tx + 18} ${tb} L${tx - 18} ${tb} Z" fill="#ffb347" opacity=".4">${pulse('opacity', 0.5, 0.25, 2.2 / v)}</path>`
      + `<path d="M${tx} ${tb - 132} L${tx - 30} ${tb} M${tx} ${tb - 132} L${tx + 30} ${tb}" fill="none" stroke="${INK}" stroke-width="3" opacity=".35"/>`
      + `<path d="M${tx} ${tb - 132} v-16" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M${tx} ${tb - 148} l24 7 l-24 7 Z" fill="${p.a}"/>`

    const stars = x.light ? '' : Array.from({ length: Math.round(40 + x.density * 100) }, () =>
      `<circle class="tw" cx="${n1(r() * 100)}%" cy="${n1(r() * 62)}%" r="${n1(0.7 + r() * 1.5)}" fill="#fff" style="animation-duration:${n1(2 + r() * 4)}s;animation-delay:-${n1(r() * 5)}s"/>`).join('')
    const cloud = (cx, cy, s) => `<g class="roam" style="animation-duration:${n1((40 + r() * 30) / v)}s;animation-delay:-${n1(r() * 40)}s">`
      + `<ellipse cx="${cx}" cy="${cy}" rx="${n1(34 * s)}" ry="${n1(12 * s)}" fill="#fff" opacity=".9"/>`
      + `<ellipse cx="${n1(cx - 12 * s)}" cy="${n1(cy - 9 * s)}" rx="${n1(16 * s)}" ry="${n1(11 * s)}" fill="#fff" opacity=".9"/></g>`
    const mx = -150, my = 130
    const sky = `<circle cx="${mx}" cy="${my}" r="120" fill="url(#mg${uid})"/>`
      + (x.light
        ? `<circle cx="${mx}" cy="${my}" r="40" fill="#ffd978"/>` + cloud(-300, 230, 1.2) + cloud(-110, 300, 0.9)
        : `<circle cx="${mx}" cy="${my}" r="38" fill="#fdf3cf"/><circle cx="${mx - 12}" cy="${my - 10}" r="7" fill="#e8dcae" opacity=".7"/><circle cx="${mx + 12}" cy="${my + 12}" r="5" fill="#e8dcae" opacity=".7"/><circle cx="${mx + 8}" cy="${my - 16}" r="3.5" fill="#e8dcae" opacity=".7"/>`)

    const ground = gy + 8
    const pine = (cx, h) => {
      const w2 = h * 0.42
      const tier = (top, bot, hw) => `<path d="M${cx} ${n1(ground - top)} L${n1(cx + hw)} ${n1(ground - bot)} L${n1(cx - hw)} ${n1(ground - bot)} Z" fill="${p.leaf}"/>`
        + `<path d="M${cx} ${n1(ground - top)} L${n1(cx + hw)} ${n1(ground - bot)} L${cx} ${n1(ground - bot)} Z" fill="${INK}" opacity=".22"/>`
      return `<g><rect x="${cx - 7}" y="${ground - 24}" width="14" height="28" fill="${w[2]}"/>`
        + tier(h * 0.55, h * 0.1, w2) + tier(h * 0.78, h * 0.34, w2 * 0.8) + tier(h, h * 0.6, w2 * 0.6)
        + rock(-1.2, 1.2, cx, ground, (5 + r() * 3) / v, r() * 5) + `</g>`
    }
    const trees = pine(-280, 170) + pine(-175, 235) + pine(-65, 300)

    // A log to sit on, in front of the trees.
    const seat = `<ellipse cx="-205" cy="${gy + 22}" rx="70" ry="7" fill="${INK}" opacity=".25"/>`
      + `<rect x="-262" y="${gy - 6}" width="112" height="28" rx="14" fill="${w[1]}"/>`
      + `<rect x="-250" y="${gy - 2}" width="88" height="5" rx="2.5" fill="${w[0]}" opacity=".5"/>`
      + `<ellipse cx="-154" cy="${gy + 8}" rx="10" ry="14" fill="${w[0]}"/><ellipse cx="-154" cy="${gy + 8}" rx="5" ry="8" fill="none" stroke="${w[2]}" stroke-width="2"/>`    

       return {
      defs: `<radialGradient id="fg${uid}"><stop offset="0" stop-color="#ffb347" stop-opacity="${x.light ? 0.3 : 0.55}"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>`
        + `<radialGradient id="mg${uid}"><stop offset="0" stop-color="${x.light ? '#ffe9a8' : '#fdf3cf'}" stop-opacity=".5"/><stop offset="1" stop-color="${x.light ? '#ffe9a8' : '#fdf3cf'}" stop-opacity="0"/></radialGradient>`,
      full: stars, tl: '', tr: sky,
      bl: `<rect x="-20" y="${gy}" width="9000" height="${G + 20}" fill="${p.ink2}"/>`
        + `<rect x="-20" y="${gy}" width="9000" height="8" fill="${p.leaf}"/>`
        + tent + glow + flame + logs + embers,
      br: trees+ seat,
    }
  },
}
