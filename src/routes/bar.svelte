<script>
    import { zoomedToKing, kingModeW, reset } from "$lib/visualizer";

    let recenterDisabled = false

    kingModeW.subscribe(zoomed => {
        recenterDisabled = !zoomed
    })
</script>
<div class="bg-slate-900 mt-3 h-10 rounded-lg flex space-x-2">
    <button disabled={recenterDisabled} class="bg-blue-600 text-blue-100" on:click={reset}>
        <i class="fa-solid fa-arrows-to-dot"></i> Reset View
    </button>

    <button class="bg-green-600 text-green-100">
        <i class="fa-solid fa-floppy-disk"></i> Save Image
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