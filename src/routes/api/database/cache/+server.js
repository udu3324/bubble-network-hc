import sql from "$lib/server/db"
import { json } from '@sveltejs/kit'

export async function GET({ url }) {
    const id = url.searchParams.get("id")

    if (!id) {
        return new Response(JSON.stringify({
            error: "no id provided"
        }), { status: 400 })
    }

    let [data] = []
    try {
        [data] = await sql`
            select *
            from
                cache
            where
                slack_id = ${id}
        `
    } catch (error) {
        return new Response(JSON.stringify({
            error: "something bad happened... cache db read failed with an error, please report this to someone!",
            details: error
        }), { status: 400 })
    }

    if (data === undefined) {
        return new Response(JSON.stringify({
            error: "id not stored in cache"
        }), { status: 400 })
    }


    return json({
        slack_id: data.slack_id,
        username: data.username,
        profile_picture: data.profile_picture
    }, { status: 200 })
}
