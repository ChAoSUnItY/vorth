# vorth
## Experimental Branch - Compact

This Branch is meant to minimize the usage of OOP principles in the implementation code, 
so the further implementation goal such as self hosting can be done without completely rewritten.

## Runtime Strategy

We collects tokens by splitting source with delimeter whitespace, then analysis abstract syntax 
tree structure by iterating whole collection, with checking the control flow. Finally either 
generate an valid RISC-V assembly code based on targeted platform, or simulate the program.
