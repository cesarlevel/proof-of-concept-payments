import zoid from 'zoid';

const zoidComponentInit = zoid.create({
    tag: 'zoid-test',
    url: 'http://localhost:1234/payment-instrument-flows/payment-card/payment-card.html'
});

const cssStyle = document.createElement('style');

document.head.append(cssStyle);
cssStyle.innerHTML = window.xprops.css;

(function initializeFramepay() {
    Rebilly.initialize({
        publishableKey: window.xprops.publishableKey,
        organizationId: window.xprops.organizationId,
    });

    var form = document.querySelector('form');

    Rebilly.on('ready', () => {
        var card = Rebilly.card.mount('#card');
    });


    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        Rebilly.createToken(form)
            .then(result => {
                const targetWindow = window.opener;
                targetWindow.postMessage({successResponse: {message: result}}, '*',);
            })
            .catch(error => {
                console.log('Framepay error', error);
                window.parent.postMessage('error', '*')
            });
    });
})();
