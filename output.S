.data
    nl:     .asciiz "\n"
.globl _start

.text
_start:
    addi    sp, sp, -8
    # Push
    li      a0, 123
    sw      a0, 4(sp)
    # Push
    li      a0, 32
    sw      a0, 8(sp)
    # Add
    lw      a0, 8(sp)
    lw      a1, 4(sp)
    add     a0, a0, a1
    sw      a0, 4(sp)
    # Push
    li      a0, 155
    sw      a0, 8(sp)
    # Eq
    lw      a0, 8(sp)
    lw      a1, 4(sp)
    xor     a0, a0, a1
    seqz    a0, a0
    sw      a0, 4(sp)
    # Neg
    lw      a0, 4(sp)
    seqz    a0, a0
    sw      a0, 4(sp)
    # Dump
    li      a0, 1
    lw      a1, 4(sp)
    ecall
    li      a0, 4
    la      a1, nl
    ecall
