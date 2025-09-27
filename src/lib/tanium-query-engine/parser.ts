/**
 * Tanium Query Engine - Parser
 * Recursive descent parser with AST generation
 */

import {
  Token,
  TokenType,
  QueryNode,
  SelectNode,
  FromNode,
  WhereNode,
  GroupByNode,
  OrderByNode,
  LimitNode,
  ColumnNode,
  AggregateNode,
  FilterNode,
  ScopeNode,
  FilterOperator,
  ParseError,
  ParserOptions,
  SourceLocation
} from './types';
import { Lexer } from './lexer';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      strictMode: false,
      allowPartialQueries: false,
      maxDepth: 100,
      validateSemantics: true,
      ...options
    };
  }

  /**
   * Parse a query string into an AST
   */
  public parse(input: string): QueryNode {
    // Tokenize input
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
    this.current = 0;

    // Parse query
    const query = this.parseQuery();

    // Validate semantics if enabled
    if (this.options.validateSemantics) {
      this.validateQuery(query);
    }

    return query;
  }

  /**
   * Parse main query structure
   * Query ::= GET SelectList FROM Scope [WHERE Filters] [GROUP BY Columns] [ORDER BY Columns] [LIMIT Number]
   */
  private parseQuery(): QueryNode {
    const startToken = this.peek();

    // Expect GET keyword
    if (!this.match(TokenType.GET)) {
      throw new ParseError('Query must start with "Get"', this.peek());
    }

    // Parse SELECT clause
    const select = this.parseSelect();

    // Expect FROM keyword
    if (!this.match(TokenType.FROM)) {
      throw new ParseError('Expected "from" after column list', this.peek());
    }

    // Parse FROM clause
    const from = this.parseFrom();

    // Parse optional clauses
    let where: WhereNode | undefined;
    let groupBy: GroupByNode | undefined;
    let orderBy: OrderByNode | undefined;
    let limit: LimitNode | undefined;

    // Parse WHERE/WITH clause
    if (this.match(TokenType.WHERE) || this.match(TokenType.WITH)) {
      where = this.parseWhere();
    }

    // Parse GROUP BY clause
    if (this.matchSequence([TokenType.GROUP_BY]) ||
        (this.check(TokenType.IDENTIFIER) && this.peekValue()?.toLowerCase() === 'group')) {
      groupBy = this.parseGroupBy();
    }

    // Parse ORDER BY clause
    if (this.matchSequence([TokenType.ORDER_BY]) ||
        (this.check(TokenType.IDENTIFIER) && this.peekValue()?.toLowerCase() === 'order')) {
      orderBy = this.parseOrderBy();
    }

    // Parse LIMIT clause
    if (this.match(TokenType.LIMIT)) {
      limit = this.parseLimit();
    }

    // Create query node
    return {
      type: 'Query',
      select,
      from,
      where,
      groupBy,
      orderBy,
      limit,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse SELECT clause
   */
  private parseSelect(): SelectNode {
    const startToken = this.peek();
    const columns: ColumnNode[] = [];
    const aggregates: AggregateNode[] = [];

    do {
      // Check for aggregate functions
      if (this.checkAggregate()) {
        aggregates.push(this.parseAggregate());
      } else {
        // Parse column name
        const column = this.parseColumn();
        if (column) {
          columns.push(column);
        }
      }
    } while (this.match(TokenType.COMMA) ||
             (this.check(TokenType.IDENTIFIER) &&
              this.peekValue()?.toLowerCase() === 'and' &&
              !this.checkAhead(TokenType.FROM)));

    // If only aggregates and no columns, that's valid
    if (columns.length === 0 && aggregates.length === 0) {
      throw new ParseError('Expected at least one column or aggregate', this.peek());
    }

    return {
      type: 'Select',
      columns,
      aggregates,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse column reference
   */
  private parseColumn(): ColumnNode | null {
    const startToken = this.peek();

    // Handle multi-word column names
    let columnName = '';
    while (this.check(TokenType.IDENTIFIER)) {
      if (columnName) columnName += ' ';
      columnName += this.advance().value;

      // Check if next token continues the column name
      if (!this.checkColumnContinuation()) {
        break;
      }
    }

    if (!columnName) {
      return null;
    }

    return {
      type: 'Column',
      name: columnName,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse aggregate function
   */
  private parseAggregate(): AggregateNode {
    const startToken = this.peek();
    let func: AggregateNode['function'];

    // Get aggregate function
    const token = this.advance();
    switch (token.type) {
      case TokenType.COUNT:
        func = 'count';
        break;
      case TokenType.MIN:
        func = 'min';
        break;
      case TokenType.MAX:
        func = 'max';
        break;
      case TokenType.AVG:
        func = 'avg';
        break;
      case TokenType.SUM:
        func = 'sum';
        break;
      default:
        throw new ParseError(`Unknown aggregate function: ${token.value}`, token);
    }

    // Parse optional column argument
    let column: string | undefined;
    if (this.match(TokenType.LPAREN)) {
      if (!this.check(TokenType.RPAREN)) {
        const col = this.parseColumn();
        if (col) {
          column = col.name;
        }
      }
      this.consume(TokenType.RPAREN, 'Expected closing parenthesis');
    }

    return {
      type: 'Aggregate',
      function: func,
      column,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse FROM clause
   */
  private parseFrom(): FromNode {
    const startToken = this.peek();
    const scope = this.parseScope();

    return {
      type: 'From',
      scope,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse scope (all machines, group, etc.)
   */
  private parseScope(): ScopeNode {
    const startToken = this.peek();

    // Check for "all machines"
    if (this.check(TokenType.IDENTIFIER)) {
      const value = this.peekValue()?.toLowerCase();
      if (value === 'all') {
        this.advance();
        if (this.check(TokenType.IDENTIFIER) &&
            this.peekValue()?.toLowerCase() === 'machines') {
          this.advance();
        }
        return {
          type: 'Scope',
          scopeType: 'all',
          location: this.createLocation(startToken, this.previous())
        };
      }

      // Check for "group <name>"
      if (value === 'group') {
        this.advance();
        let groupName = '';

        // Handle quoted group name
        if (this.check(TokenType.STRING)) {
          groupName = this.advance().value;
        } else {
          // Handle unquoted group name
          while (this.check(TokenType.IDENTIFIER)) {
            if (groupName) groupName += ' ';
            groupName += this.advance().value;
            if (!this.checkGroupNameContinuation()) {
              break;
            }
          }
        }

        return {
          type: 'Scope',
          scopeType: 'group',
          value: groupName,
          location: this.createLocation(startToken, this.previous())
        };
      }
    }

    // Default to "all"
    return {
      type: 'Scope',
      scopeType: 'all',
      location: this.createLocation(startToken, startToken)
    };
  }

  /**
   * Parse WHERE clause
   */
  private parseWhere(): WhereNode {
    const startToken = this.previous();
    const filters: FilterNode[] = [];

    do {
      filters.push(this.parseFilter());
    } while (this.match(TokenType.AND));

    return {
      type: 'Where',
      filters,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse filter expression
   */
  private parseFilter(): FilterNode {
    const startToken = this.peek();

    // Parse field name
    const field = this.parseColumn();
    if (!field) {
      throw new ParseError('Expected field name in filter', this.peek());
    }

    // Parse operator
    const operator = this.parseOperator();

    // Parse value
    let value: string | number;
    if (this.check(TokenType.STRING)) {
      value = this.advance().value;
    } else if (this.check(TokenType.NUMBER)) {
      value = parseFloat(this.advance().value);
    } else {
      // Try to read unquoted string
      let stringValue = '';
      while (this.check(TokenType.IDENTIFIER)) {
        if (stringValue) stringValue += ' ';
        stringValue += this.advance().value;
        if (!this.checkFilterValueContinuation()) {
          break;
        }
      }
      value = stringValue;
    }

    return {
      type: 'Filter',
      field: field.name,
      operator,
      value,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse filter operator
   */
  private parseOperator(): FilterOperator {
    if (this.match(TokenType.CONTAINS)) {
      return 'contains';
    }
    if (this.match(TokenType.DOES_NOT_CONTAIN)) {
      return 'does_not_contain';
    }
    if (this.match(TokenType.EQUALS)) {
      return 'equals';
    }
    if (this.match(TokenType.IS_GREATER_THAN)) {
      return 'greater_than';
    }
    if (this.match(TokenType.IS_LESS_THAN)) {
      return 'less_than';
    }
    if (this.match(TokenType.STARTS_WITH)) {
      return 'starts_with';
    }
    if (this.match(TokenType.ENDS_WITH)) {
      return 'ends_with';
    }

    throw new ParseError('Expected comparison operator', this.peek());
  }

  /**
   * Parse GROUP BY clause
   */
  private parseGroupBy(): GroupByNode {
    const startToken = this.peek();

    // Consume "group by"
    if (this.check(TokenType.IDENTIFIER) && this.peekValue()?.toLowerCase() === 'group') {
      this.advance();
      if (this.check(TokenType.IDENTIFIER) && this.peekValue()?.toLowerCase() === 'by') {
        this.advance();
      }
    } else if (this.check(TokenType.GROUP_BY)) {
      this.advance();
    }

    const columns: string[] = [];
    do {
      const col = this.parseColumn();
      if (col) {
        columns.push(col.name);
      }
    } while (this.match(TokenType.COMMA));

    return {
      type: 'GroupBy',
      columns,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse ORDER BY clause
   */
  private parseOrderBy(): OrderByNode {
    const startToken = this.peek();

    // Consume "order by"
    if (this.check(TokenType.IDENTIFIER) && this.peekValue()?.toLowerCase() === 'order') {
      this.advance();
      if (this.check(TokenType.IDENTIFIER) && this.peekValue()?.toLowerCase() === 'by') {
        this.advance();
      }
    } else if (this.check(TokenType.ORDER_BY)) {
      this.advance();
    }

    const columns: OrderByNode['columns'] = [];
    do {
      const col = this.parseColumn();
      if (col) {
        let direction: 'asc' | 'desc' = 'asc';

        // Check for ASC/DESC
        if (this.check(TokenType.IDENTIFIER)) {
          const dir = this.peekValue()?.toLowerCase();
          if (dir === 'asc' || dir === 'desc') {
            direction = dir as 'asc' | 'desc';
            this.advance();
          }
        }

        columns.push({
          column: col.name,
          direction
        });
      }
    } while (this.match(TokenType.COMMA));

    return {
      type: 'OrderBy',
      columns,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Parse LIMIT clause
   */
  private parseLimit(): LimitNode {
    const startToken = this.previous();

    if (!this.check(TokenType.NUMBER)) {
      throw new ParseError('Expected number after LIMIT', this.peek());
    }

    const value = parseInt(this.advance().value);

    return {
      type: 'Limit',
      value,
      location: this.createLocation(startToken, this.previous())
    };
  }

  /**
   * Validate query semantics
   */
  private validateQuery(query: QueryNode): void {
    // Validate GROUP BY columns are in SELECT
    if (query.groupBy) {
      for (const groupCol of query.groupBy.columns) {
        const inSelect = query.select.columns.some(c => c.name === groupCol);
        if (!inSelect && query.select.aggregates.length === 0) {
          throw new ParseError(`GROUP BY column "${groupCol}" must appear in SELECT clause`);
        }
      }
    }

    // Validate ORDER BY columns
    if (query.orderBy) {
      for (const orderCol of query.orderBy.columns) {
        const inSelect = query.select.columns.some(c => c.name === orderCol.column);
        const inGroup = query.groupBy?.columns.includes(orderCol.column);
        if (!inSelect && !inGroup) {
          throw new ParseError(`ORDER BY column "${orderCol.column}" must appear in SELECT or GROUP BY clause`);
        }
      }
    }
  }

  /**
   * Token matching helpers
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkAggregate(): boolean {
    return [
      TokenType.COUNT,
      TokenType.MIN,
      TokenType.MAX,
      TokenType.AVG,
      TokenType.SUM
    ].includes(this.peek().type);
  }

  private checkAhead(type: TokenType, offset: number = 1): boolean {
    const pos = this.current + offset;
    if (pos >= this.tokens.length) return false;
    return this.tokens[pos].type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private matchSequence(types: TokenType[]): boolean {
    for (let i = 0; i < types.length; i++) {
      if (!this.checkAhead(types[i], i)) {
        return false;
      }
    }
    // Consume all tokens
    for (let i = 0; i < types.length; i++) {
      this.advance();
    }
    return true;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new ParseError(message, this.peek());
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekValue(): string | undefined {
    return this.tokens[this.current]?.value;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Continuation checks for multi-word tokens
   */
  private checkColumnContinuation(): boolean {
    // Don't continue if we hit keywords or operators
    const stopTokens = [
      TokenType.FROM, TokenType.WHERE, TokenType.WITH,
      TokenType.GROUP_BY, TokenType.ORDER_BY, TokenType.LIMIT,
      TokenType.AND, TokenType.COMMA
    ];
    return !stopTokens.includes(this.peek().type);
  }

  private checkGroupNameContinuation(): boolean {
    const stopTokens = [
      TokenType.WHERE, TokenType.WITH, TokenType.GROUP_BY,
      TokenType.ORDER_BY, TokenType.LIMIT
    ];
    return !stopTokens.includes(this.peek().type);
  }

  private checkFilterValueContinuation(): boolean {
    const stopTokens = [
      TokenType.AND, TokenType.GROUP_BY, TokenType.ORDER_BY,
      TokenType.LIMIT, TokenType.EOF
    ];
    return !stopTokens.includes(this.peek().type);
  }

  /**
   * Create source location from tokens
   */
  private createLocation(start: Token, end: Token): SourceLocation {
    return {
      start: start.position,
      end: end.position + end.value.length,
      line: start.line,
      column: start.column
    };
  }
}

// Export factory function
export function parse(input: string, options?: ParserOptions): QueryNode {
  const parser = new Parser(options);
  return parser.parse(input);
}