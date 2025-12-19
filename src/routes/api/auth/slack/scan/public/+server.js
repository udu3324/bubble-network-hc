import { WebClient } from "@slack/web-api";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {

    const key = url.searchParams.get("key")
    const id = url.searchParams.get("id")

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

    const web = new WebClient(key)
    const response = await web.users.conversations({
        user: id
    })
    
    if (!response.ok) {
        return new Response(JSON.stringify({
                error: "something bad happened... slack api users.conversations failed with an error, please report this to someone!",
                details: response
            }), { status: 400 })
    }
    
    let user_ids = []

    // for each channel
    for (const channel of response.channels) {

        // for its history (i would do pagination but like im done)
        const res2 = await web.conversations.history({
            channel: channel.id,
            limit: 1000
        })

        if (!res2.ok) {
            return new Response(JSON.stringify({
                    error: "something bad happened... slack api conversations.history failed with an error, please report this to someone!",
                    details: response
                }), { status: 400 })
        }

        // for each message in its history
        for (const message of res2.messages) {

            //is it a thread
            if (!message.thread_ts) {
                continue
            }

            const author_id = message.user
            const reply_users = message.reply_users

            //does it have any replies from people
            if (!reply_users) {
                continue
            }

            //does the author or replies contain the user id
            if ((author_id === id) || reply_users.includes(id)) {
                user_ids.push(author_id, ...reply_users)
            }
        }
    }

    // filter out duplicates
    user_ids = [...new Set(user_ids)]

    // filter out requesting user
    user_ids.splice(user_ids.indexOf(id), 1)

    console.log(user_ids)

    return new Response(JSON.stringify({
                ids: user_ids
            }), { status: 200 })
}