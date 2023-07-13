<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<div>
	<h1>Sign in</h1>

	<form method="POST" use:enhance>
		<label for="email">Email</label><br />
		<input id="email" name="email" type="email" /><br />

		<label for="password">Password</label><br />
		<input type="password" id="password" name="password" /><br />

		<input type="submit" value="Continue" />
	</form>
</div>
