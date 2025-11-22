import { json } from "@sveltejs/kit";

export async function GET({ url }) {
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    //slack has redirected with an error param in the url

    if (error) {
        if (error == "access_denied") {
            return new Response(JSON.stringify({
                error: "you pressed cancel! if you are concerned about privacy, read more here below",
                details: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy`
            }), { status: 400 })
        } else {
            return new Response(JSON.stringify({
                error: "something bad happened... please report this to someone!",
                details: error
            }), { status: 400 })
        }
    }

    //slack api has now given a code that can be exchanged for an api token

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
            error: "something bad has happened... slack oauth has failed, please report this to someone!",
            details: data.error
        }), { status: 400 })
    }
        

    const userInfo = data.authed_user

    return new Response("you can close this window and go back", { status: 200 })
}