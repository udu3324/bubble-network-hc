<script>
    import { infoPanelVisible } from "$lib"
    import { canvas, ctx, kingModeW, reset } from "$lib/visualizer"

    let canvasEdit
    let context

    let canvasWidth
    let canvasHeight

    let recenterDisabled = false

    kingModeW.subscribe(zoomed => {
        recenterDisabled = !zoomed
    })

    function toggleInfoPanel() {
        console.log(infoPanelVisible)
        infoPanelVisible.update(bool => !bool)
    }

    function share() {
        if (!navigator.clipboard || !window.ClipboardItem) {
            alert("clipboard is not supported in your browser :(")
            return
        }

        canvasWidth = 501
        canvasHeight = 370
        canvasEdit.width = canvasWidth
        canvasEdit.height = canvasHeight

        context = canvasEdit.getContext('2d')
        
        context.fillStyle = "black"
        context.fillRect(0, 0, canvasWidth, canvasHeight)

        context.drawImage(
            canvas, 
            0, 0,
            501, 302,
            0, 0,
            501, 302)

        canvasEdit.toBlob(function(blob) { 
            const item = new ClipboardItem({ "image/png": blob })
            console.log("writing", item)

            navigator.clipboard.write([item])
                .then(() => alert("Copied to clipboard!"))
                .catch(err => console.error("Clipboard error:", err))
        })
    }
</script>

<canvas bind:this={canvasEdit} width={canvasWidth} height={canvasHeight} style="position:absolute; left:-9999px;"></canvas>

<div class="bg-slate-900 mt-3 h-10 rounded-lg flex space-x-2 relative">
    <button title="toggle info panel" class="bg-stone-600 text-stone-100" on:click={toggleInfoPanel}>
        {#if $infoPanelVisible}
        <i class="fa-solid fa-circle-info"></i>
        {:else}
        <i class="fa-solid fa-eye-slash"></i>
        {/if}
    </button>
    <button disabled={recenterDisabled} class="bg-blue-600 text-blue-100" on:click={reset}>
        <i class="fa-solid fa-arrows-to-dot"></i> Reset View
    </button>

    <button disabled={recenterDisabled} class="bg-green-600 text-green-100 absolute right-0" on:click={share}>
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