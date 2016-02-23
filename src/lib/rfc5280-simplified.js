import asn1 from 'asn1.js'

// Definitions from
// <https://github.com/indutny/asn1.js/blob/10577d002eb4232f61ae6d538018d1afd287e382/rfc/5280/index.js>,
// however Extension#extnValue is left as an octet string. This allows for
// reencoding TBSCertificate without data loss, as necessary for signature
// verification.

// AlgorithmIdentifier  ::=  SEQUENCE  {
//      algorithm               OBJECT IDENTIFIER,
//      parameters              ANY DEFINED BY algorithm OPTIONAL  }
const AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', function () {
  this.seq().obj(
    this.key('algorithm').objid(),
    this.key('parameters').optional().any()
  )
})

// Certificate  ::=  SEQUENCE  {
//      tbsCertificate       TBSCertificate,
//      signatureAlgorithm   AlgorithmIdentifier,
//      signature            BIT STRING  }
const Certificate = asn1.define('Certificate', function () {
  this.seq().obj(
    this.key('tbsCertificate').use(TBSCertificate),
    this.key('signatureAlgorithm').use(AlgorithmIdentifier),
    this.key('signature').bitstr()
  )
})

// TBSCertificate  ::=  SEQUENCE  {
//      version         [0]  Version DEFAULT v1,
//      serialNumber         CertificateSerialNumber,
//      signature            AlgorithmIdentifier,
//      issuer               Name,
//      validity             Validity,
//      subject              Name,
//      subjectPublicKeyInfo SubjectPublicKeyInfo,
//      issuerUniqueID  [1]  IMPLICIT UniqueIdentifier OPTIONAL,
//      subjectUniqueID [2]  IMPLICIT UniqueIdentifier OPTIONAL,
//      extensions      [3]  Extensions OPTIONAL
const TBSCertificate = asn1.define('TBSCertificate', function () {
  this.seq().obj(
    this.key('version').def('v1').explicit(0).use(Version),
    this.key('serialNumber').int(),
    this.key('signature').use(AlgorithmIdentifier),
    this.key('issuer').use(Name),
    this.key('validity').use(Validity),
    this.key('subject').use(Name),
    this.key('subjectPublicKeyInfo').use(SubjectPublicKeyInfo),
    this.key('issuerUniqueID').optional().explicit(1).bitstr(),
    this.key('subjectUniqueID').optional().explicit(2).bitstr(),
    this.key('extensions').optional().explicit(3).seqof(Extension)
  )
})

// Version  ::=  INTEGER  {  v1(0), v2(1), v3(2)  }
const Version = asn1.define('Version', function () {
  this.int({
    0: 'v1',
    1: 'v2',
    2: 'v3'
  })
})

// Validity ::= SEQUENCE {
//      notBefore      Time,
//      notAfter       Time  }
const Validity = asn1.define('Validity', function () {
  this.seq().obj(
    this.key('notBefore').use(Time),
    this.key('notAfter').use(Time)
  )
})

// Time ::= CHOICE {
//      utcTime        UTCTime,
//      generalTime    GeneralizedTime }
const Time = asn1.define('Time', function () {
  this.choice({
    utcTime: this.utctime(),
    genTime: this.gentime()
  })
})

// SubjectPublicKeyInfo  ::=  SEQUENCE  {
//      algorithm            AlgorithmIdentifier,
//      subjectPublicKey     BIT STRING  }
const SubjectPublicKeyInfo = asn1.define('SubjectPublicKeyInfo', function () {
  this.seq().obj(
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('subjectPublicKey').bitstr()
  )
})

// Extension  ::=  SEQUENCE  {
//      extnID      OBJECT IDENTIFIER,
//      critical    BOOLEAN DEFAULT FALSE,
//      extnValue   OCTET STRING }
const Extension = asn1.define('Extension', function () {
  this.seq().obj(
    this.key('extnID').objid(),
    this.key('critical').bool().def(false),
    this.key('extnValue').octstr()
  )
})

// Name ::= CHOICE { -- only one possibility for now --
//      rdnSequence  RDNSequence }
const Name = asn1.define('Name', function () {
  this.choice({
    rdnSequence: this.use(RDNSequence)
  })
})

// RDNSequence ::= SEQUENCE OF RelativeDistinguishedName
const RDNSequence = asn1.define('RDNSequence', function () {
  this.seqof(RelativeDistinguishedName)
})

// RelativeDistinguishedName ::=
//      SET SIZE (1..MAX) OF AttributeTypeAndValue
const RelativeDistinguishedName = asn1.define('RelativeDistinguishedName',
  function () {
    this.setof(AttributeTypeAndValue)
  })

// AttributeTypeAndValue ::= SEQUENCE {
//      type     AttributeType,
//      value    AttributeValue }
const AttributeTypeAndValue = asn1.define('AttributeTypeAndValue', function () {
  this.seq().obj(
    this.key('type').use(AttributeType),
    this.key('value').use(AttributeValue)
  )
})

// AttributeType ::= OBJECT IDENTIFIER
const AttributeType = asn1.define('AttributeType', function () {
  this.objid()
})

// AttributeValue ::= ANY -- DEFINED BY AttributeType
const AttributeValue = asn1.define('AttributeValue', function () {
  this.any()
})

export { Certificate, TBSCertificate }
