import { supabase } from "$lib/server/supabaseServiceClient"
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

    // this is impossible without the bot being invited to the user's private channels...

    return new Response(`dont use this endpoint`, {status: 200})
}