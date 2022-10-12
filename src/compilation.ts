export class Parser {
    // File Lexing
    private findCol(line: string, start: number, predicate: (input: string) => boolean): number {
        while (start < line.length && !predicate(line[start]))
            start++;
        return start;
    }

    private lexLine(line: string): [number, string][] {
        const whitespaceReg = /\s/;
        const tokens: [number, string][] = [];

        let col = this.findCol(line, 0, s => !whitespaceReg.test(s));
        while (col < line.length) {
            const col_end = this.findCol(line, col, s => whitespaceReg.test(s));
            tokens.push([col, line.substring(col, col_end)]);
            col = this.findCol(line, col_end, s => !whitespaceReg.test(s));
        }

        return tokens;
    }

    private lexFile(fileName: string, source: string): [string, number, number, string][] {
        const lines = source.split(/\r?\n/);
        const tokens: [string, number, number, string][] = [];

        for (const [lineNumber, line] of lines.entries()) {
            for (const [offset, literal] of this.lexLine(line)) {
                tokens.push([fileName, lineNumber, offset, literal]);
            }
        }
        
        return tokens;
    }

    // Token transform

    private parseToken(token: [string, number, number, string]): Token {
        const literal = token[3];
        switch (literal) {
            case "+": {
                return [TokenType.Plus, null];
            }
            case "-": {
                return [TokenType.Minus, null];
            }
            case "->": {
                return [TokenType.Dump, null];
            }
            case "=": {
                return [TokenType.Eq, null];
            }
            case "!": {
                return [TokenType.Neg, null];
            }
            case "if": {
                return [TokenType.If, null];
            }
            case "else": {
                return [TokenType.Else, null];
            }
            case "end": {
                return [TokenType.End, null];
            }
            default: {
                return [TokenType.Int, literal];
            }
        }
    }

    compile(filePath: string): Token[] {
        const source = Deno.readTextFileSync(filePath);
        const tokens = this.lexFile(filePath, source);
        const tokenStream = tokens.map(t => this.parseToken(t));

        return tokenStream;
    }
}

type StackItem = number | string;

export class Simulator {
    private readonly _tokens: Token[];

    constructor(tokens: Token[]) {
        this._tokens = tokens;
    }

    run() {
        const stack: StackItem[] = [];

        for (const [token, val] of this._tokens) {
            switch (token) {
                case TokenType.Int: {
                    stack.push(+val!);
                    break;
                }
                case TokenType.Plus: {
                    const v1 = +stack.pop()!;
                    const v2 = +stack.pop()!;
                    stack.push(v2 + v1);
                    break;
                }
                case TokenType.Minus: {
                    const v1 = +stack.pop()!;
                    const v2 = +stack.pop()!;
                    stack.push(v2 - v1);
                    break;
                }
                case TokenType.Dump: {
                    const v = stack.pop();
                    console.log(v);
                    break;
                }
            }
        }
    }
}

export class Gen {
    private readonly _stackChain = new StackChain();
    private readonly _tokens: Token[];
    private readonly _platformTarget: PlatformTarget;
    private readonly _crossRef: boolean;
    
    // Builders
    private _dataBuilder = '';
    private _globalBuilder = '';
    private _predefBuilder = '';
    private _procBuilder = '';

    constructor(tokens: Token[], platformTarget: PlatformTarget, crossRef: boolean) {
        this._tokens = tokens;
        this._platformTarget = platformTarget;
        this._crossRef = crossRef;
    }

    gen(): string {
        this.genEntry();
        this._dataBuilder += this.genData();
        this.genTokens();
        
        return this._dataBuilder + this._globalBuilder + this._predefBuilder + this._procBuilder;
    }

    private genTokens() {
        let procBuilder = '';
        
        for (const token of this._tokens) {
            switch (token[0]) {
                case TokenType.Int: {
                    this._stackChain.push(4);
                    procBuilder += `    # Push\n`;
                    procBuilder += `    li      a0, ${token[1]}\n`;
                    procBuilder += `    sw      a0, ${this._stackChain.stackOffset}(sp)\n`;
                    break;
                }
                case TokenType.Plus: {
                    let offset = this._stackChain.stackOffset;
                    this._stackChain.pop(4);
                    procBuilder += `    # Add\n`;
                    procBuilder += `    lw      a0, ${offset}(sp)\n`;
                    procBuilder += `    lw      a1, ${offset -= 4}(sp)\n`;
                    procBuilder += `    add     a0, a0, a1\n`;
                    procBuilder += `    sw      a0, ${offset}(sp)\n`;
                    break;
                }
                case TokenType.Minus: {
                    let offset = this._stackChain.stackOffset;
                    this._stackChain.pop(4);
                    procBuilder += `    # Sub\n`;
                    procBuilder += `    lw      a0, ${offset}(sp)\n`;
                    procBuilder += `    lw      a1, ${offset -= 4}(sp)\n`;
                    procBuilder += `    sub     a0, a0, a1\n`;
                    procBuilder += `    sw      a0, ${offset}(sp)\n`;
                    break;
                }
                case TokenType.Eq: {
                    let offset = this._stackChain.stackOffset;
                    this._stackChain.pop(4);
                    procBuilder += `    # Eq\n`;
                    procBuilder += `    lw      a0, ${offset}(sp)\n`;
                    procBuilder += `    lw      a1, ${offset -= 4}(sp)\n`;
                    procBuilder += `    xor     a0, a0, a1\n`;
                    procBuilder += `    seqz    a0, a0\n`;
                    procBuilder += `    sw      a0, ${offset}(sp)\n`;
                    break;
                }
                case TokenType.Neg: {
                    const offset = this._stackChain.stackOffset;
                    procBuilder += `    # Neg\n`;
                    procBuilder += `    lw      a0, ${offset}(sp)\n`;
                    procBuilder += `    seqz    a0, a0\n`;
                    procBuilder += `    sw      a0, ${offset}(sp)\n`;
                    break;
                }
                case TokenType.Dump: {
                    const offset = this._stackChain.stackOffset;
                    this._stackChain.pop(4);
                    procBuilder += `    # Dump\n`;

                    switch (this._platformTarget) {
                        case PlatformTarget.Linux: {
                            procBuilder += `    lw      a0, ${offset}(sp)\n`;
                            procBuilder += `    call dump\n`;
                            break;
                        }
                        case PlatformTarget.Venus: {
                            procBuilder += `    li      a0, 1\n`;
                            procBuilder += `    lw      a1, ${offset}(sp)\n`;
                            procBuilder += `    ecall\n`;
                            procBuilder += `    li      a0, 4\n`;
                            procBuilder += `    la      a1, nl\n`;
                            procBuilder += `    ecall\n`;
                            break;
                        }
                    }

                    break;
                }
            }
        }

        procBuilder = this.postGenProc() + procBuilder;
        this._procBuilder += procBuilder;
    }

    private genEntry() {
        switch (this._platformTarget) {
            case PlatformTarget.Venus: {
                this._predefBuilder += Deno.readTextFileSync('template/venus.S');
                this._globalBuilder += '.globl _start\n\n.text\n';
                break;
            }
            case PlatformTarget.Linux: {
                this._predefBuilder += Deno.readTextFileSync('template/linux.S');
                this._globalBuilder += '.global _start\n\n.text\n';
                break;
            }
        }
    }

    private genData(): string {
        switch (this._platformTarget) {
            case PlatformTarget.Linux: {
                return ``;
            }
            case PlatformTarget.Venus: {
                return `.data\n    nl:     .asciiz "\\n"\n`;
            }
        }
    }

    private postGenProc(): string {
        return `_start:\n    addi    sp, sp, -${this._stackChain.maxStackSize}\n`;
    }
}

export enum PlatformTarget {
    Venus = "venus",
    Linux = "linux"
}

enum TokenType {
    Int,
    Dump,
    Plus,
    Minus,
    Eq,
    Neg,
    If,
    Else,
    End
}

type Token = [TokenType, string | null]

class StackChain {
    stackOffset = 0;
    maxStackSize = 0;

    push(size: number) {
        this.maxStackSize = Math.max(this.maxStackSize, this.stackOffset += size);
    }

    pop(size: number) {
        this.stackOffset -= size;
    }
}
