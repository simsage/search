import Keycloak from 'keycloak-js'

const keycloakConfig = {
    url: window.ENV.kc_endpoint,
    realm: window.ENV.kc_realm,
    clientId: window.ENV.kc_client_id,
    onLoad: 'check-sso', // check-sso | login-required
    KeycloakResponseType: 'code',
}
let keycloak = new Keycloak(keycloakConfig);
export default keycloak;
