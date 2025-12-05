import { useEffect, useState } from 'react';

export type Loader = (args?: any) => Promise<any>

/**
 *
 * @param loader Function that loads data
 * @param loaded Boolean that will be true when data has loaded
 * @returns Boolean that is true while waiting for the loader and false when loading is complete
 */
const useLoader = (loader: Loader, loaded: boolean,) => {
    const [loading, setLoading] = useState(!loaded);

    useEffect(() => {
        if (loading) {
            loader().catch(console.error);
        }
    }, [loading, loader]);

    useEffect(() => {
        if (loaded){
            setLoading(false);
        }
    }, [loaded]);

    return loading;
};

export default useLoader;
