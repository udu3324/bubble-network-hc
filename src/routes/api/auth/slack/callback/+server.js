import { supabase } from "$lib/server/supabaseServiceClient";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {

    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    //slack has redirected with an error param in the url

    if (error) {
        if (error == "access_denied") {
            return new Response(JSON.stringify({
                error: "you pressed cancel! if you are concerned about privacy, read this",
                details: `${process.env.PUBLIC_BASE_URL}/privacy`
            }), { status: 400 })
        } else {
            return new Response(JSON.stringify({
                error: "something bad happened... please report this to someone!",
                details: error
            }), { status: 400 })
        }
    }

    //slack api has now given a code that can be exchanged for an api token

    const redirectURI = `${process.env.PUBLIC_BASE_URL}/api/auth/slack/callback`

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

    // save user info for slack api
    
    const userInfo = data.authed_user

    const sessionID = crypto.randomUUID()

    await supabase.from("slack_sessions").insert({
        session_id: sessionID,
        slack_user_id: userInfo.id,
        access_token: userInfo.access_token
    })

    const cookie = serialize("linkin.auth", token, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response("you can close this window and go back", { status: 200 })
}