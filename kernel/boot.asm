; Tomb OS Loader - boot.asm
; Compliant with Multiboot 1 specification for GRUB bootloaders

bits 32                         ; We are in 32-bit protected mode

section .multiboot
    align 4
    dd 0x1BADB002               ; Magic number for Multiboot 1
    dd 0x03                     ; Flags: ALIGN + MEMINFO
    dd -(0x1BADB002 + 0x03)     ; Checksum (magic + flags + checksum = 0)

section .text
    global _start
    extern kernel_main          ; Declared in kernel.c

_start:
    cli                         ; Clear interrupts
    mov esp, stack_space        ; Set up stack pointer (ESP)
    call kernel_main            ; Hand execution over to C kernel
    
.halt:
    cli                         ; Clear interrupts again
    hlt                         ; Halt the CPU
    jmp .halt                   ; Infinite fallback loop

section .bss
    align 16
stack_bytes:
    resb 8192                   ; Reserve 8KB of stack memory space
stack_space:
