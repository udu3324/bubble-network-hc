import { supabase } from "$lib/server/supabaseServiceClient";
import { WebClient } from "@slack/web-api";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {

    const code = url.searchParams.get("code")
    const error1 = url.searchParams.get("error")

    //slack has redirected with an error param in the url

    if (error1) {
        if (error1 == "access_denied") {
            return new Response(JSON.stringify({
                error: "you pressed cancel! if you are concerned about privacy, read this",
                details: `${process.env.PUBLIC_BASE_URL}/privacy`
            }), { status: 400 })
        } else {
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
            redirect_url: redirectURI
        })
    })

    const data = await res.json()

    if (!data.ok) {
        return new Response(JSON.stringify({
            error: "something bad has happened... slack oauth has failed, please report this to someone!",
            details: data.error
        }), { status: 400 })
    }

    // save user id, display name, and pfp url to supabase
    
    const userInfo = data.authed_user

    const web = new WebClient(userInfo.access_token) 
    const profileRes = await web.users.profile.get({
        user: userInfo.id
    })
    
    if (!profileRes.ok) {
        return new Response(JSON.stringify({
                error: "something bad happened... slack api users.profile.get failed with an error, please report this to someone!",
                details: error
            }), { status: 400 })
    }

    const { profile } = profileRes

    let username = (profile.display_name.length === 0) ? profile.real_name : profile.display_name

    const { error } = await supabase
        .from('cache')
        .upsert({
            modified_at: new Date().toISOString(),
            slack_id: userInfo.id,
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