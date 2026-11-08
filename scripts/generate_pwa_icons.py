import zlib
import struct
import math

def make_png(width, height, is_maskable=False):
    # RGBA image buffer
    raw_data = bytearray()
    
    bg_r, bg_g, bg_b = 79, 70, 229 # #4F46E5 indigo
    glow_r, glow_g, glow_b = 55, 48, 163 # #3730A3
    white_r, white_g, white_b = 255, 255, 255
    
    cx, cy = width / 2.0, height / 2.0
    corner_r = width * (0.0 if is_maskable else 0.22)
    
    for y in range(height):
        raw_data.append(0) # Filter byte 0 (None)
        for x in range(width):
            # Check rounded corner
            in_rect = True
            if not is_maskable:
                # Distance to corner centers
                dx = max(0, abs(x - cx) - (cx - corner_r))
                dy = max(0, abs(y - cy) - (cy - corner_r))
                if dx * dx + dy * dy > corner_r * corner_r:
                    in_rect = False
            
            if not in_rect:
                raw_data.extend([0, 0, 0, 0])
                continue
                
            # Gradient factor
            grad = (x + y) / float(width + height)
            r = int(bg_r * (1 - grad * 0.25) + glow_r * (grad * 0.25))
            g = int(bg_g * (1 - grad * 0.25) + glow_g * (grad * 0.25))
            b = int(bg_b * (1 - grad * 0.25) + glow_b * (grad * 0.25))
            a = 255
            
            # Draw Lightning Bolt
            # Normalize coordinates to [0, 1] relative to center
            scale = 0.55 if not is_maskable else 0.45
            nx = (x - cx) / (width * scale) + 0.5
            ny = (y - cy) / (height * scale) + 0.5
            
            # Simple polygon hit test for lightning bolt
            # Upper triangle: (0.42, 0.15) -> (0.28, 0.55) -> (0.48, 0.55)
            # Lower triangle: (0.44, 0.45) -> (0.64, 0.45) -> (0.50, 0.85)
            in_lightning = False
            
            # Approximate lightning shape:
            # P1(0.55, 0.15), P2(0.30, 0.52), P3(0.52, 0.52), P4(0.45, 0.85), P5(0.70, 0.48), P6(0.48, 0.48)
            poly = [
                (0.55, 0.15),
                (0.30, 0.52),
                (0.50, 0.52),
                (0.45, 0.85),
                (0.70, 0.48),
                (0.48, 0.48),
            ]
            
            # Ray casting algorithm
            nvert = len(poly)
            j = nvert - 1
            for i in range(nvert):
                xi, yi = poly[i]
                xj, yj = poly[j]
                if ((yi > ny) != (yj > ny)) and (nx < (xj - xi) * (ny - yi) / (yj - yi) + xi):
                    in_lightning = not in_lightning
                j = i
                
            if in_lightning:
                r, g, b = white_r, white_g, white_b
            
            raw_data.extend([r, g, b, a])
            
    # Assemble PNG chunks
    header = b'\x89PNG\r\n\x1a\n'
    
    # IHDR
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr)
    ihdr_chunk = struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', ihdr_crc)
    
    # IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    return header + ihdr_chunk + idat_chunk + iend_chunk

with open('public/pwa-192x192.png', 'wb') as f:
    f.write(make_png(192, 192, False))
print('Created public/pwa-192x192.png')

with open('public/pwa-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, False))
print('Created public/pwa-512x512.png')

with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(make_png(180, 180, False))
print('Created public/apple-touch-icon.png')

with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, True))
print('Created public/pwa-maskable-512x512.png')
