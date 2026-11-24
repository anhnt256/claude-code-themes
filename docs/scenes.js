// Animated backdrops for the Claude desktop app, drawn from a few choices.
// A backdrop is described by a small recipe; the same recipe always draws the same picture.
import { oklch, toOklch, toHex, slug } from './lib.js'
import { ART, STYLE_ART } from './art.js'

export const SCENES = [
  { id: 'cat', name: 'Desk cat' }, { id: 'dog', name: 'Puppy' }, { id: 'anime', name: 'Evening sky' }, { id: 'pinboard', name: 'Pinboard' },
  { id: 'koi', name: 'Koi pond' }, { id: 'petals', name: 'Petals' }, { id: 'aurora', name: 'Aurora' }, { id: 'fireflies', name: 'Fireflies' },
  { id: 'stars', name: 'Stars' }, { id: 'snow', name: 'Snow' }, { id: 'rain', name: 'Rain' },{ id: 'camp', name: 'Campsite' },
]
const W = 1600, H = 1000
const n1 = (x) => +x.toFixed(1)
const clamp = (x, lo, hi, d) => (Number.isFinite(+x) ? Math.max(lo, Math.min(hi, +x)) : d)

/** Keeps only what a recipe may contain. Returns null if it is not one. */
export function recipe(input) {
  if (!input || typeof input !== 'object' || !SCENES.some((s) => s.id === input.scene)) return null
  const name = (typeof input.name === 'string' ? input.name : '').replace(/[^\p{L}\p{N} .,+&'()_\-–·:/]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 48)
  return {
    name: name || SCENES.find((s) => s.id === input.scene).name, scene: input.scene, color: toHex(input.color) ?? '#d77757', light: input.light === true,
    density: clamp(input.density, 0, 1, 0.5), speed: clamp(input.speed, 0, 1, 0.5), n: Math.floor(clamp(input.n, 0, 999999, 1)),
    blur: Math.round(clamp(input.blur, 0, 40, 18)), opacity: n1(clamp(input.opacity, 0, 1, 0.5)),
  }
}

// A recipe packed into a short code for a link or a shell argument. Always starts with "d.".
const ORDER = ['name', 'scene', 'color', 'light', 'density', 'speed', 'n', 'blur', 'opacity']
export function packRecipe(input) {
  const x = recipe(input), bytes = new TextEncoder().encode(JSON.stringify(ORDER.map((k) => x[k])))
  const b64 = typeof btoa === 'function' ? btoa(String.fromCharCode(...bytes)) : Buffer.from(bytes).toString('base64')
  return 'd.' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function unpackRecipe(code) {
  try {
    const b64 = String(code).slice(2).replace(/-/g, '+').replace(/_/g, '/')
    const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary')
    const list = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
    return String(code).startsWith('d.') && Array.isArray(list) ? recipe(Object.fromEntries(ORDER.map((k, i) => [k, list[i]]))) : null
  } catch { return null }
}

function random(seed) {
  let a = (seed + 1) * 0x9e3779b1
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

/** The colours a scene is painted with, all from one seed colour. */
export function palette(color, light) {
  const [, c, h] = toOklch(color)
  const k = Math.max(0.5, Math.min(1.2, c / 0.12))
  return light
    ? { top: oklch(0.96, 0.02 * k, h), bottom: oklch(0.9, 0.05 * k, h + 30), a: oklch(0.72, 0.13 * k, h), b: oklch(0.76, 0.12 * k, h + 60), c: oklch(0.7, 0.13 * k, h - 60), leaf: oklch(0.7, 0.12, 148), ink: oklch(0.8, 0.05 * k, h), ink2: oklch(0.86, 0.04 * k, h), dot: oklch(0.62, 0.1 * k, h), tint: oklch(0.97, 0.015 * k, h) }
    : { top: oklch(0.15, 0.04 * k, h), bottom: oklch(0.25, 0.07 * k, h + 30), a: oklch(0.78, 0.15 * k, h), b: oklch(0.76, 0.14 * k, h + 60), c: oklch(0.72, 0.14 * k, h - 60), leaf: oklch(0.52, 0.11, 148), ink: oklch(0.1, 0.03 * k, h), ink2: oklch(0.14, 0.04 * k, h), dot: oklch(0.94, 0.03 * k, h), tint: oklch(0.14, 0.03 * k, h) }
}

// Shared pieces
const ridge = (r, base, rough, fill) => {
  let d = `M0 ${H} L0 ${base}`
  for (let x = 0; x <= W; x += 80) d += ` L${x} ${n1(base - r() * rough)}`
  return `<path d="${d} L${W} ${H} Z" fill="${fill}"/>`
}
const time = (dur, r) => `animation-duration:${n1(dur)}s;animation-delay:-${n1(r() * dur)}s`
const twinkles = (r, p, count, maxY = H) => Array.from({ length: count }, () => `<circle class="tw" cx="${n1(r() * W)}" cy="${n1(r() * maxY)}" r="${n1(0.6 + r() * 1.6)}" fill="${p.dot}" style="${time(2 + r() * 5, r)}"/>`).join('')

const DRAW = {
  stars: (p, r, q, v) => twinkles(r, p, 70 + q * 200)
    + `<g class="fly" style="animation-duration:${n1(26 / v)}s"><path d="M0 0 L-170 -60" stroke="${p.a}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/><circle r="3.5" fill="${p.dot}"/></g>`
    + ridge(r, 930, 50, p.ink),
  aurora: (p, r, q, v, uid) => twinkles(r, p, 40 + q * 60, 600)
    + [p.a, p.b, p.c].map((col, i) => {
      const y = 180 + i * 90
      let d = `M-200 ${y}`
      for (let x = -200; x <= W + 200; x += 200) d += ` Q${x + 100} ${n1(y - 90 + r() * 180)} ${x + 200} ${n1(y + r() * 60 - 30)}`
      return `<path class="sway" d="${d} L${W + 200} ${y + 330} L-200 ${y + 330} Z" fill="url(#g${uid}${i})" opacity="${n1(0.3 + q * 0.3)}" style="${time((11 + i * 3) / v, r)}"/>`
    }).join('') + ridge(r, 900, 120, p.ink2) + ridge(r, 950, 60, p.ink),
  snow: (p, r, q, v) => ridge(r, 900, 70, p.ink2)
    + Array.from({ length: 14 }, (_, i) => { const x = i * 120 + r() * 60, h = 90 + r() * 110; return `<path d="M${n1(x)} ${H - 40} l${n1(h * 0.32)} 0 l${n1(-h * 0.32)} ${n1(-h)} l${n1(-h * 0.32)} ${n1(h)} Z" fill="${p.ink}"/>` }).join('')
    + ridge(r, 965, 25, p.ink)
    + Array.from({ length: Math.round(50 + q * 150) }, () => `<circle class="fall" cx="${n1(r() * W)}" cy="-20" r="${n1(1.2 + r() * 2.6)}" fill="${p.dot}" opacity="${n1(0.4 + r() * 0.6)}" style="${time((9 + r() * 10) / v, r)}"/>`).join(''),
  rain: (p, r, q, v) => ridge(r, 880, 110, p.ink2) + ridge(r, 950, 50, p.ink)
    + Array.from({ length: Math.round(60 + q * 160) }, () => { const x = r() * (W + 200); return `<path class="pour" d="M${n1(x)} -60 l-14 46" stroke="${p.a}" stroke-width="${n1(1 + r())}" stroke-linecap="round" opacity="${n1(0.25 + r() * 0.45)}" style="${time((1.1 + r() * 1.2) / v, r)}"/>` }).join(''),
  fireflies: (p, r, q, v) => twinkles(r, p, 30, 500) + ridge(r, 840, 140, p.ink2) + ridge(r, 930, 70, p.ink)
    + Array.from({ length: Math.round(14 + q * 50) }, () => {
      const x = n1(r() * W), y = n1(420 + r() * 520), col = r() < 0.5 ? p.a : p.b
      return `<g class="drift${1 + Math.floor(r() * 3)}" style="${time((12 + r() * 14) / v, r)}"><g class="tw" style="${time(2 + r() * 3, r)}"><circle cx="${x}" cy="${y}" r="11" fill="${col}" opacity=".18"/><circle cx="${x}" cy="${y}" r="3.2" fill="${col}"/></g></g>`
    }).join(''),
  petals: (p, r, q, v) => `<path d="M${W} 70 C1400 90 1330 190 1180 170 M1400 110 C1370 190 1300 250 1230 300 M1290 160 C1270 110 1220 80 1160 70" stroke="${p.ink}" stroke-width="12" stroke-linecap="round" fill="none"/>`
    + Array.from({ length: 34 }, () => { const x = 1120 + r() * 460, y = 40 + r() * 280; return `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(9 + r() * 12)}" fill="${r() < 0.5 ? p.a : p.b}" opacity="${n1(0.55 + r() * 0.4)}"/>` }).join('')
    + Array.from({ length: Math.round(24 + q * 70) }, () => {
      const s = n1(0.7 + r() * 1.1)
      return `<g class="blow" style="${time((13 + r() * 12) / v, r)}"><path transform="translate(${n1(200 + r() * (W + 300))} ${n1(-60 - r() * 200)}) rotate(${Math.round(r() * 360)}) scale(${s})" d="M0 0 C6 -9 19 -9 24 0 C19 9 6 9 0 0 Z" fill="${r() < 0.6 ? p.a : p.b}" opacity="${n1(0.6 + r() * 0.4)}"/></g>`
    }).join(''),
  koi: (p, r, q, v) => {
    const pad = (x, y, s) => `<path transform="translate(${n1(x)} ${n1(y)}) rotate(${Math.round(r() * 360)}) scale(${n1(s)})" d="M0 0 L46 -12 A48 48 0 1 0 46 12 Z" fill="${p.leaf}" opacity=".9"/>`
    const pads = Array.from({ length: Math.round(8 + q * 12) }, () => (r() < 0.5 ? pad(r() * 330, r() * H, 0.7 + r() * 0.9) : pad(W - r() * 330, r() * H, 0.7 + r() * 0.9))).join('')
    const rings = Array.from({ length: 5 }, () => {
      const dur = n1((7 + r() * 5) / v), at = n1(r() * dur)
      return `<circle cx="${n1(r() * W)}" cy="${n1(r() * H)}" r="0" fill="none" stroke="${p.dot}" stroke-width="2" opacity="0"><animate attributeName="r" values="0;150" dur="${dur}s" begin="-${at}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".45;0" dur="${dur}s" begin="-${at}s" repeatCount="indefinite"/></circle>`
    }).join('')
    const fish = Array.from({ length: Math.round(2 + q * 4) }, (_, i) => {
      const y = n1(140 + r() * (H - 280)), tilt = Math.round(r() * 36 - 18) + (i % 2 ? 180 : 0), s = n1(0.8 + r() * 0.7), body = i % 3 === 2 ? p.a : '#fbf6ee'
      const spots = Array.from({ length: 3 }, () => `<ellipse cx="${n1(-30 + r() * 80)}" cy="${n1(r() * 16 - 8)}" rx="${n1(10 + r() * 12)}" ry="${n1(6 + r() * 6)}" fill="${i % 3 === 2 ? '#fbf6ee' : r() < 0.7 ? p.a : p.ink}"/>`).join('')
      return `<g transform="rotate(${tilt} ${W / 2} ${y})"><g class="swim" style="${time((38 + r() * 24) / v, r)}"><g transform="translate(-160 ${y}) scale(${s})">`
        + `<path d="M-70 0 C-110 -34 -128 -20 -118 0 C-128 20 -110 34 -70 0 Z" fill="${body}" opacity=".85"/><path d="M-10 -18 l-22 -24 l34 14 Z M-10 18 l-22 24 l34 -14 Z" fill="${body}" opacity=".75"/>`
        + `<path d="M70 0 C60 -24 10 -30 -70 0 C10 30 60 24 70 0 Z" fill="${body}"/>${spots}<circle cx="52" cy="-9" r="2.6" fill="${p.ink}"/><circle cx="52" cy="9" r="2.6" fill="${p.ink}"/></g></g></g>`
    }).join('')
    return rings + fish + pads
  },
}

const STYLE = `.tw{animation:tw 4s ease-in-out infinite}.sway{animation:sway 12s ease-in-out infinite alternate}.fall{animation:fall 12s linear infinite}.pour{animation:pour 1.4s linear infinite}`
  + `.blow{animation:blow 16s linear infinite}.swim{animation:swim 40s linear infinite}.fly{animation:fly 26s linear infinite}`
  + `.drift1{animation:d1 18s ease-in-out infinite alternate}.drift2{animation:d2 18s ease-in-out infinite alternate}.drift3{animation:d3 18s ease-in-out infinite alternate}`
  + `@keyframes tw{0%,100%{opacity:1}50%{opacity:.2}}@keyframes sway{from{transform:translate(-70px,0)}to{transform:translate(70px,24px)}}`
  + `@keyframes fall{from{transform:translate(0,0)}to{transform:translate(50px,1050px)}}@keyframes pour{from{transform:translate(0,0)}to{transform:translate(-330px,1090px)}}`
  + `@keyframes blow{from{transform:translate(0,0)}to{transform:translate(-520px,1320px)}}@keyframes swim{from{transform:translate(0,0)}to{transform:translate(1950px,0)}}`
  + `@keyframes fly{0%{transform:translate(-200px,-80px);opacity:0}3%{opacity:1}22%{transform:translate(1900px,640px);opacity:1}23%,100%{transform:translate(1900px,640px);opacity:0}}`
  + `@keyframes d1{from{transform:translate(0,0)}to{transform:translate(90px,-60px)}}@keyframes d2{from{transform:translate(0,0)}to{transform:translate(-80px,-40px)}}@keyframes d3{from{transform:translate(0,0)}to{transform:translate(50px,70px)}}`
  + `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`

/** The backdrop as one SVG string. */
/**
 * The backdrop as one SVG string. `size` is for previews only: the illustrated scenes are drawn in
 * window pixels, so a preview gives them a pretend window of [width, height] and scales it to fit.
 */
export function draw(input, uid = "", size) {
  const x = recipe(input)
  if (!x) return ''
  const p = palette(x.color, x.light), r = random(x.n * 7 + SCENES.findIndex((s) => s.id === x.scene))
  if (ART[x.scene]) {
    const a = ART[x.scene](p, r, { ...x, v: 0.4 + x.speed * 1.2 }, uid)
    const corner = (at, body) => `<svg x="${at[0]}" y="${at[1]}" overflow="visible">${body}</svg>`
    const body = `<style>${STYLE}${STYLE_ART}</style><defs><linearGradient id="wall${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.top}"/><stop offset="1" stop-color="${p.bottom}"/></linearGradient>${a.defs}</defs>`
      + `<rect width="100%" height="100%" fill="${a.sky ?? `url(#wall${uid})`}"/>${a.full}${corner([0, 0], a.tl)}${corner(['100%', 0], a.tr)}${corner([0, '100%'], a.bl)}${corner(['100%', '100%'], a.br)}`
    return size
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size[0]} ${size[1]}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><svg width="${size[0]}" height="${size[1]}">${body}</svg></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${body}</svg>`
  }
  const sky = x.scene === 'koi' ? [oklch(x.light ? 0.86 : 0.3, 0.07, 200), oklch(x.light ? 0.78 : 0.2, 0.08, 215)] : [p.top, p.bottom]
  const grads = `<linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>`
    + (x.scene === 'aurora' ? [p.a, p.b, p.c].map((c, i) => `<linearGradient id="g${uid}${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`).join('') : '')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${STYLE}</style><defs>${grads}</defs>`
    + `<rect width="${W}" height="${H}" fill="url(#sky${uid})"/>${DRAW[x.scene](p, r, x.density, 0.4 + x.speed * 1.2, uid)}</svg>`
}

/** The files of a Claude Code plugin that shows this backdrop in the desktop app. */
export function plugin(input, version = '1.0.0') {
  const x = recipe(input), id = slug(x.name), p = palette(x.color, x.light), s = JSON.stringify
  return {
    id,
    files: {
      '.claude-plugin/plugin.json': s({ name: id, version, description: `${x.name}: an animated backdrop for the Claude desktop app, made in the Claude Code Themes studio`, keywords: ['mod', 'theme', 'backdrop'] }, null, 2) + '\n',
      'hooks/hooks.json': s({ description: `Sets the ${x.name} backdrop and draws it`, modules: ['./register.js'] }, null, 2) + '\n',
      'recipe.json': s(x, null, 2) + '\n',
      'hooks/register.js': `// ${x.name}: a backdrop for the Code tab of the Claude desktop app.
// Made in the Claude Code Themes studio. recipe.json holds the choices it was drawn from.
const SCENE = ${s(id)}
const SVG = ${s(draw(x))}
const THEME = { backdrop: { scene: SCENE, glass: { blur: ${x.blur}, tint: ${s(p.tint)}, opacity: ${x.opacity} } }, overrideColorScheme: ${s(x.light ? 'light' : 'dark')} }

async function show($) {
  const set = await $.theme.set(THEME)
  if (!set.isDrawn) $.ui.log(SCENE + ': set but not drawn here: ' + set.reason, { to: 'debug' })
  return set
}

export function register(on) {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: SCENE, description: ${s(x.name + ' backdrop: /' + id + ' on | off')} })
    if ((await $.store.get('off')) !== true) await show($)
    return next(e)
  })

  on('command.run', { command: SCENE }, async ($, e) => {
    if ((e.args ?? '').trim() === 'off') {
      await $.store.set('off', true)
      await $.theme.clear()
      return { text: ${s(x.name + ' is off. /' + id + ' on brings it back.')} }
    }
    await $.store.delete('off')
    const set = await show($)
    return { text: set.isDrawn ? ${s(x.name + ' is on.')} : ${s(x.name + ' is on, but nothing here draws it: ')} + set.reason }
  })

  // Every mod hears every backdrop, so draw only this one.
  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== $.plugin.name || e.props.scene !== SCENE) return next(e)
    return $.ui.resolve(e).Svg({ source: SVG, alt: ${s(x.name)} })
  })
}
`,
    },
  }
}
