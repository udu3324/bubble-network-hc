<div class="bg-slate-900 mt-3 h-10 rounded-lg flex space-x-2">
    <button class="bg-green-600"><i class="fa-solid fa-floppy-disk"></i></button>
    <button class="bg-blue-600" id="resetBtn"><i class="fa-solid fa-arrows-rotate"></i></button>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply text-white text-2xl rounded-lg h-full px-3 cursor-pointer;
        @apply w-10 h-10 place-content-center text-center grid;
    }
</style>