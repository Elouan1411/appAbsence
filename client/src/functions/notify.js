import toast from "react-hot-toast"; // or your toast package

const notify = (message, type) => {
    const options = {
        duration: 3000,
        position: "top-right",
    };

    if (type === "success") {
        toast.success(message, options);
    } else if (type === "error") {
        toast.error(message, options);
    } else {
        toast(message, options); // Default toast if unknown type
    }
};

export default notify;
