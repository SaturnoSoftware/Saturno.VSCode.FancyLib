// -------------------------------------------------------------------------- //
//                               *       +                                    //
//                         '                  |                               //
//                     ()    .-.,="``"=.    - o -                             //
//                           '=/_       \\     |                              //
//                        *   |  '=._    |                                    //
//                             \\     `=./`,        '                         //
//                          .   '=.__.=' `='      *                           //
//                                                                            //
//                                                                            //
// File      : Redaction.ts                                                   //
// Project   : Saturno.VSCode.FancyLib                                        //
// Date      : 2026-09-15                                                     //
// Copyright : Saturno Software - 2026                                        //
// Author    : mateusdigital <hello@mateus.digital>                           //
// -------------------------------------------------------------------------- //
// SPDX-License-Identifier: GPL-3.0-only

/**
 * VSCODEKIT-0018 / FBR-01: user-selected text is opt-in evidence, never
 * verbatim. Every string that reaches the renderer from EvidenceSelection
 * goes through here first - truncated, then scanned for common secret
 * shapes, each replaced with a labeled placeholder so a reviewer can see
 * that something was removed without seeing what.
 *
 * This is a best-effort net, not a security boundary: it catches shapes
 * that look like a token or key, not every possible secret. The real
 * control is capture being opt-in at all (Types.ts's EvidenceSelection).
 */

// -----------------------------------------------------------------------------
export const MAX_EVIDENCE_LENGTH = 4000;

// -----------------------------------------------------------------------------
export const TRUNCATION_MARKER = "\n\n[... truncated, evidence exceeded the length limit ...]";

/**
 * Ordered so a more specific pattern (AWS access key) is tried before a
 * generic one (long base64-ish run) that would otherwise swallow it first
 * and produce a less useful label.
 */
// -----------------------------------------------------------------------------
const SECRET_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "aws-access-key-id", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { label: "github-token", pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
  { label: "openai-key", pattern: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { label: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { label: "private-key-block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g },
  { label: "bearer-token", pattern: /\bBearer\s+[A-Za-z0-9._-]{20,}\b/g },
  {
    label: "assignment-secret",
    pattern: /\b((?:api[_-]?key|secret|token|password|passwd)\s*[:=]\s*)["']?[A-Za-z0-9._-]{8,}["']?/gi,
  },
];

// -----------------------------------------------------------------------------
export function truncateEvidence(text: string, maxLength: number = MAX_EVIDENCE_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + TRUNCATION_MARKER;
}

/**
 * Replaces every recognized secret shape with `[REDACTED:<label>]`. Runs
 * after truncation so a secret split exactly at the truncation boundary is
 * simply cut, not half-redacted - truncateEvidence must be called first.
 */
// -----------------------------------------------------------------------------
export function redactSecrets(text: string): string {
  let result = text;
  for (const { label, pattern } of SECRET_PATTERNS) {
    result = result.replace(pattern, (match) => {
      if (label === "assignment-secret") {
        const keyPart = match.match(/^[^:=]*[:=]\s*/);
        const prefix = keyPart ? keyPart[0] : "";
        return `${prefix}[REDACTED:${label}]`;
      }
      return `[REDACTED:${label}]`;
    });
  }
  return result;
}

/** Truncate, then redact - the composed pipeline every evidence string goes
 *  through before it reaches the renderer. */
// -----------------------------------------------------------------------------
export function sanitizeEvidence(text: string, maxLength: number = MAX_EVIDENCE_LENGTH): string {
  return redactSecrets(truncateEvidence(text, maxLength));
}
