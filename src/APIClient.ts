import { API_URL } from '@env';
import { AuthSeal, Book } from 'types/types';

console.log(`:::::::::::::::::::::::::::::
process.env.API_URL = ${API_URL}
:::::::::::::::::::::::::::::`);

console.log(`:::::::::::::::::::::::::::::
process.env.NODE_ENV = ${process.env.NODE_ENV}
:::::::::::::::::::::::::::::`);

const fetchJson = async (...args: Parameters<typeof fetch>) => {
    let textResponse = '';
    let response = null;
    try {
        response = await fetch(...args);
    } catch (e) {
        console.log('Fetch failed');
        if (e instanceof Error) {
            throw new Error(`Original Error: ${e?.message}
            :::::::
            Request URL: ${args[0]}
            :::::::
            `);
        }
    }

    if (response instanceof Response) {
        textResponse = await response.text();
        if (response.status >= 400) {
            throw new Error(`HTTP Error. Status ${response.status}
            ::::::::::
            ${textResponse}
            ::::::::::
            Request URL: ${args[0]}
            Response URL: ${response?.url}
            `);
        }
    }

    try {
        const jsonResponse = JSON.parse(textResponse);
        return jsonResponse;
    } catch (e) {
        console.log('Failed to parse JSON response');
        throw new Error(`Expected JSON. Failed to parse.
        ::::::::::
        ${textResponse}
        ::::::::::
        Request URL: ${args[0]}
        Response URL: ${response?.url}
        HTTP Status: ${response?.status}
        `);
    }
};

type LoginParams = {
    username: string,
    password: string
}
type LoginReturn = Promise<
    {
        success: boolean,
        seal: AuthSeal,
        wpUser: {
            [key: string]: any
        }
    } | undefined
>
const login = async ({ username, password }: LoginParams): LoginReturn => {
    const postData = { username, password };
    const response = await fetchJson(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return response;
};

type RegisterParams = {
    username: string,
    email: string,
    password: string
}
const register = async ({username, email, password}: RegisterParams) => {
    const postData = { username, email, password };
    const response = await fetchJson(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return response;
};

type DeleteAccountParams = {
    userID: string
}
const deleteAccount = async ({userID}: DeleteAccountParams) => {
    const postData = { userID };
    const response = await fetchJson(`${API_URL}/auth/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return response;
};

type CheckSealParams = {
    username: string,
    seal: AuthSeal
}
const checkSeal = async ({ username, seal }: CheckSealParams) => {
    const postData = { username, seal };
    const response = await fetchJson(`${API_URL}/auth/check-seal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return response;
};

const getLibrary = async (seal: AuthSeal): Promise<Book[] | undefined> => {
    const response = await fetchJson(`${API_URL}/library`, {
        headers: {
            'X-IronSeal': seal,
        },
    });
    return response;
};

type HomeBooks = {
    library: Book[],
    featured: Book[],
    newReleases: Book[],
    onSale: Book[]
}

const getHomeBooks = async (seal: AuthSeal): Promise<HomeBooks | undefined> => {
    return await fetchJson(`${API_URL}/library/home`, {
        headers: {
            'X-IronSeal': seal,
        },
    });
};

type GetBookTracksParams = {
    isbn: string,
    seal: AuthSeal
}
const getBookTracks = async ({ isbn, seal }: GetBookTracksParams) => {
    const response = await fetchJson(`${API_URL}/library/${isbn}`, {
        headers: {
            'X-IronSeal': seal,
        },
    });
    return response;
};

const APIClient = {
    login,
    register,
    deleteAccount,
    checkSeal,
    getLibrary,
    getBookTracks,
    getHomeBooks,
};

export default APIClient;
