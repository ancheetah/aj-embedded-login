function component() {
    const el = document.createElement('div');
    el.innerHTML = 'Hello World';
    return el;
}

document.body.appendChild(component());