export class Compilation {
    private _stackChain = new StackChain();

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
            default: {
                return [TokenType.Int, literal];
            }
        }
    }

    compile(filePath: string) {
        const source = Deno.readTextFileSync(filePath);
        const tokens = this.lexFile(filePath, source);
        const tokenStream = tokens.map(t => this.parseToken(t));

        console.log(tokenStream);
    }
}

enum TokenType {
    Int,
    Plus,
    Minus
}

type Token = [TokenType, string | null]

class StackChain {
    public stackOffset: number = 0;
    public maxStackSize: number = 0;
}
