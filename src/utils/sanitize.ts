import DOMPurify from 'isomorphic-dompurify';

export const sanitize = (input: string): string => {
  let sanitized = DOMPurify.sanitize(input);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};
