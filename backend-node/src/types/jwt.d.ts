import { Secret } from 'jsonwebtoken';

declare module 'jsonwebtoken' {
  interface SignOptions {
    /**
     * Expressed in seconds or a string describing a time span zeit/ms.
     * Eg: 60, "2 days", "10h", "7d"
     */
    expiresIn?: string | number;
    algorithm?: string;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
  }

  interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    issuer?: string | string[];
    jwtid?: string;
    subject?: string;
    clockTolerance?: number;
    maxAge?: string | number;
    ignoreExpiration?: boolean;
  }

  function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): string;

  function verify<T = any>(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions
  ): T;
}
