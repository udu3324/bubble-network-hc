<script>

    import { hasData, isAuthed } from "$lib";

    import { onDestroy, onMount } from 'svelte';

    import { PUBLIC_BASE_URL, PUBLIC_SLACK_APP_CLIENT_ID } from '$env/static/public'
   

    let statusText = ""
    let buttonDisabled = true

    let intervalCheck

    const redirect = encodeURIComponent(`${PUBLIC_BASE_URL}/api/slack/callback`)

    const userScopes = [
      "channels:history",
      "channels:read",
      "groups:read",
      "im:read",
      "mpim:read",
      "users.profile:read",
      "users:read"
    ].join(",");

    const slackAuthURL = 
        `https://slack.com/oauth/v2/authorize` +
        `?client_id=${PUBLIC_SLACK_APP_CLIENT_ID}` +
        `&scope=` +
        `&user_scope=${userScopes}` +
        `&redirect_uri=${redirect}`
    
    function authenticate() {
        window.open(slackAuthURL, "_blank")
    }

    function logout() {
        statusText = "Logged out"

        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
    }

    async function check() {
        const id = localStorage.getItem("user_id")

        if (id) {
            buttonDisabled = true
            isAuthed.set(true)

            statusText = "Authenticated"

            try {
                if (hasData) return

                //check if their id is stored in the network
                const res = await fetch(`/api/supabase/network?id=${id}`)

                if (res.ok) {
                    hasData.set(true)
                    disableClearingData = false
                    console.log("user has stored stuff in the network")
                }
            } catch (err) {
                console.log("got error" + err)
            }
        } else {
            buttonDisabled = false
            isAuthed.set(false)

            statusText = "Not authenticated"
        }
    }

    onMount(() => {
        check()

        intervalCheck = setInterval(check, 1000)
	});

    onDestroy(() => {
        clearInterval(intervalCheck)
	});

</script>

<div class="py-3">
    <button onclick={authenticate} disabled={buttonDisabled} class="mb-2"><i class="fa-brands fa-slack"></i> Slack OAuth</button>
    <button onclick={logout} hidden={!buttonDisabled}><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
    
    <div class="pt-1">
        <span class="font-mono text-slate-300 font-bold">Status: {statusText}</span>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply p-3 bg-slate-800 text-slate-300 w-full rounded-lg cursor-pointer hover:bg-slate-900;
    }
    button:disabled {
        @apply bg-slate-900 text-slate-800 cursor-auto; 
    }
</style>