import {RebillyStorefrontAPI} from 'rebilly-js-sdk';
import dotenv from 'dotenv';
import zoid from 'zoid';
import paypalLogo from './assets/paypal.svg';

const myStyle = `
    * {
        font-family: Roboto, Open Sans, Segoe UI, sans-serif;
    }
    
    body {
        background-color: #EDF3FE;
        padding: 2em 2em;
        font-family: Roboto;
    }
    
    
    fieldset {
        border: none;
        margin: 0 0 40px 0;
        padding: 0;
    }
    
    button {
        position: relative;
        border: none;
        padding: 8px 16px;
        color: #FFF;
        margin: 20px auto;
        border-radius: 8px;
        background: #1abc9c;
        font-size: 18px;
        text-align: center;
        font-style: normal;
        width: 100%;
        box-shadow: 0 10px 30px 0 rgba(26, 188, 156, 0.5);
        -moz-box-shadow: 0 10px 30px 0 rgba(26, 188, 156, 0.5);
        -webkit-box-shadow: 0 10px 30px 0 rgba(26, 188, 156, 0.5);
        -o-box-shadow: 0 10px 30px 0 rgba(26, 188, 156, 0.5);
        -ms-box-shadow: 0 10px 30px 0 rgba(26, 188, 156, 0.5);
        -webkit-transition: all 0.4s;
        -o-transition: all 0.4s;
        -moz-transition: all 0.4s;
        transition: all 0.4s;
    }
    
    button:hover {
        background: #000000;
        box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.2);
        -webkit-box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.2);
        -o-box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.2);
        -ms-box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.2);
        cursor: pointer;
    }
    
    
    .rebilly-framepay.rebilly-framepay-valid {
        border-color: pink;
    }
    
    .rebilly-framepay.rebilly-framepay-focus {
        /*border-color: rgba(0, 221, 26, .3);*/
    }
    
    .rebilly-framepay.rebilly-framepay-invalid {
        border-color: purple;
    }
`;

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
            css: myStyle,
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

