<script>
    import { goto } from "$app/navigation";

    function leave() {
        goto("/")
    }
</script>

<div class="bg-slate-950 w-screen h-screen justify-center-safe p-3 flex">
    
    <div class="bg-slate-700 w-2xl mt-52 text-slate-200 rounded-lg p-3">
        <div class="text-white relative -top-10 font-bold text-5xl flex">
            <button onclick={leave} title="go back" class="pop mr-3"><i class="fa-solid fa-door-open"></i></button>
            <div class="pop">bubble network</div>
        </div>
        
        <div>
            <h1>Info</h1>
            <span>What is bubble network? It is a website that lets you see how connected you are in the slack. By only looking at publicly accessible channels you are part of, patterns of interactions appear and can be visualized based on shared conversations.</span>

            <h1>Privacy Policy</h1>
            <span>Only whats needed is stored. Things like your slack id, slack display name (fallbacks to real name if needed), and profile picture are stored. Your slack token and slack id are stored locally. Sensitive data is not stored in any servers/logs.</span>
            
            <br>
            <br>
            
            <span><b>tldr;</b> the information we access and need can be found without a oauth key. (anyone can request it as its public information)</span>
            
            <h1>Source Code</h1>
            <span>Made with svelte, tailwind, and fontawesome. Vercel and supabase are also used.</span>
            
            <br><br>

            <a href="https://github.com/udu3324/bubble-network-hc" target="_blank" rel="noopener noreferrer" class="text-blue-300 underline">code repository</a>
        </div>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    h1 {
        @apply text-2xl font-bold pt-5 pb-2;
    }

    .pop {
        @apply bg-slate-800 p-3;
    }
    button {
        @apply hover:bg-slate-900 cursor-pointer;
    }
</style>