<script>
    import { infoPanelVisible } from "$lib";
    import { zoomedToKing, kingModeW, reset } from "$lib/visualizer";

    let recenterDisabled = false

    kingModeW.subscribe(zoomed => {
        recenterDisabled = !zoomed
    })

    function toggleInfoPanel() {
        console.log(infoPanelVisible)
        infoPanelVisible.update(bool => !bool)
    }
</script>
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

    <button disabled class="bg-green-600 text-green-100 absolute right-0">
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