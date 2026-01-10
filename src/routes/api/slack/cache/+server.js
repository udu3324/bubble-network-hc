import { SLACK_BOT_OAUTH_TOKEN } from '$env/static/private'

import { supabase } from "$lib/server/supabaseServiceClient"
import { WebClient } from "@slack/web-api"
import { json } from "@sveltejs/kit"

export async function GET({ url }) {
    const id = url.searchParams.get("id")

    if (!id) {
        return new Response("no valid slack id provided", { status: 401 })
    }

    const web = new WebClient(SLACK_BOT_OAUTH_TOKEN)
    const profileRes = await web.users.profile.get({
        user: id
    })
    
    if (!profileRes.ok) {
        return new Response(JSON.stringify({
                error: "something bad happened... slack api users.profile.get failed with an error, please report this to someone!",
                details: profileRes.error
            }), { status: 400 })
    }

    const { profile } = profileRes

    let username = (profile.display_name.length === 0) ? profile.real_name : profile.display_name

    const { error } = await supabase
        .from('cache')
        .upsert({
            modified_at: new Date().toISOString(),
            slack_id: id,
            username: username,
            profile_picture: profile.image_192
        }, {
            onConflict: 'slack_id'
        })

    if (error) {
        return new Response(JSON.stringify({
                error: "something bad happened... cache storage failed with an error, please report this to someone!",
                details: error
            }), { status: 400 })
    }

    return new Response("good", { status: 200 })
}