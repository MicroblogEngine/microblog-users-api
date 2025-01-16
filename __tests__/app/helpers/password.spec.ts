import { generatePassword, validPassword } from '@/helpers/password'
import { expect, test } from 'vitest'

test('generate a password', () => {
  const {salt, hash} = generatePassword("123456")
  expect(salt).toBeDefined()
  expect(hash).toBeDefined()
})

test('is valid password', () => {
  const {salt, hash} = generatePassword("123456")
  expect(salt).toBeDefined()
  expect(hash).toBeDefined()

  const valid = validPassword("123456", hash, salt)
  expect(valid).toBeTruthy()
})