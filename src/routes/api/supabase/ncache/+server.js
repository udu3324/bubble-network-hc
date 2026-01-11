import { PUBLIC_BASE_URL } from "$env/static/public"
import { authTest, webhookLogSend, webhookStatusSend } from "$lib/server"
import pLimit from "p-limit"
const limit = pLimit(5)

export async function GET({ request }) {
    
    const auth_header = request.headers.get("Authorization")
    const key = auth_header?.replace("Bearer ", "").trim()

    const id = request.headers.get("slack_id")

    if (!key) {
        return new Response(JSON.stringify({
                error: "no slack key provided",
            }), { status: 401 })
    }

    if (!id) {
        return new Response(JSON.stringify({
                error: "no slack id provided",
            }), { status: 401 })
    }
    

    //confirm who is bulk caching network 
    const auth = await authTest(key, id)

    if (!auth) {
        webhookLogSend(`id-${id} with key-${key.substring(0, 8)} attempted an unauthorized ncache`)
        
        return new Response(JSON.stringify({
                error: "slack key does not match to id. request blocked.",
            }), { status: 401 })
    }

    //fetch network data
    const res = await fetch(`${PUBLIC_BASE_URL}/api/supabase/network?id=${id}`)

    if (!res.ok) {
        webhookLogSend(`id-${id} with key-${key.sub.substring(0, 8)} tried ncache without network data`)

        return new Response(JSON.stringify({
                error: "could not find any data in network for id provided",
            }), { status: 400 })
    }

    const data = await res.json()

    const id_list = data.id_list
    
    //let count = 0
    //console.log("total", id_list.length)
    //console.log(id_list)

    const tasks = id_list.map(id => 
        limit( async () => {
            //count++
            //console.log(`on currently ${count} of ${id}`)

            // no clue how this would happen
            if (typeof id !== "string") {
                return
            }

            // bots break?
            if (id.startsWith('B')) {
                //console.log("AAAAAAAA")
                return
            }

            const res2 = await fetch(`${PUBLIC_BASE_URL}/api/slack/cache?id=${id}`) 
            
            if (!res2.ok) {
                webhookLogSend(`id-${id} tried ncache and failed\n${res2}\n${res2.ok}`)

                throw new Error(`cache failed for ${id}`)
            }
        })
    )

    try {
        await Promise.all(tasks)
    } catch (err) {
        webhookLogSend(`id-${id} tried ncache and failed conversations.history\n${err.message}`)
        
        return new Response(JSON.stringify({
            error: "something bad happened... slack api conversations.history failed with an error, please report this to someone!",
            details: err.message
        }), { status: 400 })
    }

    webhookLogSend(`id-${id} sucessful ncache`)
    webhookStatusSend(`<@${id}> is now on bubble network. See their connections <${PUBLIC_BASE_URL}?id=${id}|here>!`, `${PUBLIC_BASE_URL}/api/render?id=${id}`)

    return new Response(JSON.stringify({
        good: "yes"
    }), { status: 200 })
}