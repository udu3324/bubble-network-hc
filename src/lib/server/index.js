import { SLACK_ORGANIZATION_ID } from "$env/static/private"
import { WebClient } from "@slack/web-api"

export async function authTest(key, id) {
    const web = new WebClient(key)
    const profileRes = await web.auth.test()
    
    if (id === profileRes.user_id) {
        return true
    }

    return false
}

export async function inOrg(key) {
    const web = new WebClient(key)
    const profileRes = await web.auth.test()
    
    if (profileRes.team_id === SLACK_ORGANIZATION_ID) {
        return true
    }

    return false
}