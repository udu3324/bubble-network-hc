<script>
    import CachePanel from "./CachePanel.svelte"

    
    import OAuthButton from "./OAuthButton.svelte"
    import ScanPanel from "./ScanPanel.svelte"
    
    
</script>

<div class="bg-slate-700 mr-3 p-3 w-72 rounded-lg text-white overflow-y-auto">
    <div class="">
        <span class="text-3xl font-bold">Bubble Network</span>
    </div>

    <div class="pb-3 font-extralight italic">
        <a href="/info">info</a> - 
        <a href="/leaderboard">leaderboard</a> - 
        <a href="https://github.com/udu3324/bubble-network-hc" target="_blank">src</a>
    </div>

    <OAuthButton/>
    
    <div class="bg-slate-300 text-slate-800 p-3 rounded-lg mt-2">
        <h1 class="font-bold" title="hover over the other ones lol">instructions (hover)</h1>
        <ul>
            <li title="oauth into slack, secrets are stored locally">1, login </li>
            <li title="this will look through all the public channels you are in">2, press start scan</li>
            <li title="gets people's display names and profile pictures">3, press cache network</li>
            <li title="the panel on the right should be ready">4, done! look at the visualizer</li>
        </ul>
    </div>
    
    <ScanPanel/>
    <CachePanel/>
    
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    a {
        @apply hover:underline;
    }
</style>