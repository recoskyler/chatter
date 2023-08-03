<script>
  import { page } from "$app/stores";
</script>

<div class="container my-auto mx-auto">
  <h1 class="h1 text-center text-red-400">{$page?.status ?? "500"} | {$page?.error?.message ?? "An error occurred"}</h1>
</div>
