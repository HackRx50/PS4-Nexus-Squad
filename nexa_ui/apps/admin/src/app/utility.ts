import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { firestore } from './firebase.config';
import { Action, DocumentMetaData, User } from './types';
import { BASE_URL } from './constants';


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
    const response = await fetch(BASE_URL`http://${agent_name}.localhost/api/v1/actions/`)
    const data = await response.json();
    console.log(data);
    console.log(JSON.stringify(data));
    return data["actions"] as Action[];
}

export async function getDocuments(agent_name: string) {
    const response = await fetch(BASE_URL`http://${agent_name}.localhost/api/v1/documents/`)
    const data = await response.json();
    console.log(data);
    console.log(JSON.stringify(data));
    return data["documents"] as DocumentMetaData[];
}

