.globl _start

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
    # Dump
    lw      a0, 4(sp)
    call dump
    lw      a0, -16(s0)                     # 4-byte Folded Reload
    lw      ra, 12(sp)                      # 4-byte Folded Reload
    lw      s0, 8(sp)                       # 4-byte Folded Reload
    addi    sp, sp, 16
    ret

dump:                                     # @dump
        addi    sp, sp, -48
        sw      ra, 44(sp)                      # 4-byte Folded Spill
        sw      s0, 40(sp)                      # 4-byte Folded Spill
        addi    s0, sp, 48
        sw      a0, -12(s0)
        li      a0, 1
        sw      a0, -48(s0)
        lw      a1, -48(s0)
        addi    a0, s0, -44
        sub     a1, a0, a1
        li      a0, 10
        sb      a0, 32(a1)
        j       .LBB0_1
.LBB0_1:                                # =>This Inner Loop Header: Depth=1
        lw      a0, -12(s0)
        lui     a1, 419430
        addi    a1, a1, 1639
        mulh    a2, a0, a1
        srli    a3, a2, 31
        srli    a2, a2, 2
        add     a2, a2, a3
        li      a3, 10
        mul     a2, a2, a3
        sub     a0, a0, a2
        addi    a0, a0, 48
        lw      a3, -48(s0)
        addi    a2, s0, -44
        sub     a2, a2, a3
        sb      a0, 31(a2)
        lw      a0, -48(s0)
        addi    a0, a0, 1
        sw      a0, -48(s0)
        lw      a0, -12(s0)
        mulh    a0, a0, a1
        srli    a1, a0, 31
        srai    a0, a0, 2
        add     a0, a0, a1
        sw      a0, -12(s0)
        j       .LBB0_2
.LBB0_2:                                #   in Loop: Header=BB0_1 Depth=1
        lw      a0, -12(s0)
        bnez    a0, .LBB0_1
        j       .LBB0_3
.LBB0_3:
        lw      a2, -48(s0)
        addi    a0, s0, -44
        sub     a0, a0, a2
        addi    a2, a0, 32
        li      a1, 1
        li      a0, 15
        ecall
        lw      ra, 44(sp)                      # 4-byte Folded Reload
        lw      s0, 40(sp)                      # 4-byte Folded Reload
        addi    sp, sp, 48
        ret