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

function disposeGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse?.((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose?.());
      } else {
        object.material?.dispose?.();
      }
    });
  }
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
    camera.position.set(62, 40, 62);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 7, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 26;
    controls.maxDistance = 125;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.update();

    scene.add(new THREE.HemisphereLight(0xffffff, COLOR.ink, 1.5));

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(45, 65, 35);
    scene.add(key);

    const fill = new THREE.DirectionalLight(COLOR.muted, 0.35);
    fill.position.set(-35, 25, -40);
    scene.add(fill);

    const ground = new THREE.GridHelper(110, 22, COLOR.line, COLOR.line);
    ground.position.y = BUILD_BOTTOM - 0.01;
    ground.material.transparent = true;
    ground.material.opacity = 0.22;
    scene.add(ground);

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
      if (unitId) stateRef.current.onSelectUnit?.(floorId, unitId);
      else stateRef.current.onSelectFloor?.(floorId);
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
      disposeGroup(modelGroup);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    stateRef.current.onSelectFloor = onSelectFloor;
    stateRef.current.onSelectUnit = onSelectUnit;
  }, [onSelectFloor, onSelectUnit]);

  useEffect(() => {
    const { modelGroup } = stateRef.current;
    if (!modelGroup || !structure) return;

    disposeGroup(modelGroup);
    modelGroup.add(buildShell());
    modelGroup.add(buildColumns(structure));

    (structure.cores || []).forEach((core) => modelGroup.add(buildCore(core)));

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
      className="w-full h-105 lg:h-full min-h-105 border border-line bg-[#eaf0ef]/40 overflow-hidden"
    />
  );
}

function buildShell() {
  const geometry = new THREE.BoxGeometry(
    FOOTPRINT_LEN,
    BUILD_TOP - BUILD_BOTTOM,
    FOOTPRINT_WID,
  );
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({
    color: COLOR.muted,
    transparent: true,
    opacity: 0.34,
  });
  const line = new THREE.LineSegments(edges, material);
  line.position.y = (BUILD_TOP + BUILD_BOTTOM) / 2;
  line.renderOrder = 5;
  return line;
}

function buildColumns(structure) {
  const group = new THREE.Group();
  const height = BUILD_TOP - BUILD_BOTTOM;
  const geometry = new THREE.CylinderGeometry(0.11, 0.11, height, 8);
  const material = new THREE.MeshStandardMaterial({
    color: COLOR.line,
    roughness: 0.85,
    metalness: 0.05,
    transparent: true,
    opacity: 0.48,
  });

  (structure.columnGrid?.xs || []).forEach((x) => {
    (structure.columnGrid?.ys || []).forEach((y) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...toScene(x, y, BUILD_BOTTOM + height / 2));
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
    opacity: 0.3,
    roughness: 0.92,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const cx = (core.x[0] + core.x[1]) / 2;
  const cy = (core.y[0] + core.y[1]) / 2;
  mesh.position.set(...toScene(cx, cy, BUILD_BOTTOM + height / 2));
  return mesh;
}

function buildSlabMesh(floor, isSelected) {
  const [z0, z1] = floor.z;
  const geometry = new THREE.BoxGeometry(
    FOOTPRINT_LEN - 0.8,
    Math.max(0.24, z1 - z0 - 0.5),
    FOOTPRINT_WID - 0.8,
  );
  const material = new THREE.MeshStandardMaterial({
    color: floor.kind === "parking" ? COLOR.line : COLOR.muted,
    transparent: true,
    opacity: isSelected ? 0.34 : 0.08,
    roughness: 0.9,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...toScene(FOOTPRINT_LEN / 2, FOOTPRINT_WID / 2, z0 + (z1 - z0) / 2));
  mesh.userData = { selectable: true, floorId: floor.id };

  const edges = new THREE.EdgesGeometry(geometry);
  const outline = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: COLOR.line,
      transparent: true,
      opacity: 0.22,
    }),
  );
  mesh.add(outline);
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
  const height = Math.max(0.28, z1 - z0 - 0.38);
  const w = unit.bounds.x[1] - unit.bounds.x[0];
  const d = unit.bounds.y[1] - unit.bounds.y[0];
  const geometry = new THREE.BoxGeometry(Math.max(0.5, w - 0.55), height, Math.max(0.5, d - 0.55));
  const color = unitColor(unit);

  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: isUnitSelected ? 0.88 : isFloorSelected ? 0.28 : 0.13,
    roughness: 0.74,
    metalness: 0.02,
    emissive: isUnitSelected ? color : 0x000000,
    emissiveIntensity: isUnitSelected ? 0.16 : 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  const cx = (unit.bounds.x[0] + unit.bounds.x[1]) / 2;
  const cy = (unit.bounds.y[0] + unit.bounds.y[1]) / 2;
  mesh.position.set(...toScene(cx, cy, z0 + height / 2));
  mesh.userData = { selectable: true, floorId: floor.id, unitId: unit.id };

  const edgeColor = isUnitSelected ? COLOR.brass : color;
  const edges = new THREE.EdgesGeometry(geometry);
  const outline = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: isUnitSelected ? 1 : isFloorSelected ? 0.52 : 0.28,
    }),
  );
  outline.userData = { selectable: true, floorId: floor.id, unitId: unit.id };
  mesh.add(outline);

  return mesh;
}
