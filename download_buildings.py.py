import json

INPUT_FILE = "part-00170-110f5303-ff85-4c71-a2bf-c6070024fec8.c000.csv"
OUTPUT_FILE = "delhi-buildings.json"

# Small test area around central Delhi
MIN_LON = 77.215
MAX_LON = 77.225
MIN_LAT = 28.615
MAX_LAT = 28.625


def geometry_inside_bbox(geometry):
    coordinates = geometry["coordinates"]

    def check(coords):
        if isinstance(coords[0], (int, float)):
            lon, lat = coords
            return (
                MIN_LON <= lon <= MAX_LON
                and MIN_LAT <= lat <= MAX_LAT
            )

        return any(check(item) for item in coords)

    return check(coordinates)


features = []
total = 0

print("Reading Microsoft building data...")

with open(INPUT_FILE, "r", encoding="utf-8") as f:

    for line in f:
        total += 1

        try:
            feature = json.loads(line)

            if geometry_inside_bbox(feature["geometry"]):
                features.append(feature)

        except Exception:
            continue

        if total % 100000 == 0:
            print(f"Processed {total:,} buildings...")

print()
print(f"Buildings in Delhi area: {len(features):,}")

output = {
    "type": "FeatureCollection",
    "features": features
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f)

print(f"Saved: {OUTPUT_FILE}")