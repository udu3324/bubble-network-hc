<script>
    import { isAuthed } from "$lib";


    import OAuthButton from "./OAuthButton.svelte";
    
</script>

<div class="bg-slate-700 mr-3 p-3 w-72 rounded-lg text-white">
    <div class="pb-5">
        <span class="text-3xl">Bubble Network</span>
    </div>

    <OAuthButton/>
    
    {#if $isAuthed}
    <div class="w-full bg-slate-800 rounded-lg p-3">
        <button>Start Scan</button>
        <button>Clear Data</button>
    </div>
    {/if}
    
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply p-3 bg-slate-900 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-600;
    }
</style>