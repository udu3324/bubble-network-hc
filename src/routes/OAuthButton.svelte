<script>

    import { onMount } from 'svelte';

    import { PUBLIC_BASE_URL } from '$env/static/public'
   

    let statusText = ""

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

    onMount(() => {
		console.log('the component has mounted');
        //todo auth check, hide ouath button when needed
	});

</script>

<div class="py-3">
    <button onclick={authenticate}>slack oauth</button>
    <br>
    <span>Status: {statusText}</span>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply p-3 bg-slate-800 w-full rounded-lg cursor-pointer hover:bg-slate-900;
    }
</style>