<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github_light.svg';
    import Logo from './Logo.svelte';
</script>

<header>
	<Logo />

	<div class="corner">
		<a href="https://github.com/recoskyler/chatter">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
    .logo {
        margin: 1ch 1.5ch;
        font-size: 2rem;
        font-weight: 600;
    }

	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
