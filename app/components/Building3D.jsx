"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const COLOR = {
  ink: 0x0e2229,
  line: 0x2a5866,
  muted: 0x7fa3ac,
  paper: 0xe9eeec,
  brass: 0xc99a4b,
  alert: 0xd2574a,
  ok: 0x4f9c82,
};

const FOOTPRINT_LEN = 54;
const FOOTPRINT_WID = 20;
const BUILD_TOP = 17.5;
const BUILD_BOTTOM = -3.5;

function toScene(x, y, z) {
  return [x - FOOTPRINT_LEN / 2, z, y - FOOTPRINT_WID / 2];
}

export default function Building3D({
  floors,
  structure,
  selectedFloorId,
  selectedUnitId,
  onSelectFloor,
  onSelectUnit,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 500);

    camera.position.set(62, 42, 62);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, 8, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 25;
    controls.maxDistance = 160;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(40, 60, 20);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(COLOR.muted, 0.25);
    fill.position.set(-30, 20, -40);
    scene.add(fill);

    const grid = new THREE.GridHelper(140, 40, COLOR.line, COLOR.line);

    grid.position.y = BUILD_BOTTOM - 0.01;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function handleClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(modelGroup.children, true);

      const hit = hits.find((item) => item.object.userData?.selectable);

      if (!hit) return;

      const { floorId, unitId } = hit.object.userData;

      if (unitId) {
        stateRef.current.onSelectUnit?.(floorId, unitId);
      } else {
        stateRef.current.onSelectFloor?.(floorId);
      }
    }

    renderer.domElement.addEventListener("click", handleClick);

    let frameId;

    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;

      if (!w || !h) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    stateRef.current = {
      ...stateRef.current,
      scene,
      camera,
      renderer,
      controls,
      modelGroup,
      onSelectFloor,
      onSelectUnit,
    };

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("click", handleClick);
      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    stateRef.current.onSelectFloor = onSelectFloor;
    stateRef.current.onSelectUnit = onSelectUnit;
  }, [onSelectFloor, onSelectUnit]);

  useEffect(() => {
    const { modelGroup } = stateRef.current;

    if (!modelGroup || !structure) return;

    while (modelGroup.children.length) {
      const child = modelGroup.children.pop();

      child.traverse?.((object) => {
        object.geometry?.dispose?.();

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
    }

    modelGroup.add(buildShell());
    modelGroup.add(buildColumns(structure));

    (structure.cores || []).forEach((core) => {
      modelGroup.add(buildCore(core));
    });

    floors.forEach((floor) => {
      const isFloorSelected = floor.id === selectedFloorId;

      if (floor.kind === "residential") {
        floor.units.forEach((unit) => {
          modelGroup.add(
            buildUnitMesh(
              floor,
              unit,
              isFloorSelected,
              unit.id === selectedUnitId,
            ),
          );
        });
      } else {
        modelGroup.add(buildSlabMesh(floor, isFloorSelected));
      }
    });
  }, [floors, structure, selectedFloorId, selectedUnitId]);

  return (
    <div
      ref={mountRef}
      className="w-full h-105 lg:h-full min-h-105 border border-line"
    />
  );
}

function buildShell() {
  const height = BUILD_TOP - BUILD_BOTTOM;
  const geometry = new THREE.BoxGeometry(FOOTPRINT_LEN, height, FOOTPRINT_WID);

  const edges = new THREE.EdgesGeometry(geometry);

  const material = new THREE.LineBasicMaterial({
    color: COLOR.muted,
    transparent: true,
    opacity: 0.55,
  });

  const line = new THREE.LineSegments(edges, material);

  line.position.set(0, BUILD_BOTTOM + height / 2, 0);

  return line;
}

function buildColumns(structure) {
  const group = new THREE.Group();
  const height = BUILD_TOP - BUILD_BOTTOM;

  const geometry = new THREE.CylinderGeometry(0.14, 0.14, height, 8);

  const material = new THREE.MeshStandardMaterial({
    color: COLOR.line,
    roughness: 0.9,
  });

  (structure.columnGrid?.xs || []).forEach((x) => {
    (structure.columnGrid?.ys || []).forEach((y) => {
      const mesh = new THREE.Mesh(geometry, material);
      const [sx, sy, sz] = toScene(x, y, BUILD_BOTTOM + height / 2);

      mesh.position.set(sx, sy, sz);
      group.add(mesh);
    });
  });

  return group;
}

function buildCore(core) {
  const height = BUILD_TOP - BUILD_BOTTOM;
  const w = core.x[1] - core.x[0];
  const d = core.y[1] - core.y[0];

  const geometry = new THREE.BoxGeometry(w, height, d);

  const material = new THREE.MeshStandardMaterial({
    color: COLOR.ink,
    transparent: true,
    opacity: 0.5,
    roughness: 1,
  });

  const mesh = new THREE.Mesh(geometry, material);

  const cx = (core.x[0] + core.x[1]) / 2;
  const cy = (core.y[0] + core.y[1]) / 2;

  const [sx, sy, sz] = toScene(cx, cy, BUILD_BOTTOM + height / 2);

  mesh.position.set(sx, sy, sz);

  return mesh;
}

function buildSlabMesh(floor, isSelected) {
  const [z0, z1] = floor.z;
  const height = z1 - z0;

  const geometry = new THREE.BoxGeometry(
    FOOTPRINT_LEN - 0.4,
    height - 0.3,
    FOOTPRINT_WID - 0.4,
  );

  const baseColor = floor.kind === "parking" ? COLOR.line : COLOR.muted;

  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
    transparent: true,
    opacity: isSelected ? 0.55 : 0.16,
    roughness: 0.8,
  });

  const mesh = new THREE.Mesh(geometry, material);

  const [sx, sy, sz] = toScene(
    FOOTPRINT_LEN / 2,
    FOOTPRINT_WID / 2,
    z0 + height / 2,
  );

  mesh.position.set(sx, sy, sz);
  mesh.userData = {
    selectable: true,
    floorId: floor.id,
  };

  return mesh;
}

function unitColor(unit) {
  if (unit.status === "disputed") return COLOR.alert;
  if (unit.status === "vacant") return COLOR.ok;
  if (unit.mortgages.length > 0) return COLOR.brass;
  return COLOR.paper;
}

function buildUnitMesh(floor, unit, isFloorSelected, isUnitSelected) {
  const [z0, z1] = floor.z;
  const height = z1 - z0;

  const w = unit.bounds.x[1] - unit.bounds.x[0];
  const d = unit.bounds.y[1] - unit.bounds.y[0];

  const geometry = new THREE.BoxGeometry(w - 0.5, height - 0.3, d - 0.5);

  let opacity = 0.1;

  if (isFloorSelected) opacity = 0.45;
  if (isUnitSelected) opacity = 0.9;

  const material = new THREE.MeshStandardMaterial({
    color: unitColor(unit),
    transparent: true,
    opacity,
    roughness: 0.6,
    emissive: isUnitSelected ? unitColor(unit) : 0x000000,
    emissiveIntensity: isUnitSelected ? 0.35 : 0,
  });

  const mesh = new THREE.Mesh(geometry, material);

  const cx = (unit.bounds.x[0] + unit.bounds.x[1]) / 2;
  const cy = (unit.bounds.y[0] + unit.bounds.y[1]) / 2;

  const [sx, sy, sz] = toScene(cx, cy, z0 + height / 2);

  mesh.position.set(sx, sy, sz);

  mesh.userData = {
    selectable: true,
    floorId: floor.id,
    unitId: unit.id,
  };

  if (isUnitSelected) {
    const edges = new THREE.EdgesGeometry(geometry);

    const outline = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: COLOR.brass,
      }),
    );

    mesh.add(outline);
  }

  return mesh;
}
