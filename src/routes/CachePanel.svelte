<div>
    test
</div>

<style lang="postcss">
    @reference "tailwindcss";
    
    button {
        @apply p-3 bg-slate-900 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-600;
    }

    button:disabled {
        @apply bg-slate-900 text-slate-800 cursor-auto; 
    }
</style>