/**
 * Tanium Query Engine - Lexer/Tokenizer
 * High-performance lexical analyzer for TQL syntax
 */

import { type Token, TokenType, QueryError } from './types';

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  // Keyword mappings (case-insensitive)
  private static readonly KEYWORDS: Map<string, TokenType> = new Map([
    ['get', TokenType.GET],
    ['from', TokenType.FROM],
    ['where', TokenType.WHERE],
    ['with', TokenType.WITH],
    ['group', TokenType.GROUP_BY],
    ['by', TokenType.GROUP_BY],
    ['order', TokenType.ORDER_BY],
    ['limit', TokenType.LIMIT],
    ['and', TokenType.AND],
    ['contains', TokenType.CONTAINS],
    ['does', TokenType.DOES_NOT_CONTAIN],
    ['not', TokenType.DOES_NOT_CONTAIN],
    ['contain', TokenType.DOES_NOT_CONTAIN],
    ['equals', TokenType.EQUALS],
    ['is', TokenType.IS_GREATER_THAN],
    ['greater', TokenType.IS_GREATER_THAN],
    ['less', TokenType.IS_LESS_THAN],
    ['than', TokenType.IS_GREATER_THAN],
    ['starts', TokenType.STARTS_WITH],
    ['ends', TokenType.ENDS_WITH],
    ['count', TokenType.COUNT],
    ['min', TokenType.MIN],
    ['max', TokenType.MAX],
    ['avg', TokenType.AVG],
    ['sum', TokenType.SUM],
  ]);

  // Operator patterns for multi-word operators
  private static readonly OPERATOR_PATTERNS = [
    { pattern: /^does\s+not\s+contain/i, type: TokenType.DOES_NOT_CONTAIN },
    { pattern: /^is\s+greater\s+than/i, type: TokenType.IS_GREATER_THAN },
    { pattern: /^is\s+less\s+than/i, type: TokenType.IS_LESS_THAN },
    { pattern: /^starts\s+with/i, type: TokenType.STARTS_WITH },
    { pattern: /^ends\s+with/i, type: TokenType.ENDS_WITH },
    { pattern: /^group\s+by/i, type: TokenType.GROUP_BY },
    { pattern: /^order\s+by/i, type: TokenType.ORDER_BY },
  ];

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the input string
   */
  public tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (!this.isEOF()) {
      this.skipWhitespace();
      if (this.isEOF()) break;

      const token = this.nextToken();
      if (token.type !== TokenType.UNKNOWN) {
        this.tokens.push(token);
      }
    }

    this.tokens.push(this.createToken(TokenType.EOF, ''));
    return this.tokens;
  }

  /**
   * Get the next token
   */
  private nextToken(): Token {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    // Check for multi-word operators first
    for (const { pattern, type } of Lexer.OPERATOR_PATTERNS) {
      const remaining = this.input.slice(this.position);
      const match = remaining.match(pattern);
      if (match && match.index === 0) {
        const value = match[0];
        this.advance(value.length);
        return this.createTokenAt(type, value, startPos, startLine, startColumn);
      }
    }

    const char = this.peek();

    // String literals
    if (char === '"' || char === "'") {
      return this.readString();
    }

    // Numbers
    if (this.isDigit(char)) {
      return this.readNumber();
    }

    // Identifiers and keywords
    if (this.isAlpha(char)) {
      return this.readIdentifier();
    }

    // Punctuation
    switch (char) {
      case ',':
        this.advance();
        return this.createTokenAt(TokenType.COMMA, ',', startPos, startLine, startColumn);
      case '(':
        this.advance();
        return this.createTokenAt(TokenType.LPAREN, '(', startPos, startLine, startColumn);
      case ')':
        this.advance();
        return this.createTokenAt(TokenType.RPAREN, ')', startPos, startLine, startColumn);
      case '.':
        this.advance();
        return this.createTokenAt(TokenType.DOT, '.', startPos, startLine, startColumn);
      default:
        // Unknown character
        this.advance();
        return this.createTokenAt(TokenType.UNKNOWN, char, startPos, startLine, startColumn);
    }
  }

  /**
   * Read a string literal
   */
  private readString(): Token {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    const quote = this.peek();

    this.advance(); // Skip opening quote
    let value = '';
    let escaped = false;

    while (!this.isEOF() && (escaped || this.peek() !== quote)) {
      const char = this.peek();

      if (escaped) {
        // Handle escape sequences
        switch (char) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case "'": value += "'"; break;
          default: value += char;
        }
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else {
        value += char;
      }

      this.advance();
    }

    if (this.isEOF()) {
      throw new QueryError(
        `Unterminated string literal`,
        startPos,
        startLine,
        startColumn
      );
    }

    this.advance(); // Skip closing quote
    return this.createTokenAt(TokenType.STRING, value, startPos, startLine, startColumn);
  }

  /**
   * Read a number literal
   */
  private readNumber(): Token {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    // Read integer part
    while (!this.isEOF() && this.isDigit(this.peek())) {
      value += this.peek();
      this.advance();
    }

    // Read decimal part if present
    if (!this.isEOF() && this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += this.peek();
      this.advance();

      while (!this.isEOF() && this.isDigit(this.peek())) {
        value += this.peek();
        this.advance();
      }
    }

    return this.createTokenAt(TokenType.NUMBER, value, startPos, startLine, startColumn);
  }

  /**
   * Read an identifier or keyword
   */
  private readIdentifier(): Token {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    // Read identifier characters
    while (!this.isEOF() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === ' ')) {
      const char = this.peek();

      // Check if space is part of a multi-word identifier (e.g., "Computer Name")
      if (char === ' ') {
        const nextChar = this.peek(1);
        if (!nextChar || !this.isAlpha(nextChar)) {
          break;
        }
        // Look ahead to see if this forms a known field name
        const remaining = this.input.slice(this.position);
        const fieldMatch = remaining.match(/^[A-Za-z\s]+/);
        if (fieldMatch && this.isKnownField(fieldMatch[0].trim())) {
          value += char;
          this.advance();
        } else {
          break;
        }
      } else {
        value += char;
        this.advance();
      }
    }

    // Trim and check if it's a keyword
    value = value.trim();
    const lowerValue = value.toLowerCase();
    const keywordType = Lexer.KEYWORDS.get(lowerValue);

    if (keywordType) {
      // Special handling for aggregate functions
      if ([TokenType.COUNT, TokenType.MIN, TokenType.MAX, TokenType.AVG, TokenType.SUM].includes(keywordType)) {
        // Look for parentheses
        this.skipWhitespace();
        if (this.peek() === '(') {
          return this.createTokenAt(keywordType, value, startPos, startLine, startColumn);
        }
      }
      return this.createTokenAt(keywordType, value, startPos, startLine, startColumn);
    }

    return this.createTokenAt(TokenType.IDENTIFIER, value, startPos, startLine, startColumn);
  }

  /**
   * Check if a string is a known field name
   */
  private isKnownField(name: string): boolean {
    const knownFields = [
      'computer name', 'computer role', 'operating system', 'os platform',
      'os version', 'disk free gb', 'memory gb', 'cpu percent',
      'compliance score', 'group name', 'group', 'location',
      'last reboot', 'last seen', 'service status', 'ip address',
      'mac address', 'serial number', 'manufacturer', 'model'
    ];

    return knownFields.includes(name.toLowerCase());
  }

  /**
   * Skip whitespace characters
   */
  private skipWhitespace(): void {
    while (!this.isEOF() && this.isWhitespace(this.peek())) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  /**
   * Character classification methods
   */
  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char);
  }

  /**
   * Peek at character(s) without advancing
   */
  private peek(offset: number = 0): string {
    const pos = this.position + offset;
    if (pos >= this.input.length) {
      return '\0';
    }
    return this.input[pos];
  }

  /**
   * Advance position by n characters
   */
  private advance(count: number = 1): void {
    for (let i = 0; i < count; i++) {
      if (this.position < this.input.length) {
        if (this.input[this.position] === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        this.position++;
      }
    }
  }

  /**
   * Check if at end of input
   */
  private isEOF(): boolean {
    return this.position >= this.input.length;
  }

  /**
   * Create a token at current position
   */
  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      position: this.position,
      line: this.line,
      column: this.column
    };
  }

  /**
   * Create a token at specific position
   */
  private createTokenAt(
    type: TokenType,
    value: string,
    position: number,
    line: number,
    column: number
  ): Token {
    return {
      type,
      value,
      position,
      line,
      column
    };
  }

  /**
   * Get all tokens (for debugging)
   */
  public getTokens(): Token[] {
    return this.tokens;
  }

  /**
   * Get formatted token list (for debugging)
   */
  public formatTokens(): string {
    return this.tokens
      .map(t => `${t.type}(${t.value}) @ ${t.line}:${t.column}`)
      .join('\n');
  }
}

// Export factory function for convenience
export function tokenize(input: string): Token[] {
  const lexer = new Lexer(input);
  return lexer.tokenize();
}