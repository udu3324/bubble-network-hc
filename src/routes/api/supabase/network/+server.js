import { supabase } from '$lib/server/supabaseServiceClient';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const id = url.searchParams.get("id")

    if (!id) {
        return new Response(JSON.stringify({
            error: "no id provided"
        }), { status: 400 })
    }
    
    const { data, error } = await supabase
            .from('network')
            .select()
            .eq('slack_id', id)
            .single()
    
    if (error) {

        if (error.code === "PGRST116") {
            return new Response(JSON.stringify({
                error: "id not stored in network"
            }), { status: 400 })
        }

        return new Response(JSON.stringify({
            error: "something bad happened... network db read failed with an error, please report this to someone!",
            details: error
        }), { status: 400 })
    }

    return json({
        slack_id: data.slack_id,
        id_list: data.id_list,
        id_list_special: data.id_list_special
    }, { status: 200 })
}
