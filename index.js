const WebSocket = require('ws');
const pako = require('pako');
const crypto = require('crypto');
const querystring = require('querystring');

const ws = new WebSocket('wss://api.huobi.pro/ws/v1');

ws.on('open', () => {
    console.log('index:7open:');

    const authCredentials = {};
    const {sign, reqParams} = signSha({
        method: 'GET',
        url: 'api.huobi.pro',
        path: '/ws/v1',
        accessKey: 'xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxx',
        secretKey: 'xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxx'
    });

    Object.assign(authCredentials, reqParams, { op: 'auth', Signature: sign });

    ws.send(JSON.stringify(authCredentials));
});

ws.on('message', async (data) => {
    console.log('index:11:message:');

    const message = pako.inflate(data, { to: 'string' });

    console.log('message = ', message);
});

ws.on('error', (error) => {
    console.log('index:21:message:error');
    console.log('error = ', error);
});

ws.on('close', (code, reason) => {
    console.log('index:25:message:close');
    console.log('code = ', code);
    console.log('reason = ', reason);
});

const signSha = ({ method, url, path, params = {}, accessKey, secretKey }) => {
    const reqParams = {
        ...params,
        ...{
            AccessKeyId: accessKey,
            SignatureMethod: 'HmacSHA256',
            SignatureVersion: '2',
            Timestamp: new Date().toISOString().split('.')[0]
        }
    };

    const signatureStr = [
        method,
        url,
        path,
        querystring.stringify(reqParams).split('&').sort().join('&')
    ].join('\n');


    const sign = crypto.createHmac('sha256', secretKey)
            .update(signatureStr)
            .digest('base64');

    const query = querystring.stringify({
        ...reqParams,
        Signature: sign
    });

    return { query, sign, reqParams };
};
