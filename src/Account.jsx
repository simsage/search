import {useMsal} from "@azure/msal-react";

export function Account() {
    const [accounts] = useMsal();
    console.log(accounts[0]);
    return accounts[0];
}

