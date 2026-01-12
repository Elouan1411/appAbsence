import toast from "react-hot-toast";
import { ConfirmAlert } from "../components/common/Alert/ConfirmAlert";

const TOAST_ID = "unique-confirm-alert";
export function alertConfirm(title, message, toInput = false) {
    return new Promise((resolve) => {
        toast.custom(
            (t) => (
                <ConfirmAlert
                    title={title}
                    message={message}
                    toInput={toInput}
                    onConfirm={(motifSaisi, type) => {
                        toast.remove(t.id);
                        resolve({ isConfirmed: true, motif: motifSaisi, type: type });
                    }}
                    onCancel={() => {
                        toast.remove(t.id);
                        resolve({ isConfirmed: false, motif: null });
                    }}
                />
            ),
            {
                id: TOAST_ID,
                duration: Infinity,
            }
        );
    });
}
