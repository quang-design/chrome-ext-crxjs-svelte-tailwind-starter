<script lang='ts'>
  const { msg } = $props()
  let count = $state(0)
</script>

<h1 class='text-2xl font-bold'>{msg}</h1>

<div class='p-8'>
  <button type='button' onclick={() => count++}>
    count is {count}
  </button>
  <p class="mt-2">
    Edit
    <code>src/components/HelloWorld.svelte</code> to test HMR
  </p>
</div>

<p>
  Check out
  <a href='https://github.com/crxjs/create-crxjs' target='_blank'>create-crxjs</a>, the official starter
</p>

<p class=' text-gray-400'>
  Click on the Vite, Svelte and CRXJS logos to learn more
</p>

