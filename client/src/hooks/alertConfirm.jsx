import toast from "react-hot-toast";
import { ConfirmAlert } from "../components/common/Alert/ConfirmAlert";

export function alertConfirm(title, message) {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <ConfirmAlert
          title={title}
          message={message}
          onConfirm={() => {
            resolve(true);
            toast.remove(t.id);
          }}
          onCancel={() => {
            resolve(false);
            toast.remove(t.id);
          }}
        />
      ),
      {
        duration: Infinity,
      }
    );
  });
}
