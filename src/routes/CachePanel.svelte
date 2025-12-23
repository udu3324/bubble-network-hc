<script>
    import { hasData, isAuthed } from "$lib";

    let output = "..."
    let disableCaching = true

    hasData.subscribe((value) => {
        disableCaching = !hasData
    })

    function cache() {
        //todo
    }
</script>
<div>
    {#if $isAuthed}
    <div class="w-full bg-slate-800 rounded-lg p-3 mt-8">
        <button disabled={disableCaching} onclick={cache}>Cache Built Network</button>

        <div class="bg-slate-300 min-h-10 p-2 rounded-lg mt-2 text-black">
            <span class="font-mono">{output}</span>
        </div>
    </div>
    {/if}
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply p-3 bg-slate-900 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-600;
    }

    button:disabled {
        @apply bg-slate-900 text-slate-800 cursor-auto; 
    }
</style>