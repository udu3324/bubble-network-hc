<script>
	import '../app.css';
	import favicon from '$lib/assets/bubble-network-hc icon 256.png';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
