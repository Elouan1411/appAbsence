import toast from "react-hot-toast";
import { ConfirmAlert } from "../components/common/Alert/ConfirmAlert";

export function alertConfirm(message) {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <ConfirmAlert
          message={message}
          onConfirm={() => {
            resolve(true);
            toast.dismiss(t.id);
          }}
          onCancel={() => {
            resolve(false);
            toast.dismiss(t.id);
          }}
        />
      ),
      {
        duration: Infinity,
      }
    );
  });
}
