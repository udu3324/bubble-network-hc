<script>

    import { onDestroy, onMount } from 'svelte';

    import { PUBLIC_BASE_URL } from '$env/static/public'
   

    let statusText = ""
    let buttonDisabled = true

    let intervalCheck

    const clientID = "2210535565.9770937874130" //todo move to .env
    const redirect = encodeURIComponent(`${PUBLIC_BASE_URL}/api/auth/slack/callback`)

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
        `?client_id=${clientID}` +
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

    function check() {
        const id = localStorage.getItem("user_id")

        if (id) {
            buttonDisabled = true
            statusText = "Authenticated"
        } else {
            buttonDisabled = false
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