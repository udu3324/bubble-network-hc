import { SLACK_BOT_OAUTH_TOKEN } from '$env/static/private'

import sql from "$lib/server/db"
import { WebClient } from "@slack/web-api"

export async function GET({ url }) {
    const id = url.searchParams.get("id")

    if (!id) {
        return new Response("no valid slack id provided", { status: 401 })
    }

    const web = new WebClient(SLACK_BOT_OAUTH_TOKEN)
    let profileRes
    try {
        profileRes = await web.users.profile.get({
            user: id
        })
    } catch (error) {
        if (error.data.error === "user_not_found") {
            return new Response(JSON.stringify({
                error: "id provided is not a valid user"
            }), { status: 401 })
        }
        
        return new Response(JSON.stringify({
                error: "something bad happened... slack api users.profile.get failed with an error, please report this to someone!",
                details: error
            }), { status: 400 })
    }

    const { profile } = profileRes

    let username = (profile.display_name.length === 0) ? profile.real_name : profile.display_name

    try {
        await sql`
            insert into cache
                (modified_at, slack_id, username, profile_picture)
            values
                (${new Date()}, ${id}, ${username}, ${profile.image_192})        
            on conflict (slack_id)
            do update set
                modified_at = EXCLUDED.modified_at,
                username = EXCLUDED.username,
                profile_picture = EXCLUDED.profile_picture
        `
    } catch (error) {
        console.log("error is", error)
        return new Response(JSON.stringify({
                error: "something bad happened... cache storage failed with an error, please report this to someone!",
                details: error
            }), { status: 400 })
    }

    return new Response("good", { status: 200 })
}