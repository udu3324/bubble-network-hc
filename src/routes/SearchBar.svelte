<script>
    let value = ""
    function search() {
        if (value.length === 0) {
            return
        }

        console.log("searching", value)
    }
    function enter() {
        console.log("enter")
    }
</script>

<form on:submit|preventDefault={() => enter} class="flex h-10 text-xl bg-purple-600 rounded-lg text-purple-200">
    <button on:click={enter} title="search for a bubble based on the username"><i class="fa-solid fa-magnifying-glass"></i></button>
    <input bind:value on:input={search} title="search for a bubble based on the username" type="text" placeholder="search">
    
</form>

<style lang="postcss">
    @reference "tailwindcss";

    input {
        @apply h-full w-32 focus:outline-none;
    }
    button {
        @apply h-10 w-10 hover:brightness-90 cursor-pointer;
    }
</style>
