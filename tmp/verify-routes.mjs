import { createServer } from 'vite'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const routes=['/','/nl','/en','/menu','/nl/menu','/en/menu','/catering','/nl/catering','/en/catering','/privacy','/nl/privacy','/en/privacy','/terms','/nl/terms','/en/terms','/auth/login','/menu/combo','/unknown']
const server=await createServer({server:{middlewareMode:true},appType:'custom'})
try{
 const {default:App}=await server.ssrLoadModule('/src/App.tsx')
 globalThis.window={location:{pathname:'/'},matchMedia:()=>({matches:true})}
 const results=routes.map(route=>{
  window.location.pathname=route
  const html=renderToString(createElement(App))
  const refs=[...html.matchAll(/(?:src|href)="(\/sites\/sandwich-bar\/[^"#?]+)(?:[^\"]*)"/g)].map(m=>m[1])
  const missing=[...new Set(refs.filter(url=>!existsSync(resolve('public',decodeURIComponent(url.slice(1))))))]
  const row={route,h1:html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1],mainTarget:html.includes('id="main-content"'),mediaRefs:refs.length,missing}
  if(missing.length||!row.mainTarget||!row.h1)throw Error(JSON.stringify(row))
  return row
 })
 writeFileSync('docs/research/sandwich-bar/route-verification.json',JSON.stringify(results,null,2))
 console.log(JSON.stringify({routes:results.length,missingAssets:0,allRoutesRender:true},null,2))
}finally{await server.close();process.exit(process.exitCode||0)}
