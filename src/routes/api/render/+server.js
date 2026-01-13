import { PUBLIC_BASE_URL } from '$env/static/public'
import { getBrowser } from '$lib/server'
import { supabase } from '$lib/server/supabaseServiceClient'

export async function GET({ url }) {
    return new Response(JSON.stringify({
                error: "endpoint down temporarily"
            }), { status: 503 })

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

    const browser = await getBrowser()

    const page = await browser.newPage()
    await page.setViewport({ width: 850, height: 500 })

    await page.goto(`${PUBLIC_BASE_URL}?id=${id}&bot=true`, { 
        waitUntil: 'domcontentloaded'
    })

    const element = await page.waitForSelector("#viewport")
    await element.evaluate(el => el.scrollIntoView())

    //await new Promise(resolve => setTimeout(resolve, 1500))
    await page.waitForFunction(() => window.__readyForScreenshot === true)

    const screenshot = await element.screenshot({
        type: 'png',
        clip: {
            x: 0,
            y: 0,
            width: 501,
            height: 370
        }
    })

    await page.close()

    return new Response(screenshot, {
        headers: { 'Content-Type': 'image/png' }
    })
};
