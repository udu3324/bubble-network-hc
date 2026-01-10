<script>
	import '../app.css'
	import favicon from '$lib/assets/bubble-network-hc icon 256.png'
	import '@fortawesome/fontawesome-free/css/all.min.css'
	
	let { children } = $props()
</script>

<svelte:head>
	<title>bubble net</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
