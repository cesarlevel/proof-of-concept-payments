import {RebillyStorefrontAPI} from 'rebilly-js-sdk';
import dotenv from 'dotenv';
import zoid from 'zoid';
import paypalLogo from './assets/paypal.svg';

document.addEventListener('DOMContentLoaded', function() {
    dotenv.config({path: '../.env'});
    const api = RebillyStorefrontAPI({
        organizationId: process.env.ORGANIZATION_ID,
        sandbox: process.env.APP_MODE === 'sandbox'
    });
    api.setPublishableKey(process.env.API_KEY);
    const form = document.querySelector('form');
    const loading = document.querySelector('.loading');
    const zoidElement = document.querySelector('#zoid-component');
    const paypalButtonImg = document.querySelector('button img');
    const paymentCardButton = document.querySelector('button.payment-card');
    paypalButtonImg.src = paypalLogo;

    let token;
    let selectedMethod = 'paypal';
    let approvalUrl = '';
    let zoidComponent;
    let zoidComponentUrl = '';

    // ZOID component
    const zoidComponentInit = zoid.create({
        tag: 'zoid-test',
        url: () => zoidComponentUrl, // Update URL based on selection
        dimensions: {
            width: '600px',
            height: '600px',
        },
        defaultContext: 'popup',
        onSuccess: function() {
            console.log('Worked!');
        },
        containerTemplate: function containerTemplate({ doc, uid, frame, focus, prerenderFrame }) {
            let container = doc.createElement('div');
            let text = doc.createElement('p');
            text.innerText = 'Click here to show popup window'
            container.id = uid;
            container.append(text);
            container.classList.add('overlay');
            container.addEventListener('click', focus);
            return container;
        },
    });

    // Purchase request response will return the approvalUrl for PayPal
    async function makePurchase() {
        try {
            const {fields} = await api.purchase.purchase({
                data: {
                    websiteId: 'my-awesome-website',
                    items: [
                        {
                            planId: 'my-awesome-product',
                            quantity: 1,
                        },
                        {
                            planId: 'awesome-t-shirt',
                            quantity: 1,
                        }
                    ],
                    billingAddress: token.billingAddress,
                    paymentInstruction: {
                        token: token.id,
                    }
                }
            });
            approvalUrl = fields.transaction.approvalUrl;

            zoidComponent = zoidComponentInit({
                approvalUrl,
                publishableKey: process.env.API_KEY,
                organizationId: process.env.ORGANIZATION_ID,
            });
            loading.classList.remove('active');

            zoidComponent.render(zoidElement);

        } catch (error) {
            loading.classList.remove('active');
            console.error(error);
        }
    }

    // Payment card
    function paymentCardFlow(e) {
        e.preventDefault();
        zoidComponentUrl = 'http://localhost:1234/payment-instrument-flows/payment-card/payment-card.html';
        zoidComponent = zoidComponentInit({
            publishableKey: process.env.API_KEY,
            organizationId: process.env.ORGANIZATION_ID,
        });
        zoidComponent.render(zoidElement);
    }

    // Framepay
    (function initializeFramepay() {
        Rebilly.initialize({
            publishableKey: process.env.API_KEY,
            organizationId: process.env.ORGANIZATION_ID,
        });
        Rebilly.on('token-ready', (data) => {

        });

        form.addEventListener('submit', (e) => {
            loading.classList.toggle('active');
            zoidComponentUrl = 'http://localhost:1234/payment-instrument-flows/paypal/paypal.html';
            e.preventDefault();
            e.stopPropagation();

            Rebilly.createToken(form, {
                method: selectedMethod
            })
            .then(async result => {
                token = result;
                await makePurchase();
                window.parent.postMessage('success', '*')
            })
            .catch(error => {
                window.parent.postMessage('error', '*')
            });
        });
    })();

    //Event listeners
    paymentCardButton.addEventListener('click', paymentCardFlow);
    window.addEventListener("message", (event) => {
        if (event.data.successResponse) {
            console.log('ZOID Component message => ', event.data.successResponse);
            zoidComponent.close();
        }
    }, false);
});

