<script>
    import { infoPanelVisible, isGrabbing, settingsPanelVisiblie } from "$lib"
    import { setPreformance, visibility } from "$lib/visualizer"

    let renderConnectionsOutside = false
    $: {
        if (renderConnectionsOutside) {
            setPreformance(visibility, true)
        } else {
            setPreformance(visibility, false)
        }
    }

    let hiddenClass = 'hidden'
    settingsPanelVisiblie.subscribe(visible => {
        hiddenClass = visible ? '' : 'hidden'
    })

    let connectionsRange = 50
    $: {
        setPreformance(connectionsRange, renderConnectionsOutside)
    }

    let pointerEvents = ''
    isGrabbing.subscribe(bool => {
        if (bool) {
            pointerEvents = 'pointer-events-none'
        } else {
            pointerEvents = ''
        }
    })
    
</script>

<div class="relative w-full h-full flex place-content-center">
    <div class="{hiddenClass} {pointerEvents} z-30 bg-black/50 text-white p-3 place-self-center">
        <label>
            <input bind:checked={$infoPanelVisible} type="checkbox">
            info panel visibility
        </label>
        <br>
        <label>
            <input bind:checked={renderConnectionsOutside} type="checkbox">
            render connections outside of viewport
        </label>
        <br>
        <br>
        <label>
            show nodes with smaller connections
            <br>
            <div class="flex gap-x-2">
                none <input type="range" min="0" max="100" bind:value={connectionsRange}> all
            </div>
        </label>
        <br>
        <button on:click={() => settingsPanelVisiblie.set(false)}>exit config</button>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    input {
        @apply mr-1;
    }

    input[type='range'] {
        @apply w-full;
    }

    button {
        @apply bg-black/40 px-5 py-1 cursor-pointer;
    }
</style>
