import json

with open('static/gansu.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

cities = []
all_lons = []
all_lats = []

for feature in data['features']:
    props = feature['properties']
    name = props['name'].replace('市', '')
    center = props['center']
    lon, lat = center[0], center[1]
    cities.append({
        'name': name,
        'lon': lon,
        'lat': lat
    })
    all_lons.append(lon)
    all_lats.append(lat)
    
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

print(f"甘肃省经纬度范围:")
print(f"  经度: {min_lon:.4f} - {max_lon:.4f}")
print(f"  纬度: {min_lat:.4f} - {max_lat:.4f}")
print(f"  宽度: {max_lon - min_lon:.4f} 度")
print(f"  高度: {max_lat - min_lat:.4f} 度")
print()

svg_width = 800
svg_height = 600

print("城市标记点位置（SVG百分比）:")
print("[")
for city in cities:
    left = (city['lon'] - min_lon) / (max_lon - min_lon) * 100
    top = (max_lat - city['lat']) / (max_lat - min_lat) * 100
    print(f"  {{ name: '{city['name']}', label: '{city['name']}', left: {left:.1f}, top: {top:.1f} }},")
print("]")
