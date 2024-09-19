import {
    collection,
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import { auth, firestore } from './firebase.config';
import { Action, APIKey, DocumentMetaData, User } from './types';
import {  Domain } from './constants';


export async function addUserDetails(user: User) {
    const userCollection = collection(firestore, `users`);
    await setDoc(doc(userCollection, user.uid), user);
    return user;
}

export async function getUserFromDB(userID: string): Promise<{ user: User | null, error: any | null }> {
    try {
        const userRef = doc(firestore, `users/${userID}`);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return { user: userDoc.data() as User, error: null };
        }
        return { user: null, error: new Error("User doesn't exists") }
    } catch (error) {
        console.error("Error Getting User Data: ", error);
        return { user: null, error };
    }
}



export function checkIfEmpty(values: Record<string, any>) {
    const keys = Object.keys(values);
    for (const key of keys) {
        if (!values[key]) {
            alert(`Value of ${key} not present`);
            return true;
        }
    }
    return false;
}

export async function getActions(agent_name: string) {
    const response = await appFetch(`/api/v1/actions/`, { agent_name })
    const data = await response.json();
    return data["actions"] as Action[];
}

export async function getDocuments(agent_name: string) {
    const response = await appFetch(`/api/v1/documents/`, { agent_name })
    const data = await response.json();
    return data["documents"] as DocumentMetaData[];
}

export async function getAgents() {
    const response = await appFetch('/api/v1/agents', { agent_name: "admin" });
    if (response.ok) {
      const agents = await response.json();
      return agents;
    } else {
        const error = await response.json();
        console.log("Agents Fetch Error: ", error.details);
        return null
    }
}

export async function getAPIKeys() {
    const response = await appFetch('/api/v1/api_key', { agent_name: "admin" });
    if (response.ok) {
      const encryptedData = await response.text();
      const apiKeysString = await decryptMessage(encryptedData);
      const apiKeys: APIKey[] = JSON.parse(apiKeysString);
      return apiKeys;
    } else {
        const error = await response.json();
        console.log("Agents Fetch Error: ", error.details);
        return []
    }
}



export function BASE_URL(strings: TemplateStringsArray, ...values: (string | number)[]): string {
    let fullUrl: string = strings.reduce((result, str, i) => result + str + (values[i] || ""), "");
    if (Domain !== "localhost") {
        fullUrl = fullUrl.replace(/^http:\/\//, 'https://');
        fullUrl = fullUrl.replace('localhost', Domain);
    }

    return fullUrl;
}

async function getUserAuthToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const idToken = await currentUser.getIdToken();
        return idToken;
      } catch (error) {
        console.error("Error getting user token:", error);
        return null;
      }
    } else {
      console.log("No user is signed in");
        return null;
    }
}

type DefaultHeaders = {
    Authorization?: string,
    "x-api-key"?: string,
}


export async function appFetch(url: string, options: RequestInit & { agent_name?: string, accessToken?: string  } = {}) {
    const idToken = await getUserAuthToken();
    let defaultHeaders: DefaultHeaders = {};
    if (idToken) {    
        defaultHeaders.Authorization =`Nexaflow ${idToken}`;
    }
    defaultHeaders['x-api-key'] = process.env.APP_API_KEY;

    const updatedOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };
    if (options.agent_name) {
        url = BASE_URL`http://${options.agent_name}.localhost${url}`
    }
    else {
        url = BASE_URL `http://localhost${url}`
    }
    return fetch(url, updatedOptions);
}



function base64ToArrayBuffer(base64: string) {
    base64 = base64.replace(/[^A-Za-z0-9+/]/g, "");
    
    while (base64.length % 4 !== 0) {
        base64 += "=";
    }

    try {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        console.error("Error decoding base64:", e);
        return null;
    }
}

export async function decryptMessage(encryptedMessageBase64: string) {
    const hexKey = process.env.SECRET_KEY;
    if (!hexKey) {
        throw new Error("Secret key not found");
    }

    const keyBuffer = hexToArrayBuffer(hexKey);

    const encryptedBuffer = base64ToArrayBuffer(encryptedMessageBase64);
    const encryptedBytes = new Uint8Array(encryptedBuffer!);

    const iv = encryptedBytes.slice(0, 16);
    const ciphertext = encryptedBytes.slice(16); 

    const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt']
    );


    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

function hexToArrayBuffer(hex: string) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
}