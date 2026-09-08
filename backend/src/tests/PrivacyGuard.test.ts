import { PrivacyGuard } from '../services/PrivacyGuard';
import { RedactionEngine } from '../services/RedactionEngine';

describe('PrivacyGuard', () => {
  const guard = new PrivacyGuard();
  const redactor = new RedactionEngine();

  test('detects email address', () => {
    const dets = guard.detectInText('Contact: demo@example.com for more info');
    expect(dets.some(d => d.type === 'EMAIL')).toBe(true);
  });

  test('detects phone number', () => {
    const dets = guard.detectInText('Call us at 9876543210');
    expect(dets.some(d => d.type === 'PHONE')).toBe(true);
  });

  test('CRITICAL: raw PII not in redacted output', () => {
    const rawText = 'Email: secret@test.com Phone: 9876543210';
    const dets = guard.detectInText(rawText);
    const redacted = redactor.redactText(rawText, dets);
    expect(redacted).not.toContain('secret@test.com');
    expect(redacted).not.toContain('9876543210');
  });

  test('SECURITY TEST: password not transmitted', () => {
    const rawText = 'password: secret123';
    const dets = guard.detectInText(rawText);
    const redacted = redactor.redactText(rawText, dets);
    // The raw password value must not appear in output
    expect(redacted).not.toContain('secret123');
  });

  test('rawSensitiveDataTransmitted is always 0', () => {
    const dets = guard.detectInText('user@email.com 9876543210');
    const report = guard.generateReport(dets);
    expect(report.rawSensitiveDataTransmitted).toBe(0);
  });

  test('network guard rejects PII payload', () => {
    const result = guard.validatePayloadSafe('user@email.com is the contact');
    expect(result.safe).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  test('network guard accepts clean payload', () => {
    const result = guard.validatePayloadSafe('The user clicked on the search button');
    expect(result.safe).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  test('sensitive count matches redacted count', () => {
    const text = 'email: test@foo.com phone: 9876543210';
    const dets = guard.detectInText(text);
    const report = guard.generateReport(dets);
    expect(report.sensitiveDetected).toBe(report.redacted);
  });
});

describe('RedactionEngine', () => {
  const redactor = new RedactionEngine();
  const guard = new PrivacyGuard();

  test('black_box method replaces with blocks', () => {
    const dets = guard.detectInText('email: test@foo.com');
    const redacted = redactor.redactText('email: test@foo.com', dets, 'black_box');
    expect(redacted).toContain('█');
    expect(redacted).not.toContain('test@foo.com');
  });

  test('semantic method uses placeholder', () => {
    const dets = guard.detectInText('email: test@foo.com');
    const redacted = redactor.redactText('email: test@foo.com', dets, 'semantic');
    expect(redacted).toContain('[REDACTED_EMAIL]');
  });

  test('masking preserves first 2 chars', () => {
    const dets = guard.detectInText('email: test@foo.com');
    const redacted = redactor.redactText('email: test@foo.com', dets, 'masking');
    expect(redacted).toContain('te');
    expect(redacted).toContain('*');
  });
});
