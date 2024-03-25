import { createContext, ReactNode, useState } from "react";

type User = {
    wpUser?:{
        [key: string]: any
    }
}
type UserContextType = [
    User | null,
    React.Dispatch<React.SetStateAction<User | null>>
]

const UserContext = createContext<UserContextType>([
    null, ()=>null
]);

export const UserContextProvider = ({ children }: { children?: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    return (
        <UserContext.Provider value={[user, setUser]}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContext;

