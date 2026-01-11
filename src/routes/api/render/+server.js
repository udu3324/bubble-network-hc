import { PUBLIC_BASE_URL } from '$env/static/public'
import { supabase } from '$lib/server/supabaseServiceClient'
import Chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const isVercel = !!process.env.VERCEL

export async function GET({ url }) {
    const id = url.searchParams.get('id')

    if (!id)
        return new Response('Missing id', { status: 400 })

    const { error } = await supabase
        .from('network')
        .select()
        .eq('slack_id', id)
        .single()

    if (error) {
        if (error.code === "PGRST116") {
            return new Response(JSON.stringify({
                error: "id not stored in network"
            }), { status: 400 })
        }

        return new Response(JSON.stringify({
            error: "something bad happened... network db read failed with an error, please report this to someone!",
            details: error
        }), { status: 400 })
    }

    const browser = await puppeteer.launch(
        isVercel
            ? {
                args: Chromium.args,
                executablePath: await Chromium.executablePath(),
                headless: Chromium.headless
            }
            : {
                channel: 'chrome', //local chrome
                headless: true
            }
    )

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })

    await page.goto(`${PUBLIC_BASE_URL}?id=${id}&bot=true`, { waitUntil: 'networkidle2' })

    const element = await page.waitForSelector("#viewport")
    await element.evaluate(el => el.scrollIntoView())

    //await new Promise(resolve => setTimeout(resolve, 1500))

    const screenshot = await element.screenshot({
        type: 'png',
        clip: {
            x: 0,
            y: 0,
            width: 501,
            height: 370
        }
    })

    await browser.close()

    return new Response(screenshot, {
        headers: { 'Content-Type': 'image/png' }
    })
};
