# cloudflare-origin-pull

CloudFlare has an [Authenticated Origin
Pulls](https://support.cloudflare.com/hc/en-us/articles/204899617) mode where
requests to your origin servers present a CloudFlare issued certificate. This
module helps you verify requests to your Node server came from CloudFlare
without needing to change how your own SSL certificate is served.

This module has been tested with Node.js 0.10 and above.

## Installation

```shell
npm install --save cloudflare-origin-pull
```

## Usage

You'll need to run an HTTPS server for this to work. In the example below that's
done assuming a certificate in PKCS #12 format named `my-cert.p12`.

Add the `requestCert` option and set it to `true`. This causes your HTTPS server
to request the peer certificate from CloudFlare.

Set `rejectUnauthorized` to `false`. This allows you to verify the peer
certificate yourself.

`req.client` is a
[`TLSSocket`](https://nodejs.org/api/tls.html#tls_class_tls_tlssocket).
[`getPeerCertificate()`](https://nodejs.org/api/tls.html#tls_tlssocket_getpeercertificate_detailed)
returns what we hope is CloudFlare's certificate.

The `cloudflare-origin-pull` module exports a `verify()` method. Call it with
the peer certificate, if any. It verifies whether the certificate was issued by
CloudFlare and if it has not yet expired, returning a boolean. `verify()` does
not throw errors and can be called without a certificate (it'll return `false`).

Simply destroy the client connection if the certificate was not from CloudFlare
or no certificate was presented at all.

```js
const https = require('https')
const verify = require('cloudflare-origin-pull').verify

https.createServer({
  pfx: 'my-cert.p12',
  requestCert: true,
  rejectUnauthorized: false
}, (req, res) => {
  if (!verify(req.client.getPeerCertificate())) {
    req.client.destroy()
    return
  }

  res.writeHead(200)
  res.end('You’re cool.')
})
```
