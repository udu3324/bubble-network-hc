<script>
    import CachePanel from "./CachePanel.svelte";

    
    import OAuthButton from "./OAuthButton.svelte";
    import ScanPanel from "./ScanPanel.svelte";
    
    
</script>

<div class="bg-slate-700 mr-3 p-3 w-72 rounded-lg text-white">
    <div class="pb-5">
        <span class="text-3xl">Bubble Network</span>
    </div>

    <OAuthButton/>
    
    <ScanPanel/>
    <CachePanel/>
    
</div>