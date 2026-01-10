<script>
    import { infoPanelVisible } from "$lib";
    import {
        canvas,
        ctx,
        kingModeW,
        king,
        nodes,
        reset,
        centerX,
        centerY,
        setCenters,
        setCanvas,
        masterData,
        masterArray,
        slackIds,
        slackConnections,
        originalIds,
        recenter
    } from "$lib/visualizer";

    let canvasEdit;
    let context;

    let canvasWidth;
    let canvasHeight;

    let recenterDisabled = false;

    kingModeW.subscribe((zoomed) => {
        recenterDisabled = !zoomed;
    });

    function toggleInfoPanel() {
        console.log(infoPanelVisible);
        infoPanelVisible.update((bool) => !bool);
    }

    let prevX = 0;
    let prevY = 0;
    let userImage;

    function share() {
        if (!navigator.clipboard || !window.ClipboardItem) {
            alert("clipboard is not supported in your browser :(");
            return;
        }

        prevX = canvas.width;
        prevY = canvas.height;

        canvasWidth = 501;
        canvasHeight = 370;
        canvasEdit.width = canvasWidth;
        canvasEdit.height = canvasHeight;

        setCanvas(canvas, canvasWidth, canvasHeight);

        context = canvasEdit.getContext("2d");

        setTimeout(shareAction, 50);
        userImage = new Image();
        try {
            //userImage.crossOrigin = "anonymous"; // REMOVE REMOVE REMOVE REMOVE
            userImage.src = masterData[king].profile_picture;
            
        } catch (error) {
            console.error(error);
        }
    }

    function shareAction() {
        // put node canvas onto the copy canvas
        let scale = 1;
        let dx = 0,
            dy = 0;
        let username = nodes[king].displayName;
        let amount = slackConnections[king].length;


        // calculate rank
        let rank = originalIds.indexOf(nodes[king].user) + 1
        if (rank <= 0) {
            
            rank = "N/A";
        }

        // calculate date
        let date = new Date();

        if (canvas.width < canvasWidth) {
            scale = canvasWidth / canvas.width;
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
        );

        // draw the bar
        let barHeight = 100;

        context.fillStyle = "#050a17";
        context.fillRect(0, canvasHeight - barHeight, canvasWidth, barHeight);

        // info text
        context.font = "bold 22px Courier New";
        context.fillStyle = "white";
        let displayText = username;
        context.fillText(displayText, barHeight+10, canvasHeight - barHeight + 25);
        
        context.font = "22px Courier New";
        displayText =  "has over " + amount + " connections!"
        context.fillText(displayText, barHeight+10, canvasHeight - barHeight + 50);

        context.font = "bold 22px Courier New";
        displayText =  "         " + amount;
        context.fillText(displayText, barHeight+10, canvasHeight - barHeight + 50);

        // rank + date
        let today = date.getFullYear() + "/" + (1+date.getMonth()) + "/" + date.getDate()
        context.font = "14px monospace"
        displayText =  "rank #" + rank + "  -  " + today;
        context.fillText(displayText, barHeight+10, canvasHeight - barHeight + 67); // 6.. 6.. 67!!!

        // advertisement
        let adShift = 25;
        context.fillStyle = "lightblue";
        context.font = "18px Courier New";
        displayText =  "get yours in";
        context.fillText(displayText, barHeight+adShift, canvasHeight - barHeight + 85); 
        context.font = "bold 18px Courier New";
        displayText =  "             #bubble";
        context.fillText(displayText, barHeight+adShift, canvasHeight - barHeight + 85); 

        // draw image
        ctx.drawImage(userImage, 5, canvasHeight - 70, 65,65);

        // copy the canvas
        canvasEdit.toBlob(function (blob) {
            const item = new ClipboardItem({ "image/png": blob });
            console.log("writing", item);

            navigator.clipboard
                .write([item])
                .then(() => alert("Copied to clipboard!"))
                .catch((err) => console.error("Clipboard error:", err));
        });

        setCanvas(canvas, prevX, prevY);
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
        on:click={toggleInfoPanel}
    >
        {#if $infoPanelVisible}
            <i class="fa-solid fa-circle-info"></i>
        {:else}
            <i class="fa-solid fa-eye-slash"></i>
        {/if}
    </button>
    <button
        disabled={recenterDisabled}
        class="bg-blue-600 text-blue-100"
        on:click={reset}
    >
        <i class="fa-solid fa-arrows-to-dot"></i> Reset View
    </button>
    <button
        class="bg-blue-600 text-blue-100"
        on:click={recenter}
    >
        <i class="fa-solid fa-arrows-to-dot"></i> Recenter
    </button>

    <button
        disabled={recenterDisabled}
        class="bg-green-600 text-green-100 absolute right-0"
        on:click={share}
    >
        <i class="fa-solid fa-share"></i> Share
    </button>
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
