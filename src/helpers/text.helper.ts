/**
 * Text sanitization utilities for telemetry events
 */

/**
 * Sanitizes text by removing newlines and normalizing whitespace
 * @param text - The text to sanitize
 * @returns Sanitized text with normalized whitespace
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\n/g, ' ')        // Replace newlines with spaces
    .replace(/\r/g, ' ')        // Replace carriage returns with spaces
    .replace(/\t/g, ' ')        // Replace tabs with spaces
    .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
    .trim();                    // Remove leading/trailing whitespace
};

/**
 * Sanitizes text with length limit
 * @param text - The text to sanitize
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized and truncated text
 */
export const sanitizeTextWithLimit = (text: string, maxLength: number = 100): string => {
  const sanitized = sanitizeText(text);
  
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  
  return sanitized.substring(0, maxLength - 3) + '...';
};

/**
 * Sanitizes event name by removing special characters and normalizing text
 * @param eventName - The event name to sanitize
 * @returns Sanitized event name safe for tracking
 */
export const sanitizeEventName = (eventName: string): string => {
  if (!eventName || typeof eventName !== 'string') {
    return '';
  }

  return eventName
    .replace(/\n/g, ' ')        // Replace newlines with spaces
    .replace(/\r/g, ' ')        // Replace carriage returns with spaces
    .replace(/\t/g, ' ')        // Replace tabs with spaces
    .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
    .replace(/[^\w\s\-_]/g, '') // Remove special characters except hyphens and underscores
    .trim();                    // Remove leading/trailing whitespace
};

/**
 * Sanitizes element text content for auto-capture events
 * @param element - The HTML element to extract text from
 * @param useTextContent - Whether to use textContent instead of innerText
 * @returns Sanitized text content
 */
export const sanitizeElementText = (element: HTMLElement, useTextContent: boolean = false): string => {
  if (!element) {
    return '';
  }

  const text = useTextContent ? element.textContent : element.innerText;
  return sanitizeTextWithLimit(text || '', 50); // Limit element text to 50 characters
};

/**
 * Sanitizes event properties by cleaning string values
 * @param properties - The event properties object to sanitize
 * @returns Sanitized properties object
 */
export const sanitizeEventProperties = (properties: Record<string, any>): Record<string, any> => {
  if (!properties || typeof properties !== 'object') {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeEventProperties(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};