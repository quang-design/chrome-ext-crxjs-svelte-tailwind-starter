<script>
  import Logo from '@/assets/crx.svg'

  let show = $state(false)
</script>

<div class='fixed right-0 bottom-0 m-5 z-[100] flex items-end font-sans select-none leading-none'>
  <div
    class='bg-white text-gray-800 rounded-lg shadow-md w-max h-min py-2 px-4 mr-2 transition-opacity duration-300'
    class:opacity-100={show}
    class:opacity-0={!show}
    style="display: {show ? 'block' : 'none'}"
  >
    <h1 class="text-2xl font-bold">HELLO CRXJS</h1>
  </div>
  <button
    class='flex justify-center w-10 h-10 rounded-full shadow-sm cursor-pointer border-none bg-[#288cd7] hover:bg-[#1e6aa3]'
    onclick={() => show = !show}
  >
    <img src={Logo} alt='CRXJS logo' class='p-1'>
  </button>
</div>
