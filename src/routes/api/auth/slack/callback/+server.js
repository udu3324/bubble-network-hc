import { json } from "@sveltejs/kit";

export async function GET({ url }) {
    const code = url.searchParams.get("code")

    const redirectURI = "https://bubble-network-hc.vercel.app/api/auth/slack/callback"

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
            error: "slack oauth has failed, more details below",
            details: data.error
        }), { status: 400 })
    }
        

    const userInfo = data.authed_user

    return new Response("you can close this window and go back", { status: 200 })
}