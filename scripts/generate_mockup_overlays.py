"""Generate project-owned transparent PNG mockup overlays.

The app does not generate images at runtime. This script only creates static
repo assets under public/mockups/overlays and updates public/mockups/manifest.json.

No external image libraries are required: PNG encoding and simple raster drawing
use only the Python standard library so the assets remain reproducible.
"""

from __future__ import annotations

import json
import math
import os
import random
import struct
import zlib
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public" / "mockups" / "manifest.json"
OVERLAYS = ROOT / "public" / "mockups" / "overlays"


Color = tuple[int, int, int, int]
Point = tuple[float, float]


@dataclass(frozen=True)
class AssetSpec:
    id: str
    label: str
    category: str
    rel_path: str
    width: int
    height: int
    palette: tuple[str, str, str]
    kind: str
    holes: tuple[tuple[str, tuple[float, ...]], ...]


SPECS: tuple[AssetSpec, ...] = (
    AssetSpec(
        "ios-phone-desk-premium",
        "iOS Phone Desk",
        "앱 목업",
        "app/ios-phone-desk-premium.png",
        1200,
        1600,
        ("#f8fafc", "#dbeafe", "#6366f1"),
        "phone_desk",
        (("rounded", (395, 325, 410, 890, 48)),),
    ),
    AssetSpec(
        "android-phone-gradient-card",
        "Android Gradient Card",
        "앱 목업",
        "app/android-phone-gradient-card.png",
        1200,
        1600,
        ("#111827", "#4338ca", "#06b6d4"),
        "phone_gradient",
        (("rounded", (405, 300, 390, 845, 42)),),
    ),
    AssetSpec(
        "tablet-dashboard-studio",
        "Tablet Dashboard",
        "앱 목업",
        "app/tablet-dashboard-studio.png",
        1600,
        1200,
        ("#f8fafc", "#e0f2fe", "#0ea5e9"),
        "tablet",
        (("rounded", (350, 230, 900, 620, 32)),),
    ),
    AssetSpec(
        "dual-mobile-app-showcase",
        "Dual Mobile Apps",
        "앱 목업",
        "app/dual-mobile-app-showcase.png",
        1600,
        1200,
        ("#fdf4ff", "#ede9fe", "#8b5cf6"),
        "dual_phone",
        (("rounded", (405, 260, 320, 690, 38)), ("rounded", (880, 245, 320, 690, 38))),
    ),
    AssetSpec(
        "desktop-monitor-clean-office",
        "Desktop Monitor",
        "웹사이트 목업",
        "web/desktop-monitor-clean-office.png",
        1600,
        1200,
        ("#f8fafc", "#e5e7eb", "#2563eb"),
        "monitor",
        (("rounded", (285, 205, 1030, 580, 18)),),
    ),
    AssetSpec(
        "laptop-website-hero-angle",
        "Laptop Website Hero",
        "웹사이트 목업",
        "web/laptop-website-hero-angle.png",
        1600,
        1200,
        ("#f4f4f5", "#dbeafe", "#1d4ed8"),
        "laptop",
        (("rounded", (315, 235, 970, 545, 16)),),
    ),
    AssetSpec(
        "browser-window-saas-dashboard",
        "SaaS Browser",
        "웹사이트 목업",
        "web/browser-window-saas-dashboard.png",
        1600,
        1200,
        ("#eef2ff", "#ffffff", "#6366f1"),
        "browser",
        (("rounded", (250, 235, 1100, 645, 14)),),
    ),
    AssetSpec(
        "ultrawide-dashboard-wall",
        "Ultrawide Dashboard",
        "웹사이트 목업",
        "web/ultrawide-dashboard-wall.png",
        1920,
        1080,
        ("#111827", "#1e293b", "#38bdf8"),
        "ultrawide",
        (("rounded", (295, 205, 1330, 565, 18)),),
    ),
    AssetSpec(
        "commerce-long-detail-panels",
        "Long Detail Panels",
        "상세페이지 목업",
        "ecommerce/commerce-long-detail-panels.png",
        1400,
        1800,
        ("#f0fdf4", "#dcfce7", "#22c55e"),
        "detail_panels",
        (("rounded", (145, 180, 330, 1360, 16)), ("rounded", (535, 155, 330, 1400, 16)), ("rounded", (925, 205, 330, 1300, 16))),
    ),
    AssetSpec(
        "product-page-card-gallery",
        "Product Page Gallery",
        "상세페이지 목업",
        "ecommerce/product-page-card-gallery.png",
        1600,
        1200,
        ("#fffbeb", "#fef3c7", "#f59e0b"),
        "product_gallery",
        (("rounded", (245, 205, 650, 720, 22)), ("rounded", (965, 245, 355, 500, 18))),
    ),
    AssetSpec(
        "subway-lightbox-poster",
        "Subway Lightbox",
        "포스터 목업",
        "poster/subway-lightbox-poster.png",
        1200,
        1600,
        ("#e5e7eb", "#cbd5e1", "#64748b"),
        "lightbox",
        (("rounded", (300, 315, 600, 850, 10)),),
    ),
    AssetSpec(
        "gallery-wall-poster-duo",
        "Gallery Poster Duo",
        "포스터 목업",
        "poster/gallery-wall-poster-duo.png",
        1600,
        1200,
        ("#fafaf9", "#e7e5e4", "#78716c"),
        "poster_duo",
        (("rounded", (315, 250, 420, 620, 8)), ("rounded", (870, 210, 420, 620, 8))),
    ),
    AssetSpec(
        "street-billboard-wide",
        "Street Billboard Wide",
        "배너/광고 목업",
        "banner/street-billboard-wide.png",
        1920,
        1080,
        ("#dbeafe", "#bfdbfe", "#1d4ed8"),
        "wide_billboard",
        (("rounded", (380, 230, 1160, 420, 8)),),
    ),
    AssetSpec(
        "metro-platform-banner",
        "Metro Platform Banner",
        "배너/광고 목업",
        "banner/metro-platform-banner.png",
        1920,
        1080,
        ("#f1f5f9", "#cbd5e1", "#475569"),
        "metro_banner",
        (("rounded", (255, 350, 1410, 310, 10)),),
    ),
    AssetSpec(
        "social-square-card-stack",
        "Social Square Stack",
        "소셜 광고 목업",
        "social/social-square-card-stack.png",
        1600,
        1200,
        ("#fff1f2", "#ffe4e6", "#f43f5e"),
        "social_stack",
        (("rounded", (350, 210, 520, 520, 34)), ("rounded", (800, 335, 390, 390, 28))),
    ),
    AssetSpec(
        "vertical-story-phone-ad",
        "Story Phone Ad",
        "소셜 광고 목업",
        "social/vertical-story-phone-ad.png",
        1200,
        1600,
        ("#f5f3ff", "#ddd6fe", "#7c3aed"),
        "story_phone",
        (("rounded", (370, 245, 460, 1000, 46)),),
    ),
    AssetSpec(
        "bus-stop-premium-panel",
        "Bus Stop Premium",
        "실사 광고 목업",
        "ads/bus-stop-premium-panel.png",
        1200,
        1600,
        ("#ecfeff", "#cffafe", "#0891b2"),
        "bus_stop",
        (("rounded", (315, 310, 570, 840, 12)),),
    ),
    AssetSpec(
        "city-rooftop-billboard",
        "Rooftop Billboard",
        "실사 광고 목업",
        "ads/city-rooftop-billboard.png",
        1600,
        1200,
        ("#e0f2fe", "#bae6fd", "#0284c7"),
        "rooftop",
        (("rounded", (420, 230, 760, 430, 8)),),
    ),
    AssetSpec(
        "round-hanging-store-sign",
        "Round Hanging Sign",
        "간판 목업",
        "signage/round-hanging-store-sign.png",
        1200,
        1200,
        ("#f8fafc", "#e2e8f0", "#334155"),
        "round_sign",
        (("ellipse", (355, 310, 490, 490)),),
    ),
    AssetSpec(
        "magazine-spread-ad",
        "Magazine Spread",
        "프린트 목업",
        "print/magazine-spread-ad.png",
        1600,
        1200,
        ("#fefce8", "#fef3c7", "#a16207"),
        "magazine",
        (("rounded", (270, 215, 460, 650, 8)), ("rounded", (870, 215, 460, 650, 8))),
    ),
)


def clamp(v: float) -> int:
    return max(0, min(255, int(round(v))))


def hex_color(value: str, alpha: int = 255) -> Color:
    value = value.strip().lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


def mix(a: Color, b: Color, t: float) -> Color:
    return (
        clamp(a[0] + (b[0] - a[0]) * t),
        clamp(a[1] + (b[1] - a[1]) * t),
        clamp(a[2] + (b[2] - a[2]) * t),
        clamp(a[3] + (b[3] - a[3]) * t),
    )


class Canvas:
    def __init__(self, w: int, h: int) -> None:
        self.w = w
        self.h = h
        self.px = bytearray(w * h * 4)

    def _idx(self, x: int, y: int) -> int:
        return (y * self.w + x) * 4

    def blend_pixel(self, x: int, y: int, color: Color) -> None:
        if x < 0 or y < 0 or x >= self.w or y >= self.h:
            return
        r, g, b, a = color
        idx = self._idx(x, y)
        da = self.px[idx + 3]
        sa = a / 255.0
        ia = 1.0 - sa
        out_a = a + da * ia
        if out_a <= 0:
            self.px[idx:idx + 4] = b"\x00\x00\x00\x00"
            return
        self.px[idx] = clamp((r * a + self.px[idx] * da * ia) / out_a)
        self.px[idx + 1] = clamp((g * a + self.px[idx + 1] * da * ia) / out_a)
        self.px[idx + 2] = clamp((b * a + self.px[idx + 2] * da * ia) / out_a)
        self.px[idx + 3] = clamp(out_a)

    def set_pixel(self, x: int, y: int, color: Color) -> None:
        if 0 <= x < self.w and 0 <= y < self.h:
            idx = self._idx(x, y)
            self.px[idx:idx + 4] = bytes(color)

    def fill_gradient(self, c1: Color, c2: Color, c3: Color) -> None:
        cx, cy = self.w * 0.72, self.h * 0.18
        max_d = math.hypot(max(cx, self.w - cx), max(cy, self.h - cy))
        for y in range(self.h):
            y_t = y / max(1, self.h - 1)
            for x in range(self.w):
                d = math.hypot(x - cx, y - cy) / max_d
                base = mix(c1, c2, min(1.0, y_t * 0.8 + d * 0.25))
                glow = mix(base, c3, max(0.0, 1.0 - d * 2.1) * 0.22)
                self.set_pixel(x, y, glow)

    def noise(self, amount: int = 12, seed: int = 0) -> None:
        rng = random.Random(seed)
        for y in range(0, self.h, 2):
            for x in range(0, self.w, 2):
                n = rng.randint(-amount, amount)
                for yy in (y, y + 1):
                    for xx in (x, x + 1):
                        if xx < self.w and yy < self.h:
                            idx = self._idx(xx, yy)
                            self.px[idx] = clamp(self.px[idx] + n)
                            self.px[idx + 1] = clamp(self.px[idx + 1] + n)
                            self.px[idx + 2] = clamp(self.px[idx + 2] + n)

    def rect(self, x: float, y: float, w: float, h: float, color: Color) -> None:
        for yy in range(max(0, int(y)), min(self.h, int(math.ceil(y + h)))):
            for xx in range(max(0, int(x)), min(self.w, int(math.ceil(x + w)))):
                self.blend_pixel(xx, yy, color)

    def rounded_rect(self, x: float, y: float, w: float, h: float, r: float, color: Color) -> None:
        x0, y0, x1, y1 = int(x), int(y), int(math.ceil(x + w)), int(math.ceil(y + h))
        r = max(0, min(r, w / 2, h / 2))
        for yy in range(max(0, y0), min(self.h, y1)):
            for xx in range(max(0, x0), min(self.w, x1)):
                dx = max(x + r - xx, 0, xx - (x + w - r))
                dy = max(y + r - yy, 0, yy - (y + h - r))
                if dx * dx + dy * dy <= r * r:
                    self.blend_pixel(xx, yy, color)

    def outline_rounded_rect(self, x: float, y: float, w: float, h: float, r: float, color: Color, thickness: int = 4) -> None:
        self.rounded_rect(x, y, w, h, r, color)
        self.clear_rounded_rect(x + thickness, y + thickness, w - thickness * 2, h - thickness * 2, max(0, r - thickness))

    def ellipse(self, x: float, y: float, w: float, h: float, color: Color) -> None:
        cx, cy = x + w / 2, y + h / 2
        rx, ry = w / 2, h / 2
        for yy in range(max(0, int(y)), min(self.h, int(math.ceil(y + h)))):
            for xx in range(max(0, int(x)), min(self.w, int(math.ceil(x + w)))):
                if ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1:
                    self.blend_pixel(xx, yy, color)

    def line(self, x1: float, y1: float, x2: float, y2: float, color: Color, width: int = 2) -> None:
        steps = int(max(abs(x2 - x1), abs(y2 - y1))) + 1
        for i in range(steps):
            t = i / max(1, steps - 1)
            x = x1 + (x2 - x1) * t
            y = y1 + (y2 - y1) * t
            self.rounded_rect(x - width / 2, y - width / 2, width, width, width / 2, color)

    def polygon(self, points: Sequence[Point], color: Color) -> None:
        min_x = max(0, int(min(p[0] for p in points)))
        max_x = min(self.w, int(math.ceil(max(p[0] for p in points))))
        min_y = max(0, int(min(p[1] for p in points)))
        max_y = min(self.h, int(math.ceil(max(p[1] for p in points))))
        for y in range(min_y, max_y):
            for x in range(min_x, max_x):
                inside = False
                j = len(points) - 1
                for i, pi in enumerate(points):
                    pj = points[j]
                    if ((pi[1] > y) != (pj[1] > y)) and (x < (pj[0] - pi[0]) * (y - pi[1]) / (pj[1] - pi[1] + 1e-9) + pi[0]):
                        inside = not inside
                    j = i
                if inside:
                    self.blend_pixel(x, y, color)

    def shadow_round(self, x: float, y: float, w: float, h: float, r: float, alpha: int = 75, spread: int = 34) -> None:
        for i in range(spread, 0, -5):
            a = int(alpha * (i / spread) ** 2 * 0.16)
            self.rounded_rect(x - i, y - i + spread * 0.35, w + i * 2, h + i * 2, r + i, (15, 23, 42, a))

    def clear_rect(self, x: float, y: float, w: float, h: float) -> None:
        for yy in range(max(0, int(y)), min(self.h, int(math.ceil(y + h)))):
            start = self._idx(max(0, int(x)), yy)
            end = self._idx(min(self.w, int(math.ceil(x + w))), yy)
            for idx in range(start, end, 4):
                self.px[idx:idx + 4] = b"\x00\x00\x00\x00"

    def clear_rounded_rect(self, x: float, y: float, w: float, h: float, r: float) -> None:
        x0, y0, x1, y1 = int(x), int(y), int(math.ceil(x + w)), int(math.ceil(y + h))
        r = max(0, min(r, w / 2, h / 2))
        for yy in range(max(0, y0), min(self.h, y1)):
            for xx in range(max(0, x0), min(self.w, x1)):
                dx = max(x + r - xx, 0, xx - (x + w - r))
                dy = max(y + r - yy, 0, yy - (y + h - r))
                if dx * dx + dy * dy <= r * r:
                    idx = self._idx(xx, yy)
                    self.px[idx:idx + 4] = b"\x00\x00\x00\x00"

    def clear_ellipse(self, x: float, y: float, w: float, h: float) -> None:
        cx, cy = x + w / 2, y + h / 2
        rx, ry = w / 2, h / 2
        for yy in range(max(0, int(y)), min(self.h, int(math.ceil(y + h)))):
            for xx in range(max(0, int(x)), min(self.w, int(math.ceil(x + w)))):
                if ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1:
                    idx = self._idx(xx, yy)
                    self.px[idx:idx + 4] = b"\x00\x00\x00\x00"

    def write_png(self, path: Path) -> None:
        def chunk(tag: bytes, data: bytes) -> bytes:
            return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

        raw = bytearray()
        stride = self.w * 4
        for y in range(self.h):
            raw.append(0)
            raw.extend(self.px[y * stride:(y + 1) * stride])
        data = b"".join((
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 6, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)),
            chunk(b"IEND", b""),
        ))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)


def add_floor_grid(c: Canvas, accent: Color) -> None:
    c.polygon(((0, c.h * 0.72), (c.w, c.h * 0.63), (c.w, c.h), (0, c.h)), (255, 255, 255, 64))
    for i in range(-6, 18):
        x = i * c.w / 12
        c.line(x, c.h, c.w * 0.52 + i * 8, c.h * 0.64, (255, 255, 255, 50), 2)
    for i in range(8):
        y = c.h * (0.70 + i * 0.04)
        c.line(0, y, c.w, y - c.h * 0.08, (255, 255, 255, 40), 2)
    c.ellipse(c.w * 0.04, c.h * 0.08, c.w * 0.24, c.w * 0.24, (accent[0], accent[1], accent[2], 35))


def decorate_city(c: Canvas, accent: Color) -> None:
    rng = random.Random(c.w * 17 + c.h)
    for x in range(0, c.w, max(80, c.w // 18)):
        bw = rng.randint(max(45, c.w // 28), max(90, c.w // 12))
        bh = rng.randint(max(180, c.h // 5), max(520, c.h // 2))
        y = int(c.h * 0.66 - bh)
        shade = rng.randint(35, 82)
        c.rect(x, y, bw, bh, (shade, shade + 8, shade + 18, 110))
        for wx in range(x + 12, x + bw - 10, 22):
            for wy in range(y + 18, y + bh - 20, 34):
                c.rect(wx, wy, 8, 14, (255, 255, 255, rng.randint(28, 85)))
    c.line(0, c.h * 0.66, c.w, c.h * 0.64, (accent[0], accent[1], accent[2], 70), 4)


def draw_chrome(c: Canvas, x: float, y: float, w: float, h: float, r: float, accent: Color) -> None:
    c.shadow_round(x, y, w, h, r, 95, 42)
    c.rounded_rect(x, y, w, h, r, (255, 255, 255, 245))
    c.rounded_rect(x, y, w, 54, r, (248, 250, 252, 250))
    for i, col in enumerate(((239, 68, 68, 255), (245, 158, 11, 255), (34, 197, 94, 255))):
        c.ellipse(x + 26 + i * 24, y + 22, 12, 12, col)
    c.rounded_rect(x + 120, y + 17, w - 180, 20, 10, (226, 232, 240, 255))
    c.rounded_rect(x + w - 72, y + 18, 38, 18, 9, (accent[0], accent[1], accent[2], 70))


def frame_holes(c: Canvas, holes: Iterable[tuple[str, tuple[float, ...]]], accent: Color) -> None:
    for kind, values in holes:
        if kind == "rounded":
            x, y, w, h, r = values
            c.clear_rounded_rect(x, y, w, h, r)
            c.outline_rounded_rect(x - 4, y - 4, w + 8, h + 8, r + 4, (255, 255, 255, 195), 4)
            c.outline_rounded_rect(x - 9, y - 9, w + 18, h + 18, r + 8, (accent[0], accent[1], accent[2], 80), 3)
        elif kind == "ellipse":
            x, y, w, h = values
            c.clear_ellipse(x, y, w, h)
            c.ellipse(x - 14, y - 14, w + 28, h + 28, (255, 255, 255, 110))
            c.clear_ellipse(x, y, w, h)
            c.ellipse(x - 22, y - 22, w + 44, h + 44, (accent[0], accent[1], accent[2], 45))
            c.clear_ellipse(x, y, w, h)


def render(spec: AssetSpec) -> Canvas:
    accent = hex_color(spec.palette[2])
    c = Canvas(spec.width, spec.height)
    c.fill_gradient(hex_color(spec.palette[0]), hex_color(spec.palette[1]), accent)
    c.noise(6, seed=sum(ord(ch) for ch in spec.id))

    if spec.kind in {"wide_billboard", "metro_banner", "rooftop"}:
        decorate_city(c, accent)
    else:
        add_floor_grid(c, accent)

    if spec.kind in {"phone_desk", "phone_gradient", "story_phone"}:
        x, y, w, h, r = spec.holes[0][1]
        c.shadow_round(x - 45, y - 55, w + 90, h + 115, r + 44, 120, 58)
        c.rounded_rect(x - 45, y - 55, w + 90, h + 115, r + 44, (18, 24, 38, 255))
        c.rounded_rect(x - 30, y - 35, w + 60, h + 75, r + 28, (245, 247, 251, 255))
        c.rounded_rect(x + w * 0.34, y - 20, w * 0.32, 22, 11, (17, 24, 39, 230))
        c.ellipse(x + w * 0.46, y + h + 28, w * 0.08, 8, (17, 24, 39, 120))

    elif spec.kind == "tablet":
        x, y, w, h, r = spec.holes[0][1]
        c.shadow_round(x - 45, y - 45, w + 90, h + 90, r + 42, 110, 54)
        c.rounded_rect(x - 45, y - 45, w + 90, h + 90, r + 42, (17, 24, 39, 255))
        c.rounded_rect(x - 24, y - 24, w + 48, h + 48, r + 26, (241, 245, 249, 255))

    elif spec.kind == "dual_phone":
        for _, vals in spec.holes:
            x, y, w, h, r = vals
            c.shadow_round(x - 35, y - 42, w + 70, h + 88, r + 36, 95, 46)
            c.rounded_rect(x - 35, y - 42, w + 70, h + 88, r + 36, (28, 28, 45, 255))
            c.rounded_rect(x - 22, y - 25, w + 44, h + 50, r + 24, (252, 252, 255, 255))

    elif spec.kind in {"monitor", "ultrawide"}:
        x, y, w, h, r = spec.holes[0][1]
        draw_chrome(c, x - 38, y - 78, w + 76, h + 130, r + 22, accent)
        c.rounded_rect(x + w * 0.44, y + h + 70, w * 0.12, 110, 12, (71, 85, 105, 180))
        c.rounded_rect(x + w * 0.28, y + h + 175, w * 0.44, 30, 15, (71, 85, 105, 180))

    elif spec.kind == "laptop":
        x, y, w, h, r = spec.holes[0][1]
        draw_chrome(c, x - 34, y - 74, w + 68, h + 122, r + 18, accent)
        c.polygon(((x - 105, y + h + 55), (x + w + 105, y + h + 55), (x + w + 170, y + h + 158), (x - 170, y + h + 158)), (203, 213, 225, 235))
        c.rounded_rect(x + w * 0.44, y + h + 83, w * 0.12, 8, 4, (148, 163, 184, 180))

    elif spec.kind == "browser":
        x, y, w, h, r = spec.holes[0][1]
        draw_chrome(c, x - 16, y - 68, w + 32, h + 92, r + 16, accent)

    elif spec.kind == "detail_panels":
        for _, vals in spec.holes:
            x, y, w, h, r = vals
            c.shadow_round(x - 18, y - 18, w + 36, h + 36, r + 18, 60, 28)
            c.rounded_rect(x - 18, y - 18, w + 36, h + 36, r + 18, (255, 255, 255, 240))

    elif spec.kind == "product_gallery":
        for _, vals in spec.holes:
            x, y, w, h, r = vals
            c.shadow_round(x - 25, y - 25, w + 50, h + 50, r + 24, 80, 35)
            c.rounded_rect(x - 25, y - 25, w + 50, h + 50, r + 24, (255, 255, 255, 245))
        c.rounded_rect(965, 790, 355, 42, 21, (accent[0], accent[1], accent[2], 180))
        c.rounded_rect(965, 858, 250, 20, 10, (120, 113, 108, 95))

    elif spec.kind in {"lightbox", "bus_stop"}:
        x, y, w, h, r = spec.holes[0][1]
        c.rect(x - 130, y - 165, 44, h + 330, (100, 116, 139, 180))
        c.shadow_round(x - 38, y - 46, w + 76, h + 92, r + 18, 110, 52)
        c.rounded_rect(x - 38, y - 46, w + 76, h + 92, r + 18, (226, 232, 240, 235))
        c.rounded_rect(x - 22, y - 26, w + 44, h + 52, r + 10, (255, 255, 255, 230))
        c.rect(x - 88, y + h + 72, w + 176, 52, (71, 85, 105, 155))

    elif spec.kind == "poster_duo":
        for _, vals in spec.holes:
            x, y, w, h, r = vals
            c.shadow_round(x - 24, y - 24, w + 48, h + 48, r + 18, 82, 36)
            c.rounded_rect(x - 24, y - 24, w + 48, h + 48, r + 18, (255, 255, 255, 250))
            c.rounded_rect(x - 8, y - 8, w + 16, h + 16, r + 8, (231, 229, 228, 255))

    elif spec.kind in {"wide_billboard", "metro_banner", "rooftop"}:
        x, y, w, h, r = spec.holes[0][1]
        c.shadow_round(x - 24, y - 30, w + 48, h + 60, r + 14, 100, 44)
        c.rounded_rect(x - 24, y - 30, w + 48, h + 60, r + 14, (30, 41, 59, 230))
        c.rounded_rect(x - 12, y - 16, w + 24, h + 32, r + 8, (255, 255, 255, 220))
        for px in (x - 10, x + w - 10):
            c.rect(px, y + h + 14, 20, 180, (51, 65, 85, 160))

    elif spec.kind == "social_stack":
        for _, vals in spec.holes:
            x, y, w, h, r = vals
            c.shadow_round(x - 24, y - 24, w + 48, h + 48, r + 22, 85, 38)
            c.rounded_rect(x - 24, y - 24, w + 48, h + 48, r + 22, (255, 255, 255, 240))

    elif spec.kind == "round_sign":
        x, y, w, h = spec.holes[0][1]
        c.rect(x - 260, y - 70, 240, 36, (51, 65, 85, 170))
        c.line(x - 20, y + 10, x - 120, y - 52, (51, 65, 85, 200), 16)
        c.shadow_round(x - 35, y - 35, w + 70, h + 70, w / 2, 125, 58)
        c.ellipse(x - 35, y - 35, w + 70, h + 70, (226, 232, 240, 250))
        c.ellipse(x - 12, y - 12, w + 24, h + 24, (248, 250, 252, 255))

    elif spec.kind == "magazine":
        c.shadow_round(210, 165, 1180, 780, 22, 95, 48)
        c.rounded_rect(210, 165, 1180, 780, 22, (255, 255, 255, 245))
        c.line(800, 185, 800, 925, (214, 211, 209, 210), 4)
        c.rounded_rect(235, 190, 530, 705, 12, (250, 250, 249, 255))
        c.rounded_rect(835, 190, 530, 705, 12, (250, 250, 249, 255))

    frame_holes(c, spec.holes, accent)
    return c


def update_manifest() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    existing = {item.get("id"): item for item in data.get("mockups", [])}
    for spec in SPECS:
        existing[spec.id] = {
            "id": spec.id,
            "label": spec.label,
            "category": spec.category,
            "src": f"mockups/overlays/{spec.rel_path}",
        }
    ordered = []
    seen: set[str] = set()
    for item in data.get("mockups", []):
        item_id = item.get("id")
        if item_id in existing and item_id not in seen:
            ordered.append(existing[item_id])
            seen.add(item_id)
    for spec in SPECS:
        if spec.id not in seen:
            ordered.append(existing[spec.id])
            seen.add(spec.id)
    MANIFEST.write_text(json.dumps({"mockups": ordered}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for spec in SPECS:
        out = OVERLAYS / spec.rel_path
        print(f"generate {out.relative_to(ROOT)}")
        render(spec).write_png(out)
    update_manifest()
    print(f"updated {MANIFEST.relative_to(ROOT)} with {len(SPECS)} generated mockups")


if __name__ == "__main__":
    os.chdir(ROOT)
    main()
