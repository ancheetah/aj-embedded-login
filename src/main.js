import { Config } from '@forgerock/javascript-sdk';

Config.set({
    clientId: 'aj-public-sdk-client', // e.g. 'ForgeRockSDKClient'
    // redirectUri: `${window.location.origin}/callback.html`, // e.g. 'https://sdkapp.example.com:8443/callback.html'
    // scope: 'openid profile email address', // e.g. 'openid profile email address phone'
    serverConfig: {
        baseUrl: 'https://openam-sdks.forgeblocks.com/am', // e.g. 'https://myorg.forgeblocks.com/am' or 'https://openam.example.com:8443/openam'
        timeout: parseInt(60000), // 90000 or less
    },
    realmPath: 'alpha', // e.g. 'alpha' or 'root'
    // tree: process.env.TREE, // e.g. 'sdkAuthenticationTree' or 'Login'
});

function successMessage() {
    const el = document.createElement('div');
    el.innerHTML = 'Submitted!';
    return el;
}

function submitHandler() {
    document.body.appendChild(successMessage());
}

document.getElementById('login-form').addEventListener('submit', submitHandler);