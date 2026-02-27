import toast from "react-hot-toast"; // ou ton package de toast

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
        toast(message, options); // Toast par défaut si type inconnu
    }
};

export default notify;
