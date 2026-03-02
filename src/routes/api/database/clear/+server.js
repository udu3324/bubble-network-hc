import { authTest, webhookLogSend } from "$lib/server"
import sql from "$lib/server/db"
import { WebClient } from "@slack/web-api"
import { json } from "@sveltejs/kit"

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

    //before clearing data for this slack id, check if the id belongs to the key
    const auth = await authTest(key, id)

    if (!auth) {
        webhookLogSend(`id-${id} with key-${key.sub.substring(0, 8)} attempted an unauthorized clear`)
        
        return new Response(JSON.stringify({
                error: "slack key does not match to id. request blocked.",
            }), { status: 401 })
    }

    let data
    try {
        data = await sql`
            delete from network
            where
                slack_id = ${id}
            returning *
        `
    } catch (error) {
        webhookLogSend(`id-${id} failed to clear network db row\n${error}`)
        
        return new Response(JSON.stringify({
            error: "something bad has happened... db network delete has failed, please report this to someone!",
            details: error
        }), { status: 500 })
    }

    if (data.length === 0) {
        return new Response(JSON.stringify({
            details: "no data found",
        }), { status: 401 })
    }

    return new Response(JSON.stringify({
            details: "good",
        }), { status: 200 })
}