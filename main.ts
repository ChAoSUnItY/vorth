import { parse } from "https://deno.land/std@0.159.0/flags/mod.ts";
import { Gen, Parser, Simulator } from "./src/compilation.ts";

const args = parse(Deno.args);

if (args["_"].length == 0) {
    // No source file
    console.log("Requires input file path");
    Deno.exit(1);
}

const taskName = args["_"][0].toString();

switch (taskName) {
    case "compile": {
        const sourceFile = args["_"][1].toString();
        const outputFile = args["o"] ?? `output.S`;

        const tokens = new Parser().compile(sourceFile);
        const gen = new Gen(tokens);
        const result = gen.gen();

        Deno.writeTextFileSync(outputFile, result);
        // TODO: Code gen
        break;
    }
    case "run": {
        const sourceFile = args["_"][1].toString();
        const tokens = new Parser().compile(sourceFile);
        const sim = new Simulator(tokens);
        sim.run();
        break;
    }
    case "help": {
        console.log(`Vorth CLI commands:`);
        console.log(`[+]  - compile`);
        console.log(`[:]      - Compiles source file into RISC V assembly`);
        console.log(`[+]  - run`);
        console.log(`[:]      - Runs source file under simulation mode`);
        break;
    }
    default: {
        console.error(`Unknown command \`${taskName}\``);
        break;
    }
}
