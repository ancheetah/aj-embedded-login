import { Config, FRAuth } from '@forgerock/javascript-sdk';

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

function handleFirstStep(step) {
    const formElem = document.getElementById('login-form');
    const nameCallback = step.getCallbackOfType('NameCallback');
    const passwordCallback = step.getCallbackOfType('PasswordCallback');
    nameCallback.setName(formElem.querySelector('input[name="username"]').value);
    passwordCallback.setPassword(formElem.querySelector('input[name="password"]').value);
    console.log('nameCallback', nameCallback);
    console.log('passwordCallback', passwordCallback);
}

async function submitHandler() {
    try {
        const firstStep = await FRAuth.start();
        console.log('firstStep', firstStep);
        if (!firstStep) {
            throw new Error('Failed to get first step');
        }
        
        handleFirstStep(firstStep);

        // const nextStep = await FRAuth.next(firstStep);
        // console.log('nextStep', nextStep);
    } catch (err) {
        console.error('Failed to submit: ', err);
    } finally {
        document.body.appendChild(successMessage());
    }
}

document.getElementById('login-form').addEventListener('submit', submitHandler);