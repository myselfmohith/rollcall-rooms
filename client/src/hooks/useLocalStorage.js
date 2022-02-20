import { useEffect, useState } from "react";


/**
 * if key is not found return null
 * 
 * @param {String} key Key of the Item to get from local storage
 * @returns {Array} state,setState
 */
export default function useLocalStorage(key) {
    const [loading, setLoading] = useState(true);
    const [storage, setStorage] = useState(() => {
        const lData = window.localStorage.getItem(key);
        if (!lData) return null;
        if (lData === "undefined") return null;
        const fData = JSON.parse(lData);
        setLoading(false);
        return fData;
    })

    useEffect(() => {
        setLoading(true);
        window.localStorage.setItem(key, JSON.stringify(storage));
        setLoading(false);
    }, [key, storage]);

    return [storage, setStorage, loading];
}