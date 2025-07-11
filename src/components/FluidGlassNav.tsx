/* eslint-disable react/no-unknown-property */
import * as THREE from "three";
import { useRef, useState, useEffect, memo, ReactNode } from "react";
import {
  Canvas,
  createPortal,
  useFrame,
  useThree,
  ThreeElements,
} from "@react-three/fiber";
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text,
} from "@react-three/drei";
import { easing } from "maath";
import { useNavigate } from "react-router-dom";

type Mode = "lens" | "bar" | "cube";

interface NavItem {
  label: string;
  link: string;
}

type ModeProps = Record<string, unknown>;

interface FluidGlassProps {
  mode?: Mode;
  lensProps?: ModeProps;
  barProps?: ModeProps;
  cubeProps?: ModeProps;
}

export default function FluidGlassNav({
  mode = "bar",
  lensProps = {},
  barProps = {},
  cubeProps = {},
}: FluidGlassProps) {
  const Wrapper = mode === "bar" ? Bar : mode === "cube" ? Cube : Lens;
  const rawOverrides =
    mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;

  const {
    navItems = [
      { label: "Anasayfa", link: "/" },
      { label: "Profil", link: "/profile" },
      { label: "Matches", link: "/matches" },
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        <ScrollControls damping={0.2} pages={1} distance={0.4}>
          {mode === "bar" && <NavItems items={navItems as NavItem[]} />}
          <Wrapper modeProps={modeProps}>
            <Scroll />
            <Scroll html />
            <Preload />
          </Wrapper>
        </ScrollControls>
      </Canvas>
    </div>
  );
}

type MeshProps = ThreeElements["mesh"];

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
}

interface ZoomMaterial extends THREE.Material {
  zoom: number;
}

interface ZoomMesh extends THREE.Mesh<THREE.BufferGeometry, ZoomMaterial> {}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState<THREE.Scene>(() => new THREE.Scene());
  const geoWidthRef = useRef<number>(1);

  // Create simple geometry if GLB fails to load
  const [geometry, setGeometry] = useState<THREE.BufferGeometry>();

  useEffect(() => {
    try {
      const { nodes } = useGLTF(glb);
      const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
      if (geo) {
        geo.computeBoundingBox();
        geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
        setGeometry(geo);
      } else {
        throw new Error("GLB not found");
      }
    } catch (error) {
      console.warn("GLB failed to load, using fallback geometry");
      const fallbackGeo = new THREE.BoxGeometry(6, 0.5, 1);
      fallbackGeo.computeBoundingBox();
      geoWidthRef.current = fallbackGeo.boundingBox!.max.x - fallbackGeo.boundingBox!.min.x || 6;
      setGeometry(fallbackGeo);
    }
  }, [glb, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom
      ? -v.height / 2 + 0.2
      : followPointer
        ? (pointer.y * v.height) / 2
        : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if ((modeProps as { scale?: number }).scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
  });

  const {
    scale,
    ior,
    thickness,
    anisotropy,
    chromaticAberration,
    ...extraMat
  } = modeProps as {
    scale?: number;
    ior?: number;
    thickness?: number;
    anisotropy?: number;
    chromaticAberration?: number;
    [key: string]: unknown;
  };

  if (!geometry) return null;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...(typeof extraMat === "object" && extraMat !== null
            ? extraMat
            : {})}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps } & MeshProps) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: "#ffffff",
    attenuationColor: "#ffffff",
    attenuationDistance: 0.25,
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }: { items: NavItem[] }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport, camera } = useThree();
  const navigate = useNavigate();

  const DEVICE = {
    mobile: { max: 639, spacing: 1.2, fontSize: 0.08 },
    tablet: { max: 1023, spacing: 1.5, fontSize: 0.1 },
    desktop: { max: Infinity, spacing: 2.0, fontSize: 0.12 },
  };
  
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max
      ? "mobile"
      : w <= DEVICE.tablet.max
        ? "tablet"
        : "desktop";
  };

  const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link) return;
    if (link.startsWith("#")) {
      window.location.hash = link;
    } else {
      navigate(link);
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.8}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}