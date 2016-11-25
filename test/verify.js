import { readFileSync } from 'fs'
import { basename, join } from 'path'

import test from 'ava'
import lolex from 'lolex'

import { verify } from '../'

const certs = [
  'bad-algorithm.cert',
  'bad-data.cert',
  'bad-signature.cert',
  'cloudflare-origin-pull.cert'
].reduce((acc, file) => {
  const cert = readFileSync(join(__dirname, 'fixtures', file))
  return Object.defineProperty(acc, basename(file, '.cert'), {
    get () {
      const raw = new Buffer(cert.length)
      cert.copy(raw)
      return { raw }
    }
  })
}, {})

const dates = {
  invalidBefore: new Date('2015-02-22T17:28:42.490Z').valueOf(),
  valid: new Date('2016-02-22T17:28:42.490Z').valueOf(),
  invalidAfter: new Date('2018-02-22T17:28:42.490Z').valueOf()
}

const clock = lolex.install(dates.valid, ['Date'])
test.beforeEach(() => {
  clock.setSystemTime(dates.valid)
})

test('the certificate is valid', t => {
  t.true(verify(certs['cloudflare-origin-pull']))
})

test('there is no certificate', t => {
  t.false(verify(null))
})

test('the certificate has no raw data', t => {
  t.false(verify({}))
})

test('the certificate is signed with an unexpected signature', t => {
  t.false(verify(certs['bad-algorithm']))
})

test('the certificate could not be parsed', t => {
  t.false(verify(certs['bad-data']))
})

test('the signature could not be verified', t => {
  t.false(verify(certs['bad-signature']))
})

test('the certificate is not yet valid', t => {
  clock.setSystemTime(dates.invalidBefore)
  t.false(verify(certs['cloudflare-origin-pull']))
})

test('the certificate is no longer valid', t => {
  clock.setSystemTime(dates.invalidAfter)
  t.false(verify(certs['cloudflare-origin-pull']))
})
