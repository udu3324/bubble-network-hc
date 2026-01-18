import { PUBLIC_BASE_URL } from '$env/static/public'
import { camera, gen, render, setCanvas, setKing } from '$lib/server/simpleVisualizer'
import { foobar1, foobar3 } from '$lib/supabaseClient'
import { createCanvas, loadImage, registerFont } from 'canvas'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

registerFont(
    path.join(__dirname, "fonts/NebulaSans-Book.ttf"),
    { family: "Nebula Sans", weight: "normal" }
)

registerFont(
    path.join(__dirname, "fonts/NebulaSans-Bold.ttf"),
    { family: "Nebula Sans", weight: "bold" }
)

const canvasWidth = 501
const canvasHeight = 370

export async function GET({ url }) {

    const id = url.searchParams.get('id')

    if (!id)
        return new Response('Missing id', { status: 400 })

    const masterArray = await foobar1()

    const bubble = masterArray.find(u => u.slack_id === id)

    if (!bubble) {
        return new Response(JSON.stringify({
            error: "id not stored in network"
        }), { status: 400 })
    }

    const masterData = await foobar3()

    const res = await fetch(`${PUBLIC_BASE_URL}/api/supabase/cache?id=${id}`)

    if (!res.ok) {
        return new Response(JSON.stringify({
            error: "could not find cache of this user"
        }), { status: 400 })
    }

    const data = await res.json()


    //optimize masterData
    let optimizedData = []
    masterData.forEach(cache => {
        if (bubble.id_list.includes(cache.slack_id) || bubble.id_list.includes(id)) {
            optimizedData.push(cache)
        }
    })

    //have the focused user at the start of the array
    const index = optimizedData.findIndex(c => c.slack_id === id)
    
    if (index > 0) {
        const [item] = optimizedData.splice(index, 1)
        optimizedData.unshift(item)
    }

    //canvas
    const canvasNetwork = createCanvas(canvasWidth, canvasHeight)
    //const ctxNetwork = canvasNetwork.getContext('2d')
    setCanvas(canvasNetwork, canvasWidth, canvasHeight)
    
    await gen([bubble], optimizedData)
    setKing(0)
    camera.zoom = 0.12 //0.12

    render()

    const canvasShare = createCanvas(canvasWidth, canvasHeight)
    const ctxShare = canvasShare.getContext('2d')

    // calculate date
    let date = new Date()

    ctxShare.drawImage(
        canvasNetwork,
        0,
        0,
        canvasWidth,
        canvasHeight,
        0,
        0,
        canvasWidth,
        canvasHeight,
    )

    // calculate rank
    let rank = masterArray.indexOf(bubble) + 1
    if (rank <= 0) {
        rank = "N/A"
    }

    // draw the bar
    let barHeight = 100

    ctxShare.fillStyle = "#050a17"
    ctxShare.fillRect(0, canvasHeight - barHeight, canvasWidth, barHeight)

    // info text
    ctxShare.font = "bold 22px Nebula Sans"
    ctxShare.fillStyle = "white"
    let displayText = `@${data.username}`
    ctxShare.fillText(displayText, barHeight, canvasHeight - barHeight + 25)
    
    ctxShare.font = "22px Nebula Sans"
    displayText =  "has over " + bubble.id_list.length + " connections!"
    ctxShare.fillText(displayText, barHeight, canvasHeight - barHeight + 50)

    //context.font = "bold 22px Courier"
    //displayText =  "         " + amount
    //context.fillText(displayText, barHeight, canvasHeight - barHeight + 50)

    // rank + date
    let today = date.getFullYear() + "/" + (1+date.getMonth()) + "/" + date.getDate()
    ctxShare.font = "14px Nebula Sans"
    displayText =  "rank #" + rank + "  -  " + today
    ctxShare.fillText(displayText, barHeight, canvasHeight - barHeight + 67) // 6.. 6.. 67!!!

    // advertisement
    let adShift = 55
    ctxShare.fillStyle = "lightblue"
    ctxShare.font = "18px Nebula Sans"
    displayText =  "get yours in #bubble"
    ctxShare.fillText(displayText, barHeight+adShift, canvasHeight - barHeight + 90) 
    //context.font = "bold 18px Nebula Sans"
    //displayText =  "             #bubble"
    //context.fillText(displayText, barHeight+adShift, canvasHeight - barHeight + 90) 

    // draw image
    await loadImage(data.profile_picture).then((image) => {
        ctxShare.drawImage(image, 5, canvasHeight - 95, 90,90)
    })

    const buffer = await canvasShare.toBuffer('image/png')

    return new Response(buffer, {
        headers: { 'Content-Type': 'image/png' }
    })
};
