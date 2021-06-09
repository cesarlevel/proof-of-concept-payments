import zoid from 'zoid';

const zoidComponentInit = zoid.create({
    tag: 'zoid-test',
    url: 'http://localhost:1234/paypal.html'
});

const approvalUrl = window.xprops.approvalUrl;
const redirectUrl = 'http://localhost:1234/redirect.html';
const testRedirect = false;

if (testRedirect) {
    setTimeout(() => {
        window.location = redirectUrl
    }, 1000);
} else {
    window.location = approvalUrl;
}


