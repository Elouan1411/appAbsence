//TODO: enlever la notation Tailwind

export function ConfirmAlert({ message, onConfirm, onCancel }) {
    return (
        <div className="bg-white rounded shadow p-4 flex items-center justify-between gap-4">
            <span>{message}</span>

            <div className="flex gap-2">
                <button onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">
                    Annuler
                </button>

                <button onClick={onConfirm} className="px-3 py-1 bg-red-500 text-white rounded">
                    Confirmer
                </button>
            </div>
        </div>
    );
}
