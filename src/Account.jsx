import {useMsal} from "@azure/msal-react";

export function Account() {
    const [accounts] = useMsal();
    return accounts[0];
}

