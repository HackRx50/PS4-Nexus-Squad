import React, { useEffect } from "react";
import { useAppSelector } from "../hooks";
import { useLocation } from "react-router-dom";

export default function AppTitle({ children }: { children: React.ReactNode }) {
    const title = useAppSelector(state => state.appTitleSlice.title);
    const location = useLocation();

    useEffect(() => {
        // const pathname = location.pathname;
        // if (pathname === "/") {
        //     console.log(location);

        // }
        document.title = title;
    }, [title]);

    return <>{children}</>
}