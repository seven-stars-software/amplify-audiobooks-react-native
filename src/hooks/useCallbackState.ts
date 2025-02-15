//Pulled from https://medium.com/geekculture/usecallbackstate-the-hook-that-let-you-run-code-after-a-setstate-operation-finished-25f40db56661
import { useEffect, useRef, useState } from "react";

type CallBackType<T> = (updatedValue: T) => void;

type SetStateType<T> = T | ((prev: T) => T);

type RetType = <T>(
    initialValue: T | (() => T)
) => [T, (newValue: SetStateType<T>, callback?: CallBackType<T>) => void];

const useCallbackState: RetType = <T>(initialValue: T | (() => T)) => {
    const [state, _setState] = useState<T>(initialValue);
    const callbackQueue = useRef<CallBackType<T>[]>([]);

    useEffect(() => {
        callbackQueue.current.forEach((cb) => cb(state));
        callbackQueue.current = [];
    }, [state]);

    const setState = (newValue: SetStateType<T>, callback?: CallBackType<T>) => {
        _setState(newValue);
        if (callback && typeof callback === "function") {
            callbackQueue.current.push(callback);
        }
    };
    return [state, setState];
};

export default useCallbackState;