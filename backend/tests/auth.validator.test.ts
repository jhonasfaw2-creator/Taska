import {
  validatePhoneNumber,
  validateOtpCode,
  validateRefreshToken,
} from '../src/validators/auth.validator';
import { AppError } from '../src/types';

describe('validatePhoneNumber', () => {
  it('accepts a valid E.164 number', () => {
    expect(() => validatePhoneNumber('+251911223344')).not.toThrow();
  });

  it('rejects a number without a leading +', () => {
    expect(() => validatePhoneNumber('251911223344')).toThrow(AppError);
  });

  it('rejects a number that is too short', () => {
    expect(() => validatePhoneNumber('+123')).toThrow(AppError);
  });

  it('rejects an empty value', () => {
    expect(() => validatePhoneNumber('')).toThrow('Phone number is required.');
  });
});

describe('validateOtpCode', () => {
  it('accepts exactly six digits', () => {
    expect(() => validateOtpCode('123456')).not.toThrow();
  });

  it('rejects non-numeric codes', () => {
    expect(() => validateOtpCode('12a456')).toThrow(AppError);
  });

  it('rejects codes of the wrong length', () => {
    expect(() => validateOtpCode('12345')).toThrow(AppError);
  });
});

describe('validateRefreshToken', () => {
  it('accepts a non-empty string', () => {
    expect(() => validateRefreshToken('some.jwt.token')).not.toThrow();
  });

  it('rejects an empty value', () => {
    expect(() => validateRefreshToken('')).toThrow('Refresh token is required.');
  });
});
