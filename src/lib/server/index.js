import { SLACK_ORGANIZATION_ID, SLACK_WEBHOOK_STATUS, SLACK_WEBHOOK_LOGS } from "$env/static/private"
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

// <3 https://stackoverflow.com/a/47065313/16216937
export async function webhookStatusSend(message) { //public channel
    await fetch(SLACK_WEBHOOK_STATUS, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({
            "text": message
        })
    }).then(res => {
        //console.log("Request complete! response:", res);
    })
}

export async function webhookLogSend(message) { //private
    await fetch(SLACK_WEBHOOK_LOGS, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({
            "text": `\`${new Date().toUTCString()}\` ${sanitize(message)}`
        })
    }).then(res => {
        //console.log("Request complete! response:", res);
    })
}

function sanitize(string) {
    return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}