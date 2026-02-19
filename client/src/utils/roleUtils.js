export const getHomeRoute = (role) => {
    switch (role) {
        case "admin":
            return "/admin";
        case "teacher":
            return "/enseignant";
        case "student":
            return "/etudiant";
        case "init":
            return "/init";
        default:
            return "/";
    }
};
