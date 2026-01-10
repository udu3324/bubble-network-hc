<script>
    import Bar from "./bar.svelte"
    import Panel from "./panel.svelte"
    import Viewer from "./viewer.svelte"

</script>

<div class="bg-slate-950 w-screen h-screen p-3 flex">
    <Panel/>
    <div class="flex flex-col grow">
        <Viewer/>
        <Bar/>
    </div>
</div>