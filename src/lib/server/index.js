import { WebClient } from "@slack/web-api"

export async function authTest(key, id) {
    const web = new WebClient(key)
    const profileRes = await web.auth.test()
    
    if (id === profileRes.user_id) {
        return true
    }

    return false
}