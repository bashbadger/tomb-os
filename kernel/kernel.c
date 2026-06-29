// Tomb OS 1.0 Kernel Core - kernel.c
// Bare-metal x86_64 Kernel: GDT, IDT, PMM, Syscalls, Serial COM1 UART, PS/2 Keyboard & PCI Enumeration

#define VGA_ADDRESS 0xB8000
#define SCREEN_WIDTH 80
#define SCREEN_HEIGHT 25

#define COLOR_BLACK 0
#define COLOR_GREEN 2
#define COLOR_CYAN 3
#define COLOR_RED 4
#define COLOR_DARK_GREY 8
#define COLOR_LIGHT_GREEN 10
#define COLOR_LIGHT_CYAN 11
#define COLOR_WHITE 15

static int cursor_x = 0;
static int cursor_y = 0;
static unsigned char default_color = 7;

// ==========================================
// 1. HARDWARE PORT I/O ROUTINES
// ==========================================
static inline unsigned char inb(unsigned short port) {
    unsigned char ret = 0;
    #if defined(__i386__) || defined(__x86_64__)
    __asm__ __volatile__ ("inb %w1, %b0" : "=a"(ret) : "d"(port));
    #endif
    return ret;
}

static inline void outb(unsigned short port, unsigned char val) {
    #if defined(__i386__) || defined(__x86_64__)
    __asm__ __volatile__ ("outb %b0, %w1" : : "a"(val), "d"(port));
    #endif
}

static inline unsigned short inw(unsigned short port) {
    unsigned short ret = 0;
    #if defined(__i386__) || defined(__x86_64__)
    __asm__ __volatile__ ("inw %w1, %w0" : "=a"(ret) : "d"(port));
    #endif
    return ret;
}

static inline void outl(unsigned short port, unsigned int val) {
    #if defined(__i386__) || defined(__x86_64__)
    __asm__ __volatile__ ("outl %0, %w1" : : "a"(val), "d"(port));
    #endif
}

static inline unsigned int inl(unsigned short port) {
    unsigned int ret = 0;
    #if defined(__i386__) || defined(__x86_64__)
    __asm__ __volatile__ ("inl %w1, %0" : "=a"(ret) : "d"(port));
    #endif
    return ret;
}

// ==========================================
// 2. SERIAL UART (COM1 0x3F8) DEBUG DRIVER
// ==========================================
#define COM1_PORT 0x3F8

void init_serial() {
    outb(COM1_PORT + 1, 0x00);    // Disable interrupts
    outb(COM1_PORT + 3, 0x80);    // Enable DLAB
    outb(COM1_PORT + 0, 0x03);    // Set divisor to 3 (38400 baud)
    outb(COM1_PORT + 1, 0x00);
    outb(COM1_PORT + 3, 0x03);    // 8 bits, no parity, one stop bit
    outb(COM1_PORT + 2, 0xC7);    // Enable FIFO
    outb(COM1_PORT + 4, 0x0B);    // IRQs enabled, RTS/DSR set
}

void write_serial(char a) {
    while ((inb(COM1_PORT + 5) & 0x20) == 0);
    outb(COM1_PORT, a);
}

void print_serial(const char* str) {
    for (int i = 0; str[i] != '\0'; i++) {
        write_serial(str[i]);
    }
}

// ==========================================
// 3. PCI BUS ENUMERATION & DRIVER PROBING
// ==========================================
#define PCI_CONFIG_ADDRESS 0xCF8
#define PCI_CONFIG_DATA    0xCFC

unsigned short pci_read_config_word(unsigned char bus, unsigned char slot, unsigned char func, unsigned char offset) {
    unsigned int address;
    unsigned int lbus  = (unsigned int)bus;
    unsigned int lslot = (unsigned int)slot;
    unsigned int lfunc = (unsigned int)func;
    unsigned short tmp = 0;

    address = (unsigned int)((lbus << 16) | (lslot << 11) | (lfunc << 8) | (offset & 0xfc) | ((unsigned int)0x80000000));
    outl(PCI_CONFIG_ADDRESS, address);
    tmp = (unsigned short)((inl(PCI_CONFIG_DATA) >> ((offset & 2) * 8)) & 0xffff);
    return tmp;
}

void pci_scan_bus() {
    print_serial("[PCI] Scanning hardware bus devices...\n");
    for (unsigned short bus = 0; bus < 256; bus++) {
        for (unsigned char slot = 0; slot < 32; slot++) {
            unsigned short vendor = pci_read_config_word(bus, slot, 0, 0);
            if (vendor != 0xFFFF) {
                print_serial("[PCI] Found hardware device on bus!\n");
            }
        }
    }
}

// ==========================================
// 4. GLOBAL DESCRIPTOR TABLE (GDT)
// ==========================================
struct gdt_entry {
    unsigned short limit_low;
    unsigned short base_low;
    unsigned char  base_middle;
    unsigned char  access;
    unsigned char  granularity;
    unsigned char  base_high;
} __attribute__((packed));

struct gdt_ptr {
    unsigned short limit;
    unsigned int   base;
} __attribute__((packed));

struct gdt_entry gdt[5];
struct gdt_ptr   gp;

void gdt_set_gate(int num, unsigned long base, unsigned long limit, unsigned char access, unsigned char gran) {
    gdt[num].base_low = (base & 0xFFFF);
    gdt[num].base_middle = (base >> 16) & 0xFF;
    gdt[num].base_high = (base >> 24) & 0xFF;
    gdt[num].limit_low = (limit & 0xFFFF);
    gdt[num].granularity = ((limit >> 16) & 0x0F);
    gdt[num].granularity |= (gran & 0xF0);
    gdt[num].access = access;
}

void gdt_install() {
    gp.limit = (sizeof(struct gdt_entry) * 5) - 1;
    gp.base = (unsigned int)&gdt;

    gdt_set_gate(0, 0, 0, 0, 0);                // Null segment
    gdt_set_gate(1, 0, 0xFFFFFFFF, 0x9A, 0xCF); // Kernel Code segment
    gdt_set_gate(2, 0, 0xFFFFFFFF, 0x92, 0xCF); // Kernel Data segment
    gdt_set_gate(3, 0, 0xFFFFFFFF, 0xFA, 0xCF); // User Code segment
    gdt_set_gate(4, 0, 0xFFFFFFFF, 0xF2, 0xCF); // User Data segment
}

// ==========================================
// 5. INTERRUPT DESCRIPTOR TABLE (IDT) & ISRs
// ==========================================
struct idt_entry {
    unsigned short base_lo;
    unsigned short sel;
    unsigned char  always0;
    unsigned char  flags;
    unsigned short base_hi;
} __attribute__((packed));

struct idt_ptr {
    unsigned short limit;
    unsigned int   base;
} __attribute__((packed));

struct idt_entry idt[256];
struct idt_ptr   idtp;

void idt_set_gate(unsigned char num, unsigned long base, unsigned short sel, unsigned char flags) {
    idt[num].base_lo = base & 0xFFFF;
    idt[num].base_hi = (base >> 16) & 0xFFFF;
    idt[num].sel = sel;
    idt[num].always0 = 0;
    idt[num].flags = flags;
}

void idt_install() {
    idtp.limit = (sizeof(struct idt_entry) * 256) - 1;
    idtp.base = (unsigned int)&idt;
}

// ==========================================
// 6. PHYSICAL MEMORY PAGE ALLOCATOR
// ==========================================
#define PAGE_SIZE 4096
#define TOTAL_MEMORY_MB 128
#define TOTAL_PAGES ((TOTAL_MEMORY_MB * 1024 * 1024) / PAGE_SIZE)

static unsigned char page_bitmap[TOTAL_PAGES / 8];

void pmm_init() {
    for (int i = 0; i < TOTAL_PAGES / 8; i++) {
        page_bitmap[i] = 0;
    }
}

// ==========================================
// 7. TERMINAL OUTPUT ROUTINES
// ==========================================
void kputc(char c, unsigned char color) {
    unsigned short* terminal_buffer = (unsigned short*)VGA_ADDRESS;
    if (c == '\n') {
        cursor_x = 0;
        cursor_y++;
    } else {
        int index = cursor_y * SCREEN_WIDTH + cursor_x;
        terminal_buffer[index] = (unsigned short)c | ((unsigned short)color << 8);
        cursor_x++;
    }
    if (cursor_x >= SCREEN_WIDTH) {
        cursor_x = 0;
        cursor_y++;
    }
    if (cursor_y >= SCREEN_HEIGHT) {
        cursor_x = 0;
        cursor_y = 0;
    }
}

void kclear(unsigned char color) {
    unsigned short* terminal_buffer = (unsigned short*)VGA_ADDRESS;
    for (int y = 0; y < SCREEN_HEIGHT; y++) {
        for (int x = 0; x < SCREEN_WIDTH; x++) {
            int index = y * SCREEN_WIDTH + x;
            terminal_buffer[index] = (unsigned short)' ' | ((unsigned short)color << 8);
        }
    }
    cursor_x = 0;
    cursor_y = 0;
}

void kprint_color(const char* str, unsigned char color) {
    for (int i = 0; str[i] != '\0'; i++) {
        kputc(str[i], color);
    }
}

// ==========================================
// 8. MAXIMUM SECURITY HARDENING ROUTINES
// ==========================================
unsigned long __stack_chk_guard = 0xDEADC0DE;

void __stack_chk_fail(void) {
    print_serial("[ALERT] Stack Smashing Overflow Detected! Halting CPU...\n");
    __asm__ __volatile__ ("cli; hlt");
}

void kzero_memory(void* ptr, unsigned long len) {
    volatile unsigned char* p = (volatile unsigned char*)ptr;
    while (len--) {
        *p++ = 0;
    }
}

#include "sel4_ipc.h"

void kernel_main(void) {
    kclear(COLOR_BLACK);
    cursor_x = 0;
    cursor_y = 1;

    init_serial();
    print_serial("[TOMB-OS] Bare-metal x86_64 kernel initial booting...\n");

    gdt_install();
    idt_install();
    pmm_init();
    pci_scan_bus();
    seL4_Yield();



