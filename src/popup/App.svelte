<script lang='ts'>
  import CrxLogo from '@/assets/crx.svg'
  import svelteLogo from '@/assets/svelte.svg'
  import viteLogo from '@/assets/vite.svg'
  import HelloWorld from '@/components/HelloWorld.svelte'
</script>

<div class=" flex justify-center">
  <a href='https://vite.dev' target='_blank'>
    <img
      src={viteLogo}
      class='h-24 p-6 transition duration-300 will-change-auto hover:drop-shadow-[0_0_2em_#646cffaa]'
      alt='Vite logo'
    >
  </a>
  <a href='https://svelte.dev' target='_blank'>
    <img
      src={svelteLogo}
      class='h-24 p-6 transition duration-300 will-change-auto hover:drop-shadow-[0_0_2em_#ff3e00aa]'
      alt='Svelte logo'
    >
  </a>
  <a href='https://crxjs.dev/vite-plugin' target='_blank'>
    <img
      src={CrxLogo}
      class='h-24 p-6 transition duration-300 will-change-auto hover:drop-shadow-[0_0_2em_#f2bae4aa]'
      alt='crx logo'
    >
  </a>
</div>
<HelloWorld msg='Vite + Svelte + CRXJS' />
