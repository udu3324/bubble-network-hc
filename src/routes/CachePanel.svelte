<script>
    import { hasData, isAuthed } from "$lib"
    import { gen, setKing, slackIds } from "$lib/visualizer"

    let output = "..."
    let disableCaching = true
    let currentlyWaiting = false

    let status = ""
    let interval
    let elapsed = 0

    hasData.subscribe((value) => {
        disableCaching = !value
    })

    async function cache() {
        if (currentlyWaiting) {
            return
        }

        status = "waiting"
        output = "..."
        currentlyWaiting = true
        disableCaching = true

        elapsed = 0
        interval = setInterval(() => {
			elapsed += 1
		}, 1000)

        const res = await fetch('/api/supabase/ncache', {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token").replaceAll("\"", "")}`,
                "slack_id": localStorage.getItem("user_id").replaceAll("\"", "")
            }
        })

        clearInterval(interval)

        if (!res.ok) {

            status = "failed"

            const data = await res.json()
            output = JSON.stringify(data)

            currentlyWaiting = false
            disableCaching = false

            return
        }

        currentlyWaiting = false
        disableCaching = false

        status = "done"
        output = `all your connections have been cached. press share to generate an image!`

        await gen()
        setKing(slackIds.indexOf(localStorage.getItem("user_id").replaceAll("\"", "")))
    }
</script>
<div>
    {#if $isAuthed}
    <div class="w-full bg-slate-800 rounded-lg p-3 mt-8">
        <button disabled={disableCaching} onclick={cache}><i class="fa-solid fa-cubes"></i> Cache Network</button>
        
        {#if status === "waiting"}
        <div class="bg-sky-900 rounded-lg p-2 mt-2 flex">
            <i class="fa-solid fa-spinner animate-spin text-2xl mr-1"></i>
            <span>({elapsed}s) please wait</span>
        </div>
        {:else if status === "done"}
        <div class="bg-green-700 rounded-lg p-2 mt-2 flex">
            <i class="fa-solid fa-check text-2xl mr-1"></i>
            <span>sucessful</span>
        </div>
        {:else if status === "failed"}
        <div class="bg-red-700 rounded-lg p-2 mt-2 flex">
            <i class="fa-solid fa-triangle-exclamation text-2xl mr-1"></i>
            <span>failed</span>
        </div>
        {/if}

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