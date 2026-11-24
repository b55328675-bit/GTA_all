#!/usr/bin/env python3
"""Generate assets/img/og-cover.png without external libraries.

Pure-Python PNG encoder (zlib + struct) and a tiny 5x7 bitmap font, so the
cover can be rebuilt in any environment — no ImageMagick, cairosvg or PIL.
"""

import math
import struct
import zlib
from pathlib import Path

W, H = 1200, 630

FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    " ": ["00000"] * 7,
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "·": ["00000", "00000", "00000", "00100", "00000", "00000", "00000"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
}


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(lerp(c1[i], c2[i], t) for i in range(3))


def radial(cx, cy, radius, strength):
    """Return a function (x, y) -> intensity 0..strength."""
    def fn(x, y):
        d = math.hypot(x - cx, y - cy)
        if d >= radius:
            return 0.0
        falloff = (1.0 - d / radius) ** 2
        return falloff * strength
    return fn


def build_background():
    top = (7, 8, 15)
    mid = (17, 19, 32)
    bot = (9, 11, 19)
    glows = [
        (radial(1010, 120, 620, 0.55), (255, 92, 138)),   # pink
        (radial(180, 560, 560, 0.42), (123, 44, 191)),    # violet
        (radial(620, 330, 700, 0.20), (73, 197, 240)),    # cyan haze
    ]

    rows = []
    for y in range(H):
        t = y / (H - 1)
        if t < 0.55:
            base = mix(top, mid, t / 0.55)
        else:
            base = mix(mid, bot, (t - 0.55) / 0.45)
        row = bytearray(W * 3)
        for x in range(W):
            r, g, b = base
            # faint grid
            if x % 60 == 0 or y % 60 == 0:
                r += 6; g += 7; b += 10
            for fn, color in glows:
                k = fn(x, y)
                if k:
                    r += color[0] * k
                    g += color[1] * k
                    b += color[2] * k
            i = x * 3
            row[i] = int(min(255, r))
            row[i + 1] = int(min(255, g))
            row[i + 2] = int(min(255, b))
        rows.append(row)
    return rows


def draw_text(rows, text, x0, y0, scale, color_fn, spacing=1):
    """color_fn(x, y) -> (r, g, b). Glyphs are 5x7 with `spacing` empty columns."""
    cx = x0
    for ch in text.upper():
        glyph = FONT.get(ch, FONT[" "])
        gw = 5 * scale
        for gy, line in enumerate(glyph):
            for gx, bit in enumerate(line):
                if bit != "1":
                    continue
                px = cx + gx * scale
                py = y0 + gy * scale
                for yy in range(scale):
                    row = rows[py + yy]
                    base = (py + yy) * 0  # noqa: F841  (keeps type checkers calm)
                    for xx in range(scale):
                        i = (px + xx) * 3
                        cr, cg, cb = color_fn(px + xx, py + yy)
                        row[i] = int(min(255, cr))
                        row[i + 1] = int(min(255, cg))
                        row[i + 2] = int(min(255, cb))
        cx += gw + scale * spacing
    return cx


def text_width(text, scale, spacing=1):
    return len(text) * 6 * scale


def hline(rows, x0, x1, y, color, alpha=1.0):
    for x in range(x0, x1):
        i = x * 3
        row = rows[y]
        row[i] = int(lerp(row[i], color[0], alpha))
        row[i + 1] = int(lerp(row[i + 1], color[1], alpha))
        row[i + 2] = int(lerp(row[i + 2], color[2], alpha))


def rect(rows, x0, y0, x1, y1, color, alpha=1.0):
    for y in range(y0, y1):
        for x in range(x0, x1):
            i = x * 3
            row = rows[y]
            row[i] = int(lerp(row[i], color[0], alpha))
            row[i + 1] = int(lerp(row[i + 1], color[1], alpha))
            row[i + 2] = int(lerp(row[i + 2], color[2], alpha))


def save_png(rows, path):
    raw = b"".join(b"\x00" + bytes(row) for row in rows)

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    Path(path).write_bytes(png)


def main():
    rows = build_background()

    # Accent bars in the top-left corner.
    rect(rows, 84, 78, 180, 84, (255, 92, 138))
    rect(rows, 84, 78, 128, 84, (255, 209, 102))

    # Badge "1997 - 2026".
    badge_x, badge_y = 84, 110
    rect(rows, badge_x, badge_y, badge_x + text_width("1997-2026", 4) + 40,
         badge_y + 7 * 4 + 30, (255, 255, 255), 0.06)
    draw_text(rows, "1997-2026", badge_x + 20, badge_y + 15, 4,
              lambda x, y: (240, 214, 230))

    # Main title.
    title_y = 250
    draw_text(rows, "GTA", 84, title_y, 22, lambda x, y: (255, 255, 255))
    x_after = 84 + text_width("GTA", 22) + 22 * 3
    draw_text(rows, "ALL", x_after, title_y, 22,
              lambda x, y: mix((255, 92, 138), (123, 44, 191),
                               min(1.0, (x - x_after) / 380.0)))

    # Divider.
    hline(rows, 88, 520, 448, (255, 255, 255), 0.16)

    # Subtitle.
    draw_text(rows, "ALL GAMES · 60 FPS · RU", 88, 472, 5,
              lambda x, y: (196, 202, 224))

    # Footer line.
    draw_text(rows, "STEAM LINKS · MOD PACKS · TIMELINE", 88, 548, 3,
              lambda x, y: (128, 136, 168))

    # Right-edge diagonal strokes, kept away from the title block.
    for k in range(9):
        offset = k * 22
        for step in range(300):
            x = 1190 - offset - step
            y = 330 + step
            if 1010 <= x < W and 0 <= y < H:
                i = x * 3
                row = rows[y]
                row[i] = int(min(255, row[i] + 34))
                row[i + 1] = int(min(255, row[i + 1] + 10))
                row[i + 2] = int(min(255, row[i + 2] + 26))

    out = Path(__file__).resolve().parent.parent / "assets" / "img" / "og-cover.png"
    save_png(rows, out)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
