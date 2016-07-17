import { createVerify } from 'crypto'

import { Certificate, TBSCertificate } from './rfc5280-simplified'

// CA from <https://support.cloudflare.com/hc/en-us/articles/204899617>.
const originPullCa = `-----BEGIN CERTIFICATE-----
MIIGBjCCA/CgAwIBAgIIV5G6lVbCLmEwCwYJKoZIhvcNAQENMIGQMQswCQYDVQQG
EwJVUzEZMBcGA1UEChMQQ2xvdWRGbGFyZSwgSW5jLjEUMBIGA1UECxMLT3JpZ2lu
IFB1bGwxFjAUBgNVBAcTDVNhbiBGcmFuY2lzY28xEzARBgNVBAgTCkNhbGlmb3Ju
aWExIzAhBgNVBAMTGm9yaWdpbi1wdWxsLmNsb3VkZmxhcmUubmV0MB4XDTE1MDEx
MzAyNDc1M1oXDTIwMDExMjAyNTI1M1owgZAxCzAJBgNVBAYTAlVTMRkwFwYDVQQK
ExBDbG91ZEZsYXJlLCBJbmMuMRQwEgYDVQQLEwtPcmlnaW4gUHVsbDEWMBQGA1UE
BxMNU2FuIEZyYW5jaXNjbzETMBEGA1UECBMKQ2FsaWZvcm5pYTEjMCEGA1UEAxMa
b3JpZ2luLXB1bGwuY2xvdWRmbGFyZS5uZXQwggIiMA0GCSqGSIb3DQEBAQUAA4IC
DwAwggIKAoICAQDdsts6I2H5dGyn4adACQRXlfo0KmwsN7B5rxD8C5qgy6spyONr
WV0ecvdeGQfWa8Gy/yuTuOnsXfy7oyZ1dm93c3Mea7YkM7KNMc5Y6m520E9tHooc
f1qxeDpGSsnWc7HWibFgD7qZQx+T+yfNqt63vPI0HYBOYao6hWd3JQhu5caAcIS2
ms5tzSSZVH83ZPe6Lkb5xRgLl3eXEFcfI2DjnlOtLFqpjHuEB3Tr6agfdWyaGEEi
lRY1IB3k6TfLTaSiX2/SyJ96bp92wvTSjR7USjDV9ypf7AD6u6vwJZ3bwNisNw5L
ptph0FBnc1R6nDoHmvQRoyytoe0rl/d801i9Nru/fXa+l5K2nf1koR3IX440Z2i9
+Z4iVA69NmCbT4MVjm7K3zlOtwfI7i1KYVv+ATo4ycgBuZfY9f/2lBhIv7BHuZal
b9D+/EK8aMUfjDF4icEGm+RQfExv2nOpkR4BfQppF/dLmkYfjgtO1403X0ihkT6T
PYQdmYS6Jf53/KpqC3aA+R7zg2birtvprinlR14MNvwOsDOzsK4p8WYsgZOR4Qr2
gAx+z2aVOs/87+TVOR0r14irQsxbg7uP2X4t+EXx13glHxwG+CnzUVycDLMVGvuG
aUgF9hukZxlOZnrl6VOf1fg0Caf3uvV8smOkVw6DMsGhBZSJVwao0UQNqQIDAQAB
o2YwZDAOBgNVHQ8BAf8EBAMCAAYwEgYDVR0TAQH/BAgwBgEB/wIBAjAdBgNVHQ4E
FgQUQ1lLK2mLgOERM2pXzVc42p59xeswHwYDVR0jBBgwFoAUQ1lLK2mLgOERM2pX
zVc42p59xeswCwYJKoZIhvcNAQENA4ICAQDKDQM1qPRVP/4Gltz0D6OU6xezFBKr
LWtDoA1qW2F7pkiYawCP9MrDPDJsHy7dx+xw3bBZxOsK5PA/T7p1dqpEl6i8F692
g//EuYOifLYw3ySPe3LRNhvPl/1f6Sn862VhPvLa8aQAAwR9e/CZvlY3fj+6G5ik
3it7fikmKUsVnugNOkjmwI3hZqXfJNc7AtHDFw0mEOV0dSeAPTo95N9cxBbm9PKv
qAEmTEXp2trQ/RjJ/AomJyfA1BQjsD0j++DI3a9/BbDwWmr1lJciKxiNKaa0BRLB
dKMrYQD+PkPNCgEuojT+paLKRrMyFUzHSG1doYm46NE9/WARTh3sFUp1B7HZSBqA
kHleoB/vQ/mDuW9C3/8Jk2uRUdZxR+LoNZItuOjU8oTy6zpN1+GgSj7bHjiy9rfA
F+ehdrz+IOh80WIiqs763PGoaYUyzxLvVowLWNoxVVoc9G+PqFKqD988XlipHVB6
Bz+1CD4D/bWrs3cC9+kk/jFmrrAymZlkFX8tDb5aXASSLJjUjcptci9SKqtI2h0J
wUGkD7+bQAr+7vr8/R+CBmNMe7csE8NeEX6lVMF7Dh0a1YKQa6hUN18bBuYgTMuT
QzMmZpRpIBB321ZBlcnlxiTJvWxvbCPHKHj20VwwAz7LONF59s84ZsOqfoBv8gKM
s0s5dsq5zpLeaw==
-----END CERTIFICATE-----
`

export function verify (certificate) {
  // According to
  // <https://nodejs.org/api/tls.html#tls_tlssocket_getpeercertificate_detailed>
  // "If the peer does not provide a certificate, it returns `null` or an empty
  // object".
  if (!certificate || !certificate.raw) return false

  try {
    return tryVerify(certificate.raw)
  } catch (err) {
    return false
  }
}

// N.B. This only checks if the timestamps are valid and if the signature
// matches. Proper certificate validation requires more checks but that
// seems unnecessary in this case.
function tryVerify (rawBytes) {
  const {
    tbsCertificate,
    tbsCertificate: {
      validity: {
        notBefore: { value: notBefore },
        notAfter: { value: notAfter }
      }
    },
    signatureAlgorithm: { algorithm },
    signature: { data: signature }
  } = Certificate.decode(rawBytes, 'der')

  // Require sha512WithRSAEncryption.
  if (algorithm.join('.') !== '1.2.840.113549.1.1.13') {
    return false
  }

  // Check if certificate is still valid.–
  const now = Date.now()
  if (now < notBefore || now > notAfter) {
    return false
  }
  // Make sure the certificate was signed by CloudFlare's origin pull
  // certificate authority.
  const verify = createVerify('RSA-SHA512')
  verify.update(TBSCertificate.encode(tbsCertificate, 'der'))
  return verify.verify(originPullCa, signature)
}
