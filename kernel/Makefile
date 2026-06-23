# Tomb OS Kernel Compilation Rules - Makefile

# Compiler configurations
CC = i386-elf-gcc
LD = i386-elf-ld
ASM = nasm

# Determine if cross-compiler is present; fallback to standard host compilers if missing
ifeq (, $(shell which i386-elf-gcc))
    CC = gcc
    LD = ld
    CFLAGS = -m32 -ffreestanding -O2 -Wall -Wextra -fno-pie -fno-stack-protector -fno-asynchronous-unwind-tables -nostdlib
    LDFLAGS = -m elf_i386 -T linker.ld -nostdlib
else
    CFLAGS = -ffreestanding -O2 -Wall -Wextra -fno-pie -fno-stack-protector -fno-asynchronous-unwind-tables -nostdlib
    LDFLAGS = -T linker.ld -nostdlib
endif

all: kernel.bin

boot.o: boot.asm
	$(ASM) -f elf32 boot.asm -o boot.o

kernel.o: kernel.c
	$(CC) $(CFLAGS) -c kernel.c -o kernel.o

kernel.bin: linker.ld boot.o kernel.o
	$(LD) $(LDFLAGS) boot.o kernel.o -o kernel.bin

clean:
	rm -f *.o kernel.bin

run: kernel.bin
	qemu-system-i386 -kernel kernel.bin
