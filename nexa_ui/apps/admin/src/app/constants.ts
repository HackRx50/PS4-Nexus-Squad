const LOCALHOST = true;
const Domain = "localhost"

export function BASE_URL(strings: TemplateStringsArray, ...values: (string | number)[]): string {
    let fullUrl: string = strings.reduce((result, str, i) => result + str + (values[i] || ""), "");
    if (Domain !== "localhost") {
        fullUrl = fullUrl.replace(/^http:\/\//, 'https://');
        fullUrl = fullUrl.replace('localhost', Domain);
    }

    return fullUrl;
}
