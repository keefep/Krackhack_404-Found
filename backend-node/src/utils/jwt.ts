import jwt, { SignOptions, Secret } from 'jsonwebtoken';

// Valid zeit/ms string format or number of seconds
export type JWTDuration = number | `${number}s` | `${number}m` | `${number}h` | `${number}d`;

export interface JWTConfig {
  secret: string;
  duration: JWTDuration;
  algorithm?: jwt.Algorithm;
}

export function createJWTConfig(
  secret: string | undefined,
  defaultSecret: string,
  duration: JWTDuration,
  algorithm: jwt.Algorithm = 'HS256'
): JWTConfig {
  return {
    secret: secret || defaultSecret,
    duration,
    algorithm,
  };
}

export function signJWT(
  payload: Record<string, any>,
  config: JWTConfig
): string {
  const options: SignOptions = {
    expiresIn: config.duration as any, // We know our JWTDuration type is compatible
    algorithm: config.algorithm,
  };

  return jwt.sign(payload, config.secret, options);
}

export function verifyJWT<T>(token: string, secret: Secret): T {
  return jwt.verify(token, secret) as T;
}

// Helper function to convert duration to seconds
export function durationToSeconds(duration: JWTDuration): number {
  if (typeof duration === 'number') {
    return duration;
  }

  const value = parseInt(duration);
  const unit = duration.slice(-1);

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      throw new Error('Invalid duration format');
  }
}
