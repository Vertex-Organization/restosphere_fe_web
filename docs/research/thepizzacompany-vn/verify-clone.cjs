const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require(process.argv[2])
const output = __dirname
const origin = process.env.CLONE_ORIGIN || 'http://127.0.0.1:5173'
const loginPath = '/auth/login?returnUrl=https%3A%2F%2Fthepizzacompany.vn%2F'
const sourceUrl = 'https://thepizzacompany.vn' + loginPath
const sourceCache = process.env.REFRESH_SOURCE ? null : require('./verification.json')

async function settle(page) {
  await page.locator('#login-form:visible').first().waitFor({state:'visible',timeout:45000})
  await page.locator('#login-form:visible').first().getByAltText('Google',{exact:true}).waitFor({state:'visible',timeout:45000})
  await page.evaluate(()=>document.fonts.ready)
  await page.evaluate(async()=>{
    const urls=new Set([...document.querySelectorAll('*')].flatMap(el=>[...getComputedStyle(el).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m=>m[1])))
    await Promise.all([...urls].map(src=>new Promise(resolve=>{const image=new Image();image.onload=resolve;image.onerror=resolve;image.src=src})))
  })
  if(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)) {
    await page.mouse.wheel(0,3000)
    await page.waitForFunction(()=>scrollY+innerHeight>=document.documentElement.scrollHeight-2)
    await page.mouse.wheel(0,-3000)
    await page.waitForFunction(()=>scrollY===0)
  }
  await page.waitForFunction(()=>[...document.images].filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete))
}
async function capture(page,url,name) {
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000})
  await settle(page)
  await page.screenshot({path:path.join(output,name+'.png'),fullPage:true,animations:'disabled'})
  return page.evaluate(()=>{
    const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}
    return {viewport:{width:innerWidth,height:innerHeight},pageWidth:document.documentElement.scrollWidth,card:rect(document.querySelector('.pc-card')||document.querySelector('#login-form')?.parentElement),form:rect(document.querySelector('#login-form')),phone:rect(document.querySelector('[name=phone]')),password:rect(document.querySelector('[name=password]')),submit:rect(document.querySelector('button[type=submit]')),images:[...document.images].filter(i=>i.getBoundingClientRect().width>0).map(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight})),text:document.body.innerText}
  })
}
;(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
  const errors=[],failures=[],apiRequests=[],comparison=[]
  try {
    for(const [width,height] of [[1440,1000],[390,844],[1920,1080],[360,800],[768,1024],[1024,900]]) {
      const page=await browser.newPage({viewport:{width,height},locale:'vi-VN',deviceScaleFactor:1})
      page.on('pageerror',e=>{if(page.url().startsWith(origin))errors.push(e.message)})
      page.on('requestfailed',r=>{if(r.url().startsWith(origin))failures.push({url:r.url(),error:r.failure()})})
      page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)failures.push({url:r.url(),status:r.status()})})
      page.on('request',r=>{if(r.url().startsWith(origin)&&['xhr','fetch'].includes(r.resourceType()))apiRequests.push(r.url())})
      const label=width+'x'+height
      const local=await capture(page,origin+loginPath,'local-'+label)
      assert(local.pageWidth<=width,`Local horizontal overflow at ${width}`)
      assert(local.images.every(i=>i.width>0),`Broken local image at ${width}`)
      assert(!local.text.includes('The Pizza Company'),`Old brand visible at ${width}`)
      assert.match(await page.title(), /The Sea's Crown/)
      assert.equal(await page.locator('.pc-banner .restaurant-brand-name').textContent(), "The Sea's Crown")
      const source=sourceCache ? sourceCache.comparison.find(item=>item.label===label).source : await capture(page,sourceUrl,'source-'+label)
      comparison.push({label,local,source})
      await page.close()
    }
    const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'vi-VN'})
    page.on('pageerror',e=>errors.push(e.message))
    page.on('request',r=>{if(['xhr','fetch'].includes(r.resourceType()))apiRequests.push(r.url())})
    await page.goto(origin+loginPath)
    await settle(page)
    await page.locator('.pc-back').hover()
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.pc-back-hover')).opacity==='1')
    assert.equal(await page.locator('.pc-back-hover').evaluate(el=>el.naturalWidth>0),true)
    await page.mouse.move(1,1)
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.pc-back-hover')).opacity==='0')
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click()
    assert.equal(await page.getByText('Vui lòng nhập số điện thoại',{exact:true}).count(),1)
    assert.equal(await page.getByText('Vui lòng nhập mật khẩu',{exact:true}).count(),1)
    await page.getByLabel('Điện thoại',{exact:true}).fill('123')
    assert.equal(await page.getByText('Số điện thoại di động không hợp lệ',{exact:true}).count(),1)
    await page.screenshot({path:path.join(output,'local-validation.png'),fullPage:true})
    await page.getByLabel('Điện thoại',{exact:true}).fill('0901234567')
    await page.getByLabel('Mật khẩu',{exact:true}).fill('Example123')
    await page.getByRole('button',{name:'Hiện mật khẩu',exact:true}).click()
    assert.equal(await page.locator('[name=password]').getAttribute('type'),'text')
    await page.getByRole('button',{name:'Ẩn mật khẩu',exact:true}).click()
    assert.equal(await page.locator('[name=password]').getAttribute('type'),'password')
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click()
    assert.match(await page.getByRole('status').innerText(),/chưa hỗ trợ đăng nhập/)
    await page.getByRole('button',{name:'Việt Nam',exact:true}).click()
    assert.equal(await page.getByRole('menu').count(),1)
    await page.screenshot({path:path.join(output,'local-language-menu.png'),fullPage:true})
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('menu').count(),0)
    await page.getByRole('button',{name:'Việt Nam',exact:true}).click()
    await page.locator('h2').click()
    assert.equal(await page.getByRole('menu').count(),0)
    await page.getByRole('button',{name:'Việt Nam',exact:true}).focus()
    await page.keyboard.press('ArrowDown')
    assert.equal(await page.getByRole('menu').count(),1)
    await page.keyboard.press('ArrowDown')
    assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Việt Nam')
    assert.equal(await page.getByRole('menuitem',{name:'English',exact:true}).isDisabled(),true)
    await page.keyboard.press('Escape')
    await page.getByRole('button',{name:'Quên mật khẩu',exact:true}).click()
    assert.match(await page.getByRole('status').innerText(),/liên hệ nhà hàng/)
    await page.getByRole('button',{name:'Đăng ký tài khoản',exact:true}).click()
    assert.match(await page.getByRole('status').innerText(),/chưa khả dụng/)
    await page.getByRole('button',{name:'Đăng nhập với Google',exact:true}).click()
    assert.match(await page.getByRole('status').innerText(),/Google hiện chưa khả dụng/)
    assert.equal(await page.locator('a[href*="thepizzacompany.vn"]').count(),0)
    await page.goto(origin+'/')
    assert.equal(await page.locator('h1').innerText(),'Đăng nhập')
    await page.goto(origin+'/auth/login?returnUrl=javascript%3Aalert(1)')
    assert.equal(await page.locator('.pc-back').getAttribute('href'),'/')
    await page.goto(origin+'/auth/login?returnUrl=https%3A%2F%2Fthepizzacompany.vn%2F')
    assert.equal(await page.locator('.pc-back').getAttribute('href'),'/')
    await page.goto(origin+'/not-a-cloned-route')
    assert.equal(await page.locator('h1').innerText(),'Không tìm thấy trang')
    assert.deepEqual(errors,[],'Browser runtime errors')
    assert.deepEqual(failures,[],'Missing local assets')
    assert.deepEqual(apiRequests,[],'Login must not transmit credentials without an auth backend')
    const report={checkedAt:new Date().toISOString(),origin,comparison,checks:{viewports:comparison.length,restaurantBrand:true,backButtonHover:true,emptyAndInvalidFields:true,passwordToggle:true,localOnlySubmission:true,languageMenuMouseAndKeyboard:true,noSourceNavigation:true,unavailableActionsFeedback:true,rootAlias:true,safeReturnUrl:true,unknownRoute:true,noRuntimeErrors:true,noFailedLocalAssets:true,noHorizontalOverflow:true},errors,failures}
    await fs.writeFile(path.join(output,'verification.json'),JSON.stringify(report,null,2))
    console.log(JSON.stringify({checks:report.checks,geometry:comparison.map(c=>({viewport:c.label,sourceCard:c.source.card,localCard:c.local.card,sourcePhone:c.source.phone,localPhone:c.local.phone}))},null,2))
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
