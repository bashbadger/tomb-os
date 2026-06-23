/* Tomb OS Linker Script - linker.ld */
ENTRY(_start)
OUTPUT_FORMAT(elf32-i386)
OUTPUT_ARCH(i386)

SECTIONS
{
    /* The bootloader will look for the kernel at physical address 1MB */
    . = 1M;

    /* First put the multiboot header, as it is required to be in the first 8KB of the ELF file */
    .text : ALIGN(4K)
    {
        *(.multiboot)
        *(.text)
    }

    /* Read-only data */
    .rodata : ALIGN(4K)
    {
        *(.rodata)
    }

    /* Read-write data (initialized) */
    .data : ALIGN(4K)
    {
        *(.data)
    }

    /* Read-write data (uninitialized) and stack */
    .bss : ALIGN(4K)
    {
        *(COMMON)
        *(.bss)
    }
}
