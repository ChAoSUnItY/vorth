.globl _start

_start:
    addi    sp, sp, -8
    # Push
    li      a0, 123
    sw      a0, -4(sp)
    # Push
    li      a0, 32
    sw      a0, -8(sp)
    # Add
    lw      a0, 8(sp)
    lw      a1, 4(sp)
    add     a0, a0, a1
    sw      a0, 4(sp)
