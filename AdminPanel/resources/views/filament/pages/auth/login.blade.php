<x-filament-panels::page.simple>
    <div class="lp-wrap">
        <div class="lp-brand">
            <span class="lp-dot"></span>
            <span class="lp-brand-name">Admin Panel</span>
        </div>

        <div class="lp-heading">
            <h1>Kirish</h1>
            <p>Davom etish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <x-filament-panels::form id="form" wire:submit="authenticate">
            {{ $this->form }}

            <button type="submit" class="lp-submit" wire:loading.attr="disabled">
                <span wire:loading.remove wire:target="authenticate">Kirish</span>
                <span wire:loading wire:target="authenticate">
                    <svg class="lp-spin" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </span>
            </button>
        </x-filament-panels::form>
    </div>

    <style>
        *, *::before, *::after { box-sizing: border-box; }

        .fi-simple-header { display: none !important; }

        .fi-body,
        .fi-simple-main-ctr {
            background: #0c0c10 !important;
            min-height: 100vh !important;
        }

        .fi-simple-main-ctr {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .fi-simple-page {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            min-height: 100vh !important;
        }

        .fi-simple-page > section {
            width: 100% !important;
            max-width: 360px !important;
            gap: 0 !important;
            padding: 24px !important;
        }

        /* Wrapper */
        .lp-wrap {
            width: 100%;
        }

        /* Brand */
        .lp-brand {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 40px;
        }

        .lp-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #6366f1;
            box-shadow: 0 0 8px rgba(99,102,241,0.7);
        }

        .lp-brand-name {
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }

        /* Heading */
        .lp-heading {
            margin-bottom: 28px;
        }

        .lp-heading h1 {
            font-size: 26px;
            font-weight: 700;
            color: #f1f5f9;
            margin: 0 0 6px;
            letter-spacing: -0.5px;
        }

        .lp-heading p {
            font-size: 13.5px;
            color: #475569;
            margin: 0;
        }

        /* Fields */
        .fi-fo-field-wrp {
            margin-bottom: 14px !important;
        }

        .fi-fo-field-wrp-label label,
        .fi-fo-field-wrp > label {
            color: #475569 !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            letter-spacing: 0.2px !important;
            text-transform: none !important;
            margin-bottom: 6px !important;
        }

        .fi-input-wrp {
            background: transparent !important;
            border-radius: 8px !important;
        }

        .fi-input {
            background: #13131a !important;
            border: 1px solid #1e1e2e !important;
            border-radius: 8px !important;
            color: #cbd5e1 !important;
            font-size: 14px !important;
            padding: 10px 13px !important;
            transition: border-color 0.15s !important;
            box-shadow: none !important;
        }

        .fi-input:focus {
            border-color: #6366f1 !important;
            box-shadow: none !important;
            outline: none !important;
        }

        .fi-input::placeholder { color: #2d2d3d !important; }

        .fi-icon-btn {
            color: #334155 !important;
            background: transparent !important;
        }
        .fi-icon-btn:hover { color: #64748b !important; }

        /* Checkbox + remember */
        .fi-fo-checkbox { margin-bottom: 4px !important; }
        .fi-checkbox-input { accent-color: #6366f1 !important; }
        .fi-fo-checkbox label { color: #475569 !important; font-size: 13px !important; }

        /* Forgot link */
        .fi-link { color: #6366f1 !important; font-size: 13px !important; text-decoration: none !important; }
        .fi-link:hover { color: #818cf8 !important; }

        /* Button */
        .lp-submit {
            width: 100%;
            margin-top: 20px;
            padding: 11px 20px;
            background: #6366f1;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.15s, transform 0.12s;
            letter-spacing: 0.1px;
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .lp-submit:hover:not(:disabled) { background: #4f46e5; }
        .lp-submit:active:not(:disabled) { transform: scale(0.99); }
        .lp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .lp-spin {
            width: 18px;
            height: 18px;
            animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Errors */
        .fi-fo-field-wrp-error-message {
            color: #f87171 !important;
            font-size: 12px !important;
            margin-top: 4px !important;
        }

        .fi-alert {
            background: rgba(239,68,68,0.08) !important;
            border: 1px solid rgba(239,68,68,0.2) !important;
            border-radius: 8px !important;
            color: #fca5a5 !important;
            font-size: 13px !important;
            margin-bottom: 16px !important;
        }
    </style>
</x-filament-panels::page.simple>
