import { supabase } from "$lib/server/supabaseServiceClient";
import { json } from "@sveltejs/kit";

export async function GET({ request }) {

    // get the session_id from the cookies in the header

    const cookieHeader = request.headers.get("cookie")

    const cookies = Object.fromEntries(
        cookieHeader?.split('; ').map(c => {
            const [key, value] = c.split('=')
            return [key, value]
        })
    )

    const session_id = cookies['session_id']

    if (!session_id) {
        return new Response(JSON.stringify({
            error: "session_id cookie not found. did you do slack oauth?"
        }), { status: 400 })
    }

    // request supabase for slack token stuff with the session id

    const { data: session, error } = await supabase
        .from("slack_sessions")
        .select("*")
        .eq("session_id", session_id)
        .single()

    console.log("ok", session)

    // supabase returned error!!!!
    if (error) {
        return new Response(JSON.stringify({
            message: "error while fetching supabase! please report this to someone!",
            error: error
        }), { status: 500 })
    }

    // supabase returned empty
    if (!session) {
        return new Response(JSON.stringify({
            error: "session_id possibly invalid or expired. please do slack oauth again."
        }), { status: 401 })
    }

    return new Response("session good", { status: 200 })
}