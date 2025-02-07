import { Config, FRAuth } from '@forgerock/javascript-sdk';
import './styles.css';

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

function handleFirstStep(step) {
    const formElem = document.getElementById('login-form');
    const nameCallback = step.getCallbackOfType('NameCallback');
    const passwordCallback = step.getCallbackOfType('PasswordCallback');
    nameCallback.setName(formElem.querySelector('input[name="username"]').value);
    passwordCallback.setPassword(formElem.querySelector('input[name="password"]').value);
    console.log('nameCallback', nameCallback);
    console.log('passwordCallback', passwordCallback);
}

function handleSecondStep(step) {
    switch (step.type) {
    case 'LoginSuccess':
        const sessionToken = step.getSessionToken();
        console.log('sessionToken', sessionToken);
        break;
    case 'LoginFailure':
        const reason = step.getReason();
        throw new Error(`Login failed: ${reason}`);
    default:
        console.log('Unknown step: ', step);
    }
    return;
}

async function submitHandler() {
    const successElem = document.getElementById('success');
    const errorElem = document.getElementById('error');
    successElem.style.display = 'none';
    errorElem.style.display = 'none';

    try {
        const firstStep = await FRAuth.start();
        console.log('firstStep', firstStep);
        if (!firstStep) {
            throw new Error('Failed to get first step');
        }
        
        handleFirstStep(firstStep);

        const secondStep = await FRAuth.next(firstStep);
        console.log('secondStep', secondStep);
        if (!secondStep) {
            throw new Error('Failed to get second step');
        }
        handleSecondStep(secondStep);

        successElem.style.display = 'block';
    } catch (err) {
        console.error('Failed to submit: ', err);
        errorElem.style.display = 'block';
    }
}

document.getElementById('login-form').addEventListener('submit', submitHandler);