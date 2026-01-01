import { PUBLIC_BASE_URL } from "$env/static/public";
import { authTest, webhookLogSend, webhookStatusSend } from "$lib/server";
import { supabase } from "$lib/server/supabaseServiceClient";
import { WebClient } from "@slack/web-api";
import { json } from "@sveltejs/kit";
import pLimit from "p-limit";
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

    //confirm who is doing the scan
    const auth = await authTest(key, id)

    if (!auth) {
        webhookLogSend(`id-${id} with key-${key.substring(0, 8)} attempted an unauthorized scan.public`)
        
        return new Response(JSON.stringify({
                error: "slack key does not match to id. request blocked.",
            }), { status: 401 })
    }

    //get all the public channels that the user is in
    const web = new WebClient(key)
    const response = await web.users.conversations({
        user: id
    })
    
    if (!response.ok) {
        webhookLogSend(`id-${id} failed slack api users.conversations\n${response.ok}\n${response}`)
        
        return new Response(JSON.stringify({
                error: "something bad happened... slack api users.conversations failed with an error, please report this to someone!",
                details: response
            }), { status: 400 })
    }

    //console.log("size is", response.channels.length)
    //let count = 0

    // for each channel, pull its history
    let history
    try {
        history = await Promise.all(
            response.channels.map(channel => 
                limit(async () => {
                    //count++
                    //console.log(`doing channel ${count} ${channel.id}`)
                    
                    const res2 = await web.conversations.history({
                        channel: channel.id,
                        limit: 1000
                    })

                    if (!res2.ok) {
                        webhookLogSend(`id-${id} failed slack api users.conversations.history\n${res2}`)

                        throw new Error(`failed fetching history of channel ${channel.id}, details: ${res2}`)
                    }

                    return res2.messages
                })
            )
        )
    } catch (err) {
        webhookLogSend(`id-${id} failed slack api users.conversations.history\n${err}\n${err.message}`)

        return new Response(JSON.stringify({
            error: "something bad happened... slack api conversations.history failed with an error, please report this to someone!",
            details: err.message
        }), { status: 400 })
    }
    
    let user_ids = new Set()

    //console.log("finished")

    //for all histories scanned of messages in all public channels
    for (const hist of history) {
        for (const message of hist) {
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
                user_ids.add(author_id)
                reply_users.forEach(uid => user_ids.add(uid))
            }
        }
    }

    //store in db
    const { error } = await supabase
        .from('network')
        .upsert({
            modified_at: new Date().toISOString(),
            slack_id: id,
            id_list: [...user_ids]
        }, {
            onConflict: 'slack_id'
        })

    if (error) {
        webhookLogSend(`id-${id} failed db upsert\n${error}`)

        return new Response(JSON.stringify({
                error: "something bad happened... network storage failed with an error, please report this to someone!",
                details: error
            }), { status: 400 })
    }

    //console.log(user_ids)
    webhookStatusSend(`<@${id}> is now on bubble network. See their *${user_ids.size}* connections <${PUBLIC_BASE_URL}?id=${id}|here>!`)

    return json({
        ids: [...user_ids]
    })
}