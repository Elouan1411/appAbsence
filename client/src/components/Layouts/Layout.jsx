import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import VerticalBar from "../common/VerticalBar/VerticalBar";
import "../../style/Layout.css";
import { AnimatePresence, motion } from "framer-motion";

const Layout = () => {
    const location = useLocation();

    return (
        <div className="layout">
            <VerticalBar />

            <main>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
