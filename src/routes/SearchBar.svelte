<script>
    import { isGrabbing } from "$lib";
    import { masterData, nodes, setKing, slackIds } from "$lib/visualizer"

    let input
    let value = ""
    let hideResults = 'hidden'
    let results = []
    $: hideResults = (results.length === 0) ? 'hidden' : ''
    
    let pointerEvents = ''
    isGrabbing.subscribe(bool => {
        if (bool) {
            pointerEvents = 'pointer-events-none'
        } else {
            pointerEvents = ''
        }
    })

    function search() {
        results = []

        if (value.length === 0) {
            return
        }

        //console.log("searching", value)
        nodes.forEach(node => {
            if (node.displayName.toLowerCase().includes(value.toLowerCase())) {
                results.push(node)
            }
        })
    }

    function enter() {
        if (results[0]) {
            sendTo(results[0].user)
            input.blur()
            return
        }

        let idSearch = masterData.find(u => u.slack_id === value)

        if (idSearch) {
            if (slackIds.indexOf(idSearch.slack_id)) {
                sendTo(idSearch.slack_id)
                return
            }
        }

        alert("No results.")
    }

    function sendTo(id) {
        //console.log("going to", node)
        setKing(slackIds.indexOf(id))
        
        results = []
        value = ''
    }

    function getProfilePicture(slackID) {
        let url = masterData.find(u => u.slack_id === slackID).profile_picture

        if (url.includes("gravatar.com/avatar")) {
            return url //cant change res of default slack pfps
        }

        return url.replace("_192", "_24").replace("-192", "_24")
    }
</script>

<div class="relative">
    <div class="{hideResults} {pointerEvents} absolute z-10 bottom-full overflow-y-auto overflow-x-hidden max-h-64 left-0 bg-purple-600/50 mb-3 text-purple-100">
        <table>
            <thead>
            </thead>
            <tbody>
                {#each results as node, i}
                <tr on:click={() => sendTo(node.user)} class="cursor-pointer">
                    <td>
                        <img alt="profile picture" loading="lazy" src={getProfilePicture(node.user)}>
                    </td>
                    <td>
                        <div class="pl-1 pr-2">
                            {#if i === 0}
                            <b>{node.displayName}</b>
                            {:else}
                            {node.displayName}
                            {/if}
                        </div>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <form on:submit|preventDefault={() => enter()} class="flex h-10 text-xl bg-purple-600 rounded-lg text-purple-200">
        <button title="search for a bubble based on the username, or paste a slack id"><i class="fa-solid fa-magnifying-glass"></i></button>
        <input bind:this={input} bind:value on:input={search} title="search for a bubble based on the username, or paste a slack id" type="text" placeholder="search">
        
    </form>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    input {
        @apply h-full w-32 focus:outline-none;
    }
    button {
        @apply h-10 w-10 hover:brightness-90 cursor-pointer;
    }

    td {
        @apply border-b border-purple-900 px-2 hover:bg-purple-700/50;
        padding-inline: 0px;
    }

    img {
        @apply w-6 h-6 min-w-6 min-h-6;
    }
</style>
