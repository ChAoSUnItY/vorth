dump:                                   # @dump
        addi    sp, sp, -64
        sw      ra, 60(sp)                      # 4-byte Folded Spill
        sw      s0, 56(sp)                      # 4-byte Folded Spill
        addi    s0, sp, 64
        sw      a1, -12(s0)
        sw      a0, -16(s0)
        li      a0, 0
        sw      a0, -52(s0)
        j       .LBB0_1
.LBB0_1:                                # =>This Inner Loop Header: Depth=1
        lw      a1, -12(s0)
        lw      a0, -16(s0)
        or      a0, a0, a1
        beqz    a0, .LBB0_3
        j       .LBB0_2
.LBB0_2:                                #   in Loop: Header=BB0_1 Depth=1
        lw      a0, -16(s0)
        lw      a1, -12(s0)
        li      a2, 10
        sw      a2, -60(s0)                     # 4-byte Folded Spill
        li      a3, 0
        sw      a3, -56(s0)                     # 4-byte Folded Spill
        call    __umoddi3@plt
        lw      a2, -60(s0)                     # 4-byte Folded Reload
        lw      a3, -56(s0)                     # 4-byte Folded Reload
        ori     a0, a0, 48
        lw      a4, -52(s0)
        addi    a1, s0, -48
        sub     a1, a1, a4
        sb      a0, 31(a1)
        lw      a0, -52(s0)
        addi    a0, a0, 1
        sw      a0, -52(s0)
        lw      a0, -16(s0)
        lw      a1, -12(s0)
        call    __udivdi3@plt
        sw      a1, -12(s0)
        sw      a0, -16(s0)
        j       .LBB0_1
.LBB0_3:
        lw      a2, -52(s0)
        addi    a0, s0, -48
        sub     a0, a0, a2
        addi    a1, a0, 31
        li      a0, 1
        call    write
        lw      ra, 60(sp)                      # 4-byte Folded Reload
        lw      s0, 56(sp)                      # 4-byte Folded Reload
        addi    sp, sp, 64
        ret

