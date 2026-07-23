import { Injectable } from '@nestjs/common'
import { generateNonce } from 'siwe'

@Injectable()
export class NonceService {
  /** Generates a fresh SIWE nonce. Stored statelessly in a short-lived cookie. */
  generate(): string {
    return generateNonce()
  }
}
