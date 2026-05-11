<style>
    /* ---- Page layout ---- */
    .fi-page-content > .fi-page-content-ctn {
        max-width: 720px !important;
    }

    /* ---- Form card wrapper ---- */
    .fi-fo-component-ctn,
    .fi-form {
        background: transparent !important;
    }

    .fi-fo-field-wrp {
        margin-bottom: 6px !important;
    }

    /* ---- Labels ---- */
    .fi-fo-field-wrp-label label {
        color: #64748b !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        letter-spacing: 0.2px !important;
        text-transform: none !important;
        margin-bottom: 5px !important;
    }

    /* ---- Inputs ---- */
    .fi-input,
    .fi-fo-textarea textarea {
        background: #111118 !important;
        border: 1px solid #1e1e2e !important;
        border-radius: 10px !important;
        color: #cbd5e1 !important;
        font-size: 14px !important;
        transition: border-color 0.15s !important;
        box-shadow: none !important;
    }

    .fi-input:focus,
    .fi-fo-textarea textarea:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important;
        outline: none !important;
    }

    .fi-input::placeholder,
    .fi-fo-textarea textarea::placeholder {
        color: #2d2d3d !important;
    }

    /* ---- Select ---- */
    .fi-select-input {
        background: #111118 !important;
        border: 1px solid #1e1e2e !important;
        border-radius: 10px !important;
        color: #cbd5e1 !important;
        font-size: 14px !important;
    }

    .fi-select-input:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important;
    }

    /* ---- ToggleButtons (type selector) ---- */
    .fi-fo-toggle-btns-wrp {
        gap: 10px !important;
    }

    .fi-fo-toggle-btns-wrp .fi-btn {
        border-radius: 10px !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        padding: 9px 20px !important;
        border: 1px solid #1e1e2e !important;
        background: #111118 !important;
        color: #64748b !important;
        transition: all 0.15s !important;
        box-shadow: none !important;
    }

    .fi-fo-toggle-btns-wrp .fi-btn:hover {
        border-color: #6366f1 !important;
        color: #a5b4fc !important;
    }

    .fi-fo-toggle-btns-wrp .fi-btn[aria-pressed="true"],
    .fi-fo-toggle-btns-wrp .fi-btn.fi-active {
        background: rgba(99,102,241,0.12) !important;
        border-color: #6366f1 !important;
        color: #a5b4fc !important;
    }

    /* ---- File upload ---- */
    .fi-fo-file-upload {
        background: #111118 !important;
        border: 1px dashed #1e1e2e !important;
        border-radius: 10px !important;
        transition: border-color 0.15s !important;
    }

    .fi-fo-file-upload:hover {
        border-color: #6366f1 !important;
    }

    /* ---- Toggle ---- */
    .fi-fo-toggle .fi-toggle {
        background: #1e1e2e !important;
    }

    /* ---- Error ---- */
    .fi-fo-field-wrp-error-message {
        color: #f87171 !important;
        font-size: 12px !important;
    }

    /* ---- Actions ---- */
    .wf-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #1e1e2e;
    }

    .wf-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 22px;
        background: #6366f1;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.15s, transform 0.12s;
        min-width: 120px;
        justify-content: center;
    }

    .wf-btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .wf-btn-primary:active:not(:disabled) { transform: scale(0.98); }
    .wf-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .wf-btn-inner {
        display: inline-flex;
        align-items: center;
        gap: 7px;
    }

    .wf-btn-icon {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
    }

    .wf-btn-loader {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .wf-btn-ghost {
        padding: 10px 18px;
        color: #475569;
        font-size: 14px;
        font-weight: 500;
        border-radius: 10px;
        text-decoration: none;
        transition: color 0.15s, background 0.15s;
    }

    .wf-btn-ghost:hover {
        color: #94a3b8;
        background: rgba(255,255,255,0.04);
    }

    .wf-spin {
        width: 16px;
        height: 16px;
        animation: wf-spin 0.7s linear infinite;
    }

    @keyframes wf-spin { to { transform: rotate(360deg); } }

    .wf-relations { margin-top: 32px; }
</style>
