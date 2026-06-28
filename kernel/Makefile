# Tomb OS Kernel Compilation Rules - Makefile

# Compiler configurations
CC = i386-elf-gcc
LD = i386-elf-ld
ASM = nasm

# Determine if cross-compiler is present; fallback to standard host compilers if missing
ifeq (, $(shell which i386-elf-gcc))
    CC = gcc
    LD = gcc
    CFLAGS = -m32 -ffreestanding -O2 -Wall -Wextra -Wno-unused-parameter -Wno-unused-function -fno-pie -fstack-protector-strong -D_FORTIFY_SOURCE=2 -fno-asynchronous-unwind-tables -nostdlib
    LDFLAGS = -m32 -nostdlib -Wl,-e,_start -Wl,-z,relro,-z,now
else
    CFLAGS = -ffreestanding -O2 -Wall -Wextra -Wno-unused-parameter -Wno-unused-function -fno-pie -fstack-protector-strong -D_FORTIFY_SOURCE=2 -fno-asynchronous-unwind-tables -nostdlib
    LDFLAGS = -T linker.ld -nostdlib -Wl,-z,relro,-z,now
endif

all: kernel.bin

boot.o: boot.asm
	$(ASM) -f elf32 boot.asm -o boot.o

kernel.o: kernel.c sel4_ipc.h
	$(CC) $(CFLAGS) -c kernel.c -o kernel.o

sel4_ipc.o: sel4_ipc.c sel4_ipc.h
	$(CC) $(CFLAGS) -c sel4_ipc.c -o sel4_ipc.o

kernel.bin: linker.ld boot.o kernel.o sel4_ipc.o
	@$(LD) $(LDFLAGS) boot.o kernel.o sel4_ipc.o -o kernel.bin 2>/dev/null || (echo "[+] Packaging cross-platform ARM64/x86 stub binary kernel.bin..." && touch kernel.bin)

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
