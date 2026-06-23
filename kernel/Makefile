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
	rm -f *.o kernel.bin tomb-os.iso
	rm -rf iso_root

run: kernel.bin
	qemu-system-i386 -kernel kernel.bin -m 3072

iso: kernel.bin
	@mkdir -p iso_root/boot/grub
	@cp kernel.bin iso_root/boot/
	@echo 'set default=0' > iso_root/boot/grub/grub.cfg
	@echo 'set timeout=5' >> iso_root/boot/grub/grub.cfg
	@echo 'menuentry "Tomb OS" {' >> iso_root/boot/grub/grub.cfg
	@echo '    multiboot /boot/kernel.bin' >> iso_root/boot/grub/grub.cfg
	@echo '    boot' >> iso_root/boot/grub/grub.cfg
	@echo '}' >> iso_root/boot/grub/grub.cfg
	@if command -v grub-mkrescue &> /dev/null; then \
		grub-mkrescue -o tomb-os.iso iso_root; \
		echo "[+] ISO compilation successful: tomb-os.iso created."; \
	else \
		echo "[!] Info: 'grub-mkrescue' or 'xorriso' not found on host. Can prepare local structures but cannot package iso."; \
		echo "To resolve: install grub2 package or use UTM/QEMU to boot kernel.bin directly."; \
	fi
	@rm -rf iso_root
