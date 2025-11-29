import { Outlet } from "react-router-dom";
import Skeleton from "./Skeleton";
import useAuth from "../hooks/useAuth";

const Layout = () => {
  const { auth } = useAuth();
  let navs = [];
  if (auth?.role === "admin") {
    navs = [
      { text: "Menu", url: "/admin/index" },
      { text: "Importer", url: "/admin/addStudents" },
      { text: "Élèves", url: "/admin/studentsList" },
    ];
  } else if (auth?.role === "teacher") {
    navs = [
      { text: "Élèves", url: "/teacher/studentsList" },
      { text: "Ajouter un appel", url: "/teacher/index" },
      { text: "Liste d'appel", url: "/teacher/appelList" },
    ];
  } else if (auth?.role === "student") {
    navs = [
      { text: "Index Eleve", url: "/eleve/index" },
      { text: "Justifier", url: "/eleve/justifier" },
    ];
  } else {
    navs = [{ text: "Connexion", url: "/login" }];
  }

  return (
    <Skeleton nav={navs}>
      <Outlet />
    </Skeleton>
  );
};

export default Layout;
