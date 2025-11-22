<script>
    const clientID = "2210535565.9770937874130" //todo move to .env
    const redirect = encodeURIComponent("https://bubble-network-hc.vercel.app/api/auth/slack/callback")

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
    
</script>

<div class="bg-slate-700 mr-3 p-3 w-72 rounded-lg text-white">
    slack oauth login here + control panel stuff

    <br><br>
    <a href={slackAuthURL} target="_blank">
        <button>slack oauth</button>
    </a>
    
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply p-3 bg-slate-800 rounded-lg cursor-pointer;
    }
</style>