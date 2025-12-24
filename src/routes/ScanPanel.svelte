<script>

    import { hasData, isAuthed } from "$lib";
    import { onMount } from "svelte";

    let status = ""
    let output = "..."

    let currentlyWaiting = false
    let disableClearingData = true

    hasData.subscribe((value) => {
        if (!value) {
            disableClearingData = true
        }
    })

    let fun_messages = [
        "the wait time for a scan to finish depends on how many channels you're in",
        "i made this website during finals week",
        "svelte all day any day",
        "#bubble on slack for the official channel",
        "how do i make a privacy policy",
        "so, hows your day"
    ]
    let fun_msg_index = 0

    let interval
    let elapsed = 0.1

    $: {
        //every 4 seconds
        if (Number.isInteger(elapsed / 4)) {
            output = fun_messages[fun_msg_index]

            fun_msg_index++

            if (fun_msg_index >= fun_messages.length) {
                fun_msg_index = 0
            }
        }
    }

    async function send() {

        if (currentlyWaiting) {
            return
        }

        status = "waiting"
        currentlyWaiting = true
        disableClearingData = true

        elapsed = 0
        interval = setInterval(() => {
			elapsed += 1
		}, 1000)

        const res = await fetch('/api/slack/scan/public', {
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
            output = "error: " + JSON.stringify(data)

            currentlyWaiting = false
            disableClearingData = !hasData

            return
        }

        currentlyWaiting = false
        disableClearingData = false
        hasData.set(true)

        const data = await res.json() //todo do something with this

        status = "done"
        output = `found ${data.ids.length} connections`

    }

    async function clear() {
        const res = await fetch('/api/supabase/clear', {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem("token").replaceAll("\"", "")}`,
                "slack_id": localStorage.getItem("user_id").replaceAll("\"", "")
            }
        })

        if (!res.ok) {

            status = "failed"

            const data = await res.json()
            output = "error: " + JSON.stringify(data)

            currentlyWaiting = false
            disableClearingData = !hasData

            return
        }

        status = "done"
        const data = await res.json()
        output = `details: ${data.details}`

        hasData.set(false)
        disableClearingData = true
    }

    onMount(async () => {
        if (!localStorage.getItem("user_id")) {
            return
        }
        
        try {
            //check if their id is stored in the network
            const res = await fetch(`/api/supabase/network?id=${localStorage.getItem("user_id").replaceAll("\"", "")}`)

            if (res.ok) {
                hasData.set(true)
                disableClearingData = false
                console.log("user has stored stuff in the network")
            }
        } catch (err) {
            console.log("got error" + err)
        }
    })
</script>

<div>
    {#if $isAuthed}
    <div class="w-full bg-slate-800 rounded-lg p-3 mt-8">
        <div>
            <button on:click={send} disabled={currentlyWaiting}><i class="fa-solid fa-magnifying-glass text-xs"></i> Start Scan</button>
            <button on:click={clear} disabled={disableClearingData}><i class="fa-solid fa-trash-can text-xs"></i> Clear Data</button>
        </div>

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