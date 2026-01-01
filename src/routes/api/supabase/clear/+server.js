import { authTest, webhookLogSend } from "$lib/server";
import { supabase } from "$lib/server/supabaseServiceClient";
import { WebClient } from "@slack/web-api";
import { json } from "@sveltejs/kit";

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

    const res = await supabase
        .from('network')
        .delete()
        .eq('slack_id', id)
        .select()

    if (res.error) {
        webhookLogSend(`id-${id} failed to clear network db row\n${res}\n${res.status}\n${res.statusText}`)
        
        return new Response(JSON.stringify({
            error: "something bad has happened... db network delete has failed, please report this to someone!",
            details: `${res} ${res.status} ${res.statusText}`
        }), { status: 500 })
    }

    if (res.data.lenth === 0) {
        return new Response(JSON.stringify({
            details: "no data found",
        }), { status: 204 })
    }

    return new Response(JSON.stringify({
            details: "good",
        }), { status: 200 })
}