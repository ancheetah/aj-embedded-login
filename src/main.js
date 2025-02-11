import { Config, FRAuth, FRUser, TokenManager, UserManager } from '@forgerock/javascript-sdk';
import './styles.css';

Config.set({
    clientId: 'aj-public-sdk-client', // e.g. 'ForgeRockSDKClient'
    redirectUri: `http://localhost:3000`, // e.g. 'https://sdkapp.example.com:8443/callback.html'
    scope: 'openid profile email address', // e.g. 'openid profile email address phone'
    serverConfig: {
        baseUrl: 'https://openam-sdks.forgeblocks.com/am', // e.g. 'https://myorg.forgeblocks.com/am' or 'https://openam.example.com:8443/openam'
        timeout: parseInt(3000), // 90000 or less
    },
    realmPath: 'alpha', // e.g. 'alpha' or 'root'
    tree: 'AJ Choice Login', // e.g. 'sdkAuthenticationTree' or 'Login'
});

const loginElem = document.getElementById('login-form');
const continueElem = document.getElementById('continue-form');
const successElem = document.getElementById('success');
const errorElem = document.getElementById('error');
const userPanel = document.getElementById('user');
const userInfoElem = document.querySelector('#user pre');

async function nextSteps(step) {
    do {
        const nextStep = await FRAuth.next(step);
        console.log('nextStep', nextStep);
        await handleNextStep(nextStep);
        step = nextStep;
    } while (step);
    return;
}

function handleFirstStep(step) {
    const loginElem = document.getElementById('login-form');
    const nameCallback = step.getCallbackOfType('NameCallback');
    const passwordCallback = step.getCallbackOfType('PasswordCallback');
    nameCallback.setName(loginElem.querySelector('input[name="username"]').value);
    passwordCallback.setPassword(loginElem.querySelector('input[name="password"]').value);
    console.log('nameCallback', nameCallback);
    console.log('passwordCallback', passwordCallback);
}

async function handleNextStep(step) {
    continueElem.style.display = 'none';
    switch (step.type) {
    case 'LoginSuccess':
        const sessionToken = step.getSessionToken();
        console.log('sessionToken', sessionToken);
        if (!sessionToken) {
            throw new Error('Failed to get session token');
        }

        try {
            const tokens = await TokenManager.getTokens();
            console.log('token manager tokens', tokens);
            const accessToken = tokens.accessToken;
            if (!accessToken) {
                throw new Error('No access token found');
            }
        } catch (err) {
            throw new Error(`Failed to get tokens from token manager: ${err}`);
        }

        // Display user info
        const user = await UserManager.getCurrentUser();
        if (!user) {
            throw new Error('Failed to get user');
        }
        userInfoElem.innerHTML = JSON.stringify(user, null, 2);
        userPanel.style.display = 'block';
        successElem.style.display = 'block';
        loginElem.style.display = 'none';
        break;
    case 'Step':
        let stage;
        const nameCallbacks = step.getCallbacksOfType('NameCallback');
        const passwordCallbacks = step.getCallbacksOfType('PasswordCallback');
        const choiceCallbacks = step.getCallbacksOfType('ChoiceCallback');
        
        if (nameCallbacks.length && passwordCallbacks.length) {
            stage = 'UsernamePassword';
        } else if (choiceCallbacks.length) {
            stage = 'Choice';
        } else {
            stage = undefined;
        }
        console.log('stage', stage);

        switch (stage) {
            case 'UsernamePassword':
                handleFirstStep(step);
                break;
            case 'Choice':
                loginElem.style.display = 'none';

                const choiceCallback = choiceCallbacks[0];
                // console.log('choiceCallback', choiceCallback);
                const prompt = choiceCallback.getPrompt();
                const choices = choiceCallback.getChoices();
                const defaultChoice = choiceCallback.getDefaultChoice();
                // console.log('choice', prompt, choices);

                if (!prompt || !choices.length) {
                    throw new Error('No prompt or choices found');
                }

                const promptElem = document.createElement('p');
                promptElem.innerHTML = prompt;
                continueElem.appendChild(promptElem);

                choices.forEach(choice => {
                    const radio = document.createElement('div');
                    const input = document.createElement('input');
                    input.setAttribute('type', 'radio');
                    input.setAttribute('id', choice);
                    input.setAttribute('name', 'choice');
                    input.setAttribute('value', choice);
                    input.setAttribute('checked', defaultChoice === choice);
                    radio.appendChild(input);

                    const label = document.createElement('label');
                    label.setAttribute('for', choice);
                    label.innerHTML = choice;
                    radio.appendChild(label);

                    continueElem.appendChild(radio);
                });

                const submitChoiceButton = document.createElement('button');
                submitChoiceButton.setAttribute('type', 'submit');
                submitChoiceButton.innerHTML = 'Submit';
                continueElem.appendChild(submitChoiceButton);

                continueElem.style.display = 'block';

                continueElem.addEventListener('submit', () => submitChoiceHandler(step));
                break;
            default:
                throw new Error('Unknown stage');
        }

        break;
    case 'LoginFailure':
        const reason = step.getReason();
        errorElem.style.display = 'block';
        throw new Error(`Login failed: ${reason}`);
    default:
        console.log('Unknown step: ', step);
        throw new Error('Unknown step');
    }
}

async function submitHandler() {
    successElem.style.display = 'none';
    errorElem.style.display = 'none';

    try {
        const firstStep = await FRAuth.start();
        console.log('firstStep', firstStep);
        if (!firstStep) {
            throw new Error('Failed to get first step');
        }
        
        await handleNextStep(firstStep);

        const secondStep = await FRAuth.next(firstStep);
        console.log('secondStep', secondStep);
        if (!secondStep) {
            throw new Error('Failed to get second step');
        }
        
        await handleNextStep(secondStep);
    } catch (err) {
        console.error('Failed to submit: ', err);
        errorElem.style.display = 'block';
    }
}

function submitChoiceHandler(step) {
    const choiceCallback = step.getCallbackOfType('ChoiceCallback');
    const choices = document.querySelectorAll('input[name="choice"]');
    let selectedChoice;
    choices.forEach(choice => {
        if (choice.checked) {
            selectedChoice = choice.value;
            console.log('selected choice', selectedChoice);
        }
    });
    choiceCallback.setChoiceValue(selectedChoice);
    nextSteps(step);
}

loginElem.addEventListener('submit', submitHandler);
document.getElementById('logout').addEventListener('click', async () => {
    continueElem.style.display = 'none';
    userInfoElem.style.display = 'none';
    try{
        await FRUser.logout();
        location.reload(true);
    } catch (err) {
        throw new Error(`Failed to logout: ${err}`);
    }
}
);