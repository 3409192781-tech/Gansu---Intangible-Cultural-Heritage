import json

with open('static/gansu.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

all_lons = []
all_lats = []
city_centers = []

for feature in data['features']:
    props = feature['properties']
    name = props['name'].replace('市', '')
    name = name.replace('回族自治州', '')
    name = name.replace('藏族自治州', '')
    center = props['center']
    city_centers.append({
        'name': name,
        'lon': center[0],
        'lat': center[1]
    })
    
    coords = feature['geometry']['coordinates']
    if feature['geometry']['type'] == 'MultiPolygon':
        for polygon in coords:
            for ring in polygon:
                for point in ring:
                    all_lons.append(point[0])
                    all_lats.append(point[1])
    elif feature['geometry']['type'] == 'Polygon':
        for ring in coords:
            for point in ring:
                all_lons.append(point[0])
                all_lats.append(point[1])

min_lon = min(all_lons)
max_lon = max(all_lons)
min_lat = min(all_lats)
max_lat = max(all_lats)

lon_range = max_lon - min_lon
lat_range = max_lat - min_lat

svg_width = 800
svg_height = 600
padding = 30

map_width = svg_width - 2 * padding
map_height = svg_height - 2 * padding

scale_x = map_width / lon_range
scale_y = map_height / lat_range

scale = min(scale_x, scale_y)

actual_map_width = lon_range * scale
actual_map_height = lat_range * scale

offset_x = padding + (map_width - actual_map_width) / 2
offset_y = padding + (map_height - actual_map_height) / 2

def lon_to_x(lon):
    return offset_x + (lon - min_lon) * scale

def lat_to_y(lat):
    return offset_y + (max_lat - lat) * scale

colors = [
    '#E8D5B7', '#D4A86A', '#C4956A', '#B8956A', '#D4B86A',
    '#C4A86A', '#E8C87A', '#D4A86A', '#C8985A', '#B8884A',
    '#D4B87A', '#C8A86A', '#D4A87A', '#C4987A'
]

svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
<defs>
<linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" style="stop-color:#FFF8E7;stop-opacity:1" />
<stop offset="100%" style="stop-color:#F5E6D3;stop-opacity:1" />
</linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#bgGrad)"/>
'''.format(w=svg_width, h=svg_height)

for i, feature in enumerate(data['features']):
    coords = feature['geometry']['coordinates']
    color = colors[i % len(colors)]
    path_d = ''
    
    if feature['geometry']['type'] == 'MultiPolygon':
        for polygon in coords:
            for j, ring in enumerate(polygon):
                if j == 0:
                    path_d += 'M '
                else:
                    path_d += 'M '
                for k, point in enumerate(ring):
                    x = lon_to_x(point[0])
                    y = lat_to_y(point[1])
                    if k == 0:
                        path_d += '{:.2f} {:.2f} '.format(x, y)
                    else:
                        path_d += 'L {:.2f} {:.2f} '.format(x, y)
                path_d += 'Z '
    elif feature['geometry']['type'] == 'Polygon':
        for j, ring in enumerate(coords):
            if j == 0:
                path_d += 'M '
            else:
                path_d += 'M '
            for k, point in enumerate(ring):
                x = lon_to_x(point[0])
                y = lat_to_y(point[1])
                if k == 0:
                    path_d += '{:.2f} {:.2f} '.format(x, y)
                else:
                    path_d += 'L {:.2f} {:.2f} '.format(x, y)
            path_d += 'Z '
    
    svg_content += '<path d="{}" fill="{}" fill-opacity="0.25" stroke="#8B4513" stroke-width="1.5" stroke-linejoin="round"/>\n'.format(path_d.strip(), color)

svg_content += '</svg>'

with open('static/gansu-map.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("SVG地图已重新生成！")
print(f"坐标范围: 经度 {min_lon:.4f}-{max_lon:.4f}, 纬度 {min_lat:.4f}-{max_lat:.4f}")
print(f"缩放比例: {scale:.2f} 像素/度")
print(f"偏移量: x={offset_x:.1f}, y={offset_y:.1f}")
print()
print("城市标记点位置（百分比）:")
print("[")
for city in city_centers:
    x = lon_to_x(city['lon'])
    y = lat_to_y(city['lat'])
    left_pct = x / svg_width * 100
    top_pct = y / svg_height * 100
    print(f"  {{ name: '{city['name']}', label: '{city['name']}', left: {left_pct:.1f}, top: {top_pct:.1f} }},")
print("]")
