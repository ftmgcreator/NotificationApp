<x-filament-panels::page>
    <form wire:submit="save" autocomplete="off">
        {{ $this->form }}

        <div class="wf-actions">
            <button type="submit" class="wf-btn-primary" wire:loading.attr="disabled" wire:loading.class="wf-btn--loading">
                <span wire:loading.remove wire:target="save" class="wf-btn-inner">
                    <svg class="wf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Saqlash
                </span>
                <span wire:loading wire:target="save" class="wf-btn-loader">
                    <svg class="wf-spin" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                    Saqlanmoqda...
                </span>
            </button>

            <a href="{{ $this->getResource()::getUrl('index') }}" class="wf-btn-ghost" wire:navigate>
                Bekor qilish
            </a>
        </div>
    </form>

    <x-filament-actions::modals />

    @include('filament.resources.work-resource.pages._work-styles')
</x-filament-panels::page>
