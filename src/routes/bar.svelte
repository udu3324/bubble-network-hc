<script>
    import { page } from "$app/stores"
    import { settingsPanelVisiblie } from "$lib"
    import {
        canvas,
        kingModeW,
        king,
        nodes,
        reset,
        setCanvas,
        masterData,
        slackConnections,
        originalIds,
        recenter
    } from "$lib/visualizer"
    import SearchTab from "./SearchBar.svelte"

    let canvasEdit
    let context

    let canvasWidth
    let canvasHeight

    let recenterDisabled = false

    kingModeW.subscribe((zoomed) => {
        recenterDisabled = !zoomed
    })

    let prevX = 0
    let prevY = 0

    function url() {
        navigator.clipboard.writeText($page.url)

        setTimeout(function() { alert("Copied link to clipboard.\n\nGenerate a sharable image next!") }, 1)
    }

    function share() {
        if (!navigator.clipboard || !window.ClipboardItem) {
            alert("clipboard is not supported in your browser :(")
            return
        }

        prevX = canvas.width
        prevY = canvas.height

        canvasWidth = 501
        canvasHeight = 370
        canvasEdit.width = canvasWidth
        canvasEdit.height = canvasHeight

        setCanvas(canvas, canvasWidth, canvasHeight)
        context = canvasEdit.getContext("2d")

        setTimeout(shareAction, 50)
    }

    async function shareAction() {
        // put node canvas onto the copy canvas
        let scale = 1
        let dx = 0,
            dy = 0
        let username = nodes[king].displayName
        let amount = slackConnections[king].length

        // calculate rank
        let rank = originalIds.indexOf(nodes[king].user) + 1
        if (rank <= 0) {
            rank = "N/A"
        }

        // calculate date
        let date = new Date()

        if (canvas.width < canvasWidth) {
            scale = canvasWidth / canvas.width
        }
        context.drawImage(
            canvas,
            dx,
            dy,
            canvasWidth / scale,
            canvasHeight / scale,
            0,
            0,
            canvasWidth,
            canvasHeight,
        )

        // draw the bar
        let barHeight = 100

        context.fillStyle = "#050a17"
        context.fillRect(0, canvasHeight - barHeight, canvasWidth, barHeight)

        // info text
        context.font = "bold 22px Nebula Sans"
        context.fillStyle = "white"
        let displayText = `@${username}`
        context.fillText(displayText, barHeight, canvasHeight - barHeight + 25)
        
        context.font = "22px Nebula Sans"
        displayText =  "has over " + amount + " connections!"
        context.fillText(displayText, barHeight, canvasHeight - barHeight + 50)

        //context.font = "bold 22px Courier"
        //displayText =  "         " + amount
        //context.fillText(displayText, barHeight, canvasHeight - barHeight + 50)

        // rank + date
        let today = date.getFullYear() + "/" + (1+date.getMonth()) + "/" + date.getDate()
        context.font = "14px Nebula Sans"
        displayText =  "rank #" + rank + "  -  " + today
        context.fillText(displayText, barHeight, canvasHeight - barHeight + 67) // 6.. 6.. 67!!!

        // advertisement
        let adShift = 55
        context.fillStyle = "lightblue"
        context.font = "18px Nebula Sans"
        displayText =  "get yours in #bubble"
        context.fillText(displayText, barHeight+adShift, canvasHeight - barHeight + 90) 
        //context.font = "bold 18px Nebula Sans"
        //displayText =  "             #bubble"
        //context.fillText(displayText, barHeight+adShift, canvasHeight - barHeight + 90) 

        // draw image
        const userImage = new Image()
        userImage.src = `/api/slack/avatar?url=${encodeURIComponent(masterData[king].profile_picture)}`
        await new Promise((resolve, reject) => {
            userImage.onload = () => resolve(userImage)
            userImage.onerror = reject
        })
        context.drawImage(userImage, 5, canvasHeight - 95, 90,90)

        // copy the canvas
        canvasEdit.toBlob(function (blob) {
            const item = new ClipboardItem({ "image/png": blob })
            //console.log("writing", item)

            navigator.clipboard
                .write([item])
                .then(() => alert("Copied to clipboard!"))
                .catch((err) => console.error("Clipboard error:", err))
        })

        setCanvas(canvas, prevX, prevY)
    }
</script>

<canvas
    bind:this={canvasEdit}
    width={canvasWidth}
    height={canvasHeight}
    style="position:absolute; left:-9999px;"
></canvas>

<div class="bg-slate-900 mt-3 h-10 rounded-lg flex space-x-2 relative">
    <button
        title="toggle info panel"
        class="bg-stone-600 text-stone-100"
        on:click={() => settingsPanelVisiblie.update(v => !v)}
    >
        <i class="fa-solid fa-cog"></i>
    </button>
    <button
        title="recenter the visualizer"
        class="bg-blue-600 text-blue-100"
        on:click={recenter}
    >
        <i class="fa-solid fa-arrows-to-dot"></i> Recenter
    </button>
    <button
        title="unfocus from a focused view"
        disabled={recenterDisabled}
        class="bg-amber-600 text-amber-100"
        on:click={reset}
    >
        <i class="fa-solid fa-expand"></i> Unfocus
    </button>

    <SearchTab/>
    
    <div class="absolute right-0 space-x-2">
        <button
            title="copy the link to this focused bubble"
            disabled={recenterDisabled}
            class="bg-green-600 text-green-100"
            on:click={url}
        >
            <i class="fa-solid fa-link"></i> Link
        </button>
        <button
            title="generate a sharable image (works only in focused mode)"
            disabled={recenterDisabled}
            class="bg-green-600 text-green-100"
            on:click={share}
        >
            <i class="fa-solid fa-image"></i> Share
        </button>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    button {
        @apply text-xl rounded-lg h-10 px-3 cursor-pointer font-light hover:brightness-90;
    }

    button:disabled {
        @apply cursor-not-allowed brightness-40;
    }
</style>
