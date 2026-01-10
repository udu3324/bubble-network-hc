import { PUBLIC_BASE_URL } from "$env/static/public"
import { inOrg, webhookLogSend } from "$lib/server"
import { supabase } from "$lib/server/supabaseServiceClient"
import { WebClient } from "@slack/web-api"
import { json } from "@sveltejs/kit"

export async function GET({ url }) {

    const code = url.searchParams.get("code")
    const error1 = url.searchParams.get("error")

    //slack has redirected with an error param in the url

    if (error1) {
        if (error1 == "access_denied") {
            return new Response(JSON.stringify({
                error: "you pressed cancel! if you are concerned about privacy, read this",
                details: `${process.env.PUBLIC_BASE_URL}/info`
            }), { status: 400 })
        } else {
            webhookLogSend(`unknown initial oauth error of ${error1}`)

            return new Response(JSON.stringify({
                error: "something bad happened... please report this to someone!",
                details: error1
            }), { status: 400 })
        }
    }

    //slack api has now given a code that can be exchanged for an api token

    const redirectURI = `${process.env.PUBLIC_BASE_URL}/api/slack/callback`

    const res = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            redirect_uri: redirectURI
        })
    })

    const data = await res.json()

    if (!data.ok) {
        webhookLogSend(`unknown stage 1 oauth error\n${data}\n${data.error}`)

        return new Response(JSON.stringify({
            error: "something bad has happened... slack oauth has failed, please report this to someone!",
            details: data.error
        }), { status: 400 })
    }

    // save user id, display name, and pfp url to supabase
    
    const userInfo = data.authed_user

    // check if oauth is inside specific org
    const insideOrg = inOrg(userInfo.access_token)

    if (!insideOrg) {
        webhookLogSend(`id-${userInfo.id} tried oauth of wrong organization`)

        return new Response(JSON.stringify({
                error: "your organization is not authorized to use this app",
            }), { status: 400 })
    }

    try {
        const res2 = await fetch(`${PUBLIC_BASE_URL}/api/slack/cache?id=${userInfo.id}`)
    
        if (!res2.ok) {
            const errTxt = await res2.text()

            webhookLogSend(`id-${userInfo.id} failed db cache storage\n${errTxt}`)

            return new Response(JSON.stringify({
                error: "something bad happened... cache storage failed with an error, please report this to someone!",
                details: errTxt
            }), { status: 400 })
        }
    } catch (err) {
        webhookLogSend(`id-${userInfo.id} failed db cache storage but worse\n${err}\n${err.message}`)

        return new Response(JSON.stringify({
            error: "something very very bad happened... internal endpoint call to cache failed with an error, please report this to someone!",
            details: err.message
        }), { status: 400 })
    }

    // save user info for slack api

    return new Response(`
        <!DOCTYPE html>
        <head>
            <title>sucess</title>
        </head>
        <body>
            <span>slack oauth sucessfull. window is closing automatically in a second.</span>

            <script>
                localStorage.setItem('user_id', '${userInfo.id}')
                localStorage.setItem('token', '${userInfo.access_token}')

                setTimeout(() => {
                    window.close()
                }, 1000);

            </script>
        </body>
        </html>
        `, {
            headers: { "Content-Type": "text/html" },
            status: 200
        })
}