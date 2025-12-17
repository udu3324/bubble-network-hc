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
    
    // for each channel
    let channel_ids = []
    for (const channel of response.channels) {
        channel_ids.push(channel.id)

        if (channel.id !== "C0A40D4F5HU") {
            continue
        }

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

        // for each message in history
        for (const message of res2.messages) {

            //is it a thread
            if (!message.thread_ts) {
                continue
            }

            //does the author or replies contain the user id
            const author_id = message.user
            const reply_users = message.reply_users

            if ((author_id === id) || reply_users.includes(id)) {
                
            }
        }

        
    }

    console.log(channel_ids)

    

    return new Response(JSON.stringify({
                error: "sgood",
                details: response
            }), { status: 200 })
}