<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<div>
	<h1>Create an account</h1>

	<form method="POST" use:enhance>
    <label for="name">Name</label><br />
		<input id="name" name="name" min="2" max="255" /><br />

    <label for="email">Email</label><br />
		<input type="email" id="email" name="email" min="5" max="255" /><br />

		<label for="password">Password</label><br />
		<input type="password" id="password" name="password" min="8" max="64" /><br />

		<input type="submit" value="Signup" />
	</form>
</div>
