<div class="bg-slate-950 w-screen h-screen justify-center-safe p-3 flex">
    
    
    <div class="bg-slate-700 w-240 mt-52 text-slate-200 rounded-lg p-3">
        <div class="text-white relative -top-10 font-bold text-5xl">bubble network</div>
        
        <div>
            <h1>Info</h1>
            <span>What is bubble network? It is a website that allows you to visualize how connected you are in the slack. By scanning all the public channels you are in, messages with interactions can be checked and visualized to see who you talk to.</span>

            <h1>Privacy Policy</h1>
            <span>Only whats needed is stored. Things like your slack id, slack display name (fallbacks to real name if needed), and profile picture are stored. Your slack token and slack id are stored locally and are sent to api endpoints to be securely processed and are never stored on any servers/logs.</span>
            
            <h1>Source Code</h1>
            <span>Made with svelte, tailwind, and fontawesome. Vercel and supabase are also used.</span>
            <br><br>
            <a href="https://github.com/udu3324/bubble-network-hc" target="_blank" rel="noopener noreferrer" class="text-blue-300 underline">repository</a>
        </div>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    h1 {
        @apply text-2xl font-semibold pt-5 pb-2;
    }
</style>