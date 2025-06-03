import {
  sanitizeText,
  sanitizeTextWithLimit,
  sanitizeEventName,
  sanitizeElementText,
  sanitizeEventProperties,
} from '../text.helper';

describe('Text Helper', () => {
  describe('sanitizeText', () => {
    it('should remove newlines and normalize whitespace', () => {
      expect(sanitizeText('Hello\nWorld')).toBe('Hello World');
      expect(sanitizeText('Hello\r\nWorld')).toBe('Hello World');
      expect(sanitizeText('Hello\tWorld')).toBe('Hello World');
      expect(sanitizeText('Hello   World')).toBe('Hello World');
      expect(sanitizeText('  Hello World  ')).toBe('Hello World');
    });

    it('should handle empty and invalid inputs', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText(null as any)).toBe('');
      expect(sanitizeText(undefined as any)).toBe('');
      expect(sanitizeText(123 as any)).toBe('');
    });

    it('should handle complex whitespace combinations', () => {
      expect(sanitizeText('Hello\n\r\t   World\n\nTest')).toBe('Hello World Test');
      expect(sanitizeText('\n\r\t   ')).toBe('');
    });
  });

  describe('sanitizeTextWithLimit', () => {
    it('should sanitize and limit text length', () => {
      const longText = 'This is a very long text that should be truncated because it exceeds the maximum length limit';
      const result = sanitizeTextWithLimit(longText, 50);
      expect(result).toBe('This is a very long text that should be truncat...');
      expect(result.length).toBe(50);
    });

    it('should not truncate text shorter than limit', () => {
      const shortText = 'Short text';
      expect(sanitizeTextWithLimit(shortText, 50)).toBe('Short text');
    });

    it('should use default limit of 100 characters', () => {
      const longText = 'a'.repeat(150);
      const result = sanitizeTextWithLimit(longText);
      expect(result.length).toBe(100);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle newlines and limit together', () => {
      const textWithNewlines = 'Hello\nWorld\nThis\nis\na\nlong\ntext\nwith\nmany\nlines\nand\nmore\ncontent';
      const result = sanitizeTextWithLimit(textWithNewlines, 30);
      expect(result).toBe('Hello World This is a long...');
    });
  });

  describe('sanitizeEventName', () => {
    it('should sanitize event names and remove special characters', () => {
      expect(sanitizeEventName('Button\nClick!')).toBe('Button Click');
      expect(sanitizeEventName('User@Action#123')).toBe('UserAction123');
      expect(sanitizeEventName('Valid_Event-Name')).toBe('Valid_Event-Name');
    });

    it('should handle empty and invalid inputs', () => {
      expect(sanitizeEventName('')).toBe('');
      expect(sanitizeEventName(null as any)).toBe('');
      expect(sanitizeEventName(undefined as any)).toBe('');
    });

    it('should preserve alphanumeric, hyphens, and underscores', () => {
      expect(sanitizeEventName('Event_Name-123')).toBe('Event_Name-123');
      expect(sanitizeEventName('click_button_action')).toBe('click_button_action');
    });
  });

  describe('sanitizeElementText', () => {
    it('should sanitize element text and apply length limit', () => {
      const mockElement = {
        innerText: 'This is a long button text\nwith newlines\nand multiple lines',
        textContent: 'This is a long button text with newlines and multiple lines',
      } as HTMLElement;

      const result = sanitizeElementText(mockElement);
      expect(result).toBe('This is a long button text with newlines and...');
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should use textContent when specified', () => {
      const mockElement = {
        innerText: 'Inner\nText',
        textContent: 'Text Content',
      } as HTMLElement;

      expect(sanitizeElementText(mockElement, false)).toBe('Inner Text');
      expect(sanitizeElementText(mockElement, true)).toBe('Text Content');
    });

    it('should handle null element', () => {
      expect(sanitizeElementText(null as any)).toBe('');
    });

    it('should handle element with no text', () => {
      const mockElement = {
        innerText: null,
        textContent: null,
      } as any;

      expect(sanitizeElementText(mockElement)).toBe('');
    });
  });

  describe('sanitizeEventProperties', () => {
    it('should sanitize string properties', () => {
      const properties = {
        title: 'Hello\nWorld',
        description: 'Test\r\nDescription',
        count: 123,
      };

      const result = sanitizeEventProperties(properties);
      expect(result).toEqual({
        title: 'Hello World',
        description: 'Test Description',
        count: 123,
      });
    });

    it('should handle nested objects', () => {
      const properties = {
        user: {
          name: 'John\nDoe',
          email: 'john@example.com',
        },
        metadata: {
          source: 'button\nclick',
          level: 2,
        },
      };

      const result = sanitizeEventProperties(properties);
      expect(result).toEqual({
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        metadata: {
          source: 'button click',
          level: 2,
        },
      });
    });

    it('should handle arrays with string elements', () => {
      const properties = {
        tags: ['tag1\nwith\nnewlines', 'tag2', 'tag3\rwith\rcarriage'],
        numbers: [1, 2, 3],
      };

      const result = sanitizeEventProperties(properties);
      expect(result).toEqual({
        tags: ['tag1 with newlines', 'tag2', 'tag3 with carriage'],
        numbers: [1, 2, 3],
      });
    });

    it('should handle null and undefined values', () => {
      const properties = {
        validString: 'Hello\nWorld',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
      };

      const result = sanitizeEventProperties(properties);
      expect(result).toEqual({
        validString: 'Hello World',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
      });
    });

    it('should handle empty and invalid inputs', () => {
      expect(sanitizeEventProperties(null as any)).toEqual({});
      expect(sanitizeEventProperties(undefined as any)).toEqual({});
      expect(sanitizeEventProperties({})).toEqual({});
    });

    it('should preserve non-string, non-object values', () => {
      const properties = {
        boolean: true,
        number: 42,
        date: new Date('2023-01-01'),
        func: () => 'test',
      };

      const result = sanitizeEventProperties(properties);
      expect(result.boolean).toBe(true);
      expect(result.number).toBe(42);
      expect(result.date).toEqual(properties.date);
      expect(result.func).toBe(properties.func);
    });
  });
});