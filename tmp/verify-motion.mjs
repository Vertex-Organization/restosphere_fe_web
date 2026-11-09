import { Window } from './motion-qa/node_modules/happy-dom/lib/index.js'
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'

const window = new Window({ url: 'http://localhost:5173/nl/menu', width: 1440, height: 900, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } })
let reduced = true
let lastScrolledId = ''
window.HTMLElement.prototype.scrollIntoView = function(){lastScrolledId=this.id}
window.matchMedia = query => ({ media: query, get matches() { if (query.includes('no-preference')) return !reduced; if (query.includes('prefers-reduced-motion: reduce')) return reduced; if (query.includes('pointer: coarse')) return false; if (query.includes('max-width: 991px')) return false; if (query.includes('min-width: 1024px')) return true; return false }, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}, dispatchEvent(){return true} })
const emptyObserver = class { observe(){} unobserve(){} disconnect(){} }
window.ResizeObserver = emptyObserver
window.IntersectionObserver = emptyObserver
for (const key of ['Window','window','document','navigator','HTMLElement','Element','SVGElement','SVGSVGElement','HTMLAnchorElement','HTMLImageElement','HTMLCanvasElement','Image','Node','Event','MouseEvent','PointerEvent','CustomEvent','PopStateEvent','MutationObserver','ResizeObserver','IntersectionObserver','sessionStorage']) {
 const value = key === 'window' ? window : key === 'document' ? window.document : window[key]
 Object.defineProperty(globalThis,key,{value, configurable:true,writable:true})
}
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
window.SVGElement.prototype.getBBox = () => ({x:0,y:0,width:1000,height:1000})
window.SVGElement.prototype.getTotalLength = () => 5000
window.SVGElement.prototype.getScreenCTM = () => ({a:1,b:0,c:0,d:1,e:0,f:0,inverse(){return this}})
window.SVGElement.prototype.getCTM = window.SVGElement.prototype.getScreenCTM
window.scrollTo = () => {}
const { createElement, StrictMode, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const {gsap} = await import('gsap')
const server = await createServer({server:{middlewareMode:true},appType:'custom'})
const results = []
const errors=[]
window.addEventListener('error',event=>errors.push(String(event.error)))
function assert(condition,message){if(!condition)throw new Error(message);results.push(message)}
const pause = time => new Promise(resolve=>setTimeout(resolve,time))
let root
async function mount(path, useReduced=true, seen=true){
 reduced=useReduced
 window.history.replaceState(null,'',path)
 window.sessionStorage.clear()
 if(seen)window.sessionStorage.setItem('intro-seen','1')
 document.body.innerHTML='<div id="root"></div>'
 root=createRoot(document.getElementById('root'))
 await act(async()=>{root.render(createElement(StrictMode,null,createElement(App)));await pause(30)})
}
async function click(selector){const target=document.querySelector(selector);if(!target)throw new Error('missing '+selector);await act(async()=>{target.dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}));await pause(10)})}
try{
 const {default:AppModule}=await server.ssrLoadModule('/src/App.tsx')
 var App=AppModule
 await mount('/nl/menu')
 assert(document.querySelector('h1').textContent==='Ons Menu','Dutch menu mounts in StrictMode')
 await click('a[href="/en/menu"]')
 assert(window.location.pathname==='/en/menu' && document.querySelector('h1').textContent==='Our Menu','Locale navigation commits without reload in reduced motion')
 await act(async()=>{window.history.back();await pause(50)})
 assert(window.location.pathname==='/nl/menu' && document.querySelector('h1').textContent==='Ons Menu','Back navigation restores the previous local page')
 const fragmentLink=document.createElement('a');fragmentLink.href='/nl/catering#trial-lunch';fragmentLink.id='fragment-test';document.body.appendChild(fragmentLink)
 await click('#fragment-test')
 assert(window.location.hash==='#trial-lunch' && lastScrolledId==='trial-lunch','Cross-page fragment scrolls to the mounted target')
 await act(async()=>root.unmount())
 await mount('/nl/menu',false)
 gsap.globalTimeline.timeScale(50)
 await act(async()=>{document.querySelector('a[href="/en/menu"]').dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}));document.querySelector('.sb-header-right a[href$="/catering"]').dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}))})
 await act(async()=>{await pause(150)})
 assert(window.location.pathname==='/en/menu','Animated SVG exit commits navigation')
 await act(async()=>{await pause(150)})
 assert(parseFloat(document.querySelector('[data-transition-wrap] path').style.strokeWidth || document.querySelector('[data-transition-wrap] path').getAttribute('stroke-width'))===0,'SVG enter completes and clears its overlay')
 await click('a[href="/nl/menu"]')
 await act(async()=>{window.history.replaceState(null,'','/terms');window.dispatchEvent(new PopStateEvent('popstate'));await pause(30)})
 assert(document.querySelector('h1').textContent==='Terms and Conditions','Popstate interrupts an in-progress transition without leaving a hidden page')
 await act(async()=>root.unmount())
 await mount('/nl',true)
 assert(document.querySelector('.sb-slider-arrows button').disabled,'Sandwich slider starts with previous disabled')
 await click('.sb-slider-arrows button:last-child')
 assert(document.querySelectorAll('.sb-slide')[1].getAttribute('aria-hidden')==='false','Sandwich next control selects the next slide')
 await click('.sb-slider-arrows button:last-child')
 assert(document.querySelector('.sb-slider-arrows button:last-child').disabled,'Sandwich slider stops at the last slide')
 await click('.sb-slider-dots button:first-child')
 assert(document.querySelectorAll('.sb-slide')[0].getAttribute('aria-hidden')==='false','Sandwich dot returns to the first slide')
 await click('.sb-faq-item:nth-child(1) button')
 await click('.sb-faq-item:nth-child(2) button')
 assert(document.querySelectorAll('.sb-faq-item button[aria-expanded="true"]').length===1,'FAQ keeps only one item open')
 await act(async()=>root.unmount())
 await mount('/nl',false,false)
 await act(async()=>{window.dispatchEvent(new Event('load'));await pause(180)})
 assert(document.querySelector('.sb-intro').style.display==='none','First-visit intro completes under StrictMode')
 assert(window.sessionStorage.getItem('intro-seen')==='1','First-visit intro is remembered for the session')
 assert(parseFloat(document.querySelector('[data-hero-title]').style.opacity)===1 && document.querySelector('[data-hero-title]').style.visibility!=='hidden','Hero reveal completes after the first-visit intro')
 await act(async()=>root.unmount())
 root=null
 if(errors.length) console.log(JSON.stringify(errors,null,2));
 assert(errors.length===0,'No DOM lifecycle errors captured')
 writeFileSync('docs/research/sandwich-bar/motion-test-results.json',JSON.stringify({environment:'Happy DOM simulation; no browser rendering or visual comparison',checks:results,errors},null,2))
 console.log(JSON.stringify({passed:results.length,checks:results,errors},null,2))
}catch(error){console.error(error);process.exitCode=1}
finally{if(root)await act(async()=>root.unmount());gsap.globalTimeline.clear();gsap.ticker.sleep();await server.close();await window.happyDOM.abort();process.exit(process.exitCode || 0)}
