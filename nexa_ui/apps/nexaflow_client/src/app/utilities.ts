import { Domain } from "./constants";
import { Session } from "./types";

export async function getSessions(accessToken: string): Promise<Session[] | null> {
    try {
        const response = await appFetch("/api/v1/chat", {
            accessToken: accessToken
        });
        if (response.ok) {
            return response.json();
        } else {
            console.log(await response.json())
            return null;
        }
    } catch(error) {
        console.log(error);
        return null;
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


export async function appFetch(url: string, options: RequestInit & { agent_name?: string, accessToken?: string  } = {}) {
    const updatedOptions: RequestInit = {
        ...options,
        headers: {
            Authorization: `Nexaflow ${options.accessToken}`,
            'x-api-key': process.env.APP_API_KEY!,
            ...(options.headers || {}),
        },
    };
    if (options.agent_name) {
      url = BASE_URL`http://${options.agent_name}.localhost${url}`
    }
    else {
      url = BASE_URL`${url}`
    }
    return fetch(url, updatedOptions);
}

