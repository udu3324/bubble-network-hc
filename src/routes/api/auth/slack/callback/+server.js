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

    if (!data.ok)
        return new Response("oauth failed", { status: 400 })

    const userInfo = data.authed_user

    return new Response("you can go back", { status: 200 })
}