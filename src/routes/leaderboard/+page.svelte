<script>
    import { goto } from "$app/navigation"
    import { foobar1, foobar3 } from "$lib/supabaseClient";
    import { masterArray, masterData } from "$lib/visualizer";
    import { onMount } from "svelte"

    let leaderboard = []
    let data = []

    let totalConnectionsMade = 0

    let highlited = -1

    onMount(() => {
        totalConnectionsMade = 0

        getData()
    })

    async function getData() {
        if (masterArray.length > 0) {
            //be lazy and use previous data if there is
            leaderboard = masterArray
            data = masterData
        } else {
            leaderboard = await foobar1()
            data = await foobar3()
        }

        if (localStorage.getItem("user_id") !== null) {
            highlited = leaderboard.findIndex(o => o.slack_id === localStorage.getItem("user_id").replaceAll("\"", ""))
        }
        
        leaderboard.forEach(node => {
            totalConnectionsMade += node.id_list.length
        })
        
        //console.log(leaderboard)
    }

    function leave() {
        goto("/")
    }

    function getProfilePicture(slackID) {
        //console.log(slackID, data.find(u => u.slack_id === slackID))
        let url = data.find(u => u.slack_id === slackID).profile_picture

        if (url.includes("gravatar.com/avatar")) {
            return url //cant change res of default slack pfps
        }

        return url.replace("_192", "_32").replace("-192", "_32")
    }

    function getBackgroundColor(index) {
        if (index === highlited) {
            return "itsyou"
        }

        switch (index) {
            case 0: 
                return "bg-yellow-500 text-yellow-800 font-bold"
            case 1: 
                return "bg-gray-300 text-gray-700 font-bold"
            case 2: 
                return "bg-orange-400 text-orange-800 font-bold"
            default:
                break
        }
    }
</script>

<div class="bg-slate-950 w-screen h-screen justify-center-safe p-3 flex">
    
    <div class="flex flex-col bg-slate-700 w-2xl mt-6 text-slate-200 rounded-lg p-3">
        <div class="text-white relative -top-10 font-bold text-5xl flex">
            <button onclick={leave} title="go back" class="pop mr-3"><i class="fa-solid fa-door-open"></i></button>
            <div class="pop bg-linear-to-r from-blue-600 to-indigo-400"><i class="fa-solid fa-ranking-star"></i> leaderboard</div>
        </div>

        <div class="-mt-6 mb-2">
            There are <b>{leaderboard.length}</b> people on the leaderboard with <b>{totalConnectionsMade}</b> total connections made between everyone on slack.
        </div>

        <div class="overflow-y-scroll flex-1">
            <table class="bg-slate-600 w-full">
                <thead class="sticky top-0">
                    <tr class="h-9 bg-slate-900">
                        <td class="w-10 text-center" title="number of connections">
                            <i class="fa-solid fa-circle-nodes"></i>
                        </td>
                        <td class="w-8 text-center" title="profile picture">
                            <i class="fa-regular fa-image"></i>
                        </td>
                        <td title="why are you hovering over this bruh. its self explanatory">
                            <div class="pl-1">
                                username
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {#if data.length > 0}
                    {#each leaderboard as node, i}
                    <tr onclick={() => goto(`/?id=${node.slack_id}`)} class="{getBackgroundColor(i)} hoverrow">
                        <td>
                            <div class="px-1">
                                {node.id_list.length}
                            </div>
                        </td>
                        <td>
                            <img loading="lazy" src={getProfilePicture(node.slack_id)}>
                        </td>
                        <td>
                            <div class="pl-1 pr-2">
                                {#if i < 3}
                                <i class="fa-solid fa-medal"></i>
                                {/if}
                                {data.find(o => o.slack_id === node.slack_id).username.substring(0, 20)}
                            </div>
                        </td>
                    </tr>
                    {/each}
                    {/if}
                </tbody>
            </table>
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

    td {
        @apply border-b border-slate-800 px-2;
        padding-inline: 0px;
    }

    img {
        @apply w-8 h-8;
    }

    .hoverrow:hover {
        @apply cursor-pointer underline backdrop-brightness-60;
    }

    .itsyou {
        @apply bg-linear-to-r from-blue-600 to-indigo-400;
    }
</style>