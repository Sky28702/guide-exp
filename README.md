# 3D ULPIN & Vertical Property Mapping System

A prototype for **3D ULPIN generation, vertical property mapping, and unit-level collateral verification**.

The system extends conventional 2D parcel mapping into the vertical dimension by representing a property as a hierarchy of:

**Surface Parcel → Building → Floor → Unit → 3D Spatial Identity**

It is designed around the concept of creating a unique spatial identity for individual units within multi-storey properties and associating ownership and financial records directly with those units.

---

## Problem

Conventional land-record systems primarily represent properties as 2D surface parcels.

This creates difficulties when dealing with:

- Multi-storey apartments
- Vertically divided properties
- Individual floor/unit ownership
- Parking and other spatially separated property rights
- Mortgage and collateral verification
- Ambiguous or duplicated property records

A property may occupy the same surface footprint while containing multiple independently owned units vertically.

This prototype explores how a **3D cadastral representation** can solve this problem by giving individual units their own spatial identity.

---

## Prototype

The prototype demonstrates a software workflow for:

1. Visualizing a surface parcel using a 2D GIS map.
2. Representing a building as multiple floors.
3. Dividing floors into individual units.
4. Selecting and inspecting individual units.
5. Representing the building in a 3D environment.
6. Associating ownership information with individual units.
7. Registering collateral against a specific unit.
8. Recording mortgages/lien information at unit level.
9. Clearing collateral when required.
10. Submitting new buildings for future survey/GIS processing.
11. Tracking the status of submitted building requests.

The central idea is that collateral and ownership should be associated with the **specific vertical property**, rather than only the underlying surface parcel.

---

## Key Features

### 1. Surface Parcel Mapping

A 2D GIS layer represents the surface parcel and building footprint.

The prototype uses **Leaflet** for interactive map visualization.

### 2. Vertical Property Register

Buildings are organized floor-by-floor.

Each floor contains individual units that can be selected and inspected.

Example:

```text
Building
├── Floor 1
│   ├── Unit 01
│   ├── Unit 02
│   └── Unit 03
│
├── Floor 2
│   ├── Unit 01
│   ├── Unit 02
│   └── Unit 03
│
└── Floor 3
    ├── Unit 01
    ├── Unit 02
    └── Unit 03
