import { parse } from "https://deno.land/std@0.159.0/flags/mod.ts";
import { Compilation } from "./src/compilation.ts";

const args = parse(Deno.args);

if (args["_"].length == 0) {
    // No source file
    console.log("Requires input file path");
    Deno.exit(1);
}

new Compilation().compile(args["_"][0].toString());
