export class Compilation {
    private _stackChain = new StackChain();

    private findCol(line: string, start: number, predicate: (input: string) => boolean): number {
        while (start < line.length && !predicate(line[start]))
            start++;
        return start;
    }

    private lexLine(line: string): [number, string][] {
        let tokens: [number, string][] = [];

        let col = this.findCol(line, 0, s => /\w/.test(s));
        while (col < line.length) {
            let col_end = this.findCol(line, col, s => !/\w/.test(s));
            tokens.push([col, line.substring(col, col_end)]);
            col = this.findCol(line, col_end, s => /\w/.test(s));
        }

        return tokens;
    }

    compile(filePath: string) {
        Deno.readTextFileSync(filePath).split(/\r?\n/); // TODO
    }
}

enum TokenType {
    Int,
    Add,
    Minus
}

class StackChain {
    public stackOffset: number = 0;
    public maxStackSize: number = 0;
}
