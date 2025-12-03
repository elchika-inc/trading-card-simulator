import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { type Assets, type CardAsset, SoundEffects } from "./constants";
import { fragmentShader, vertexShader } from "./shaders";

interface ThreeExperienceProps {
  cards: CardAsset[];
  assets: Assets;
  onComplete: () => void;
}

export function ThreeExperience({
  cards,
  assets,
  onComplete,
}: ThreeExperienceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [statusText, setStatusText] = useState("スワイプで選んでタップ");
  const [cursorClass, setCursorClass] = useState("cursor-grab");

  // Refs
  const stateRef = useRef("SELECTION"); // SELECTION, SELECT_ANIM, PACK_IDLE, ...
  const isInteractableRef = useRef(true);
  const startTimeRef = useRef(0);

  // Selection specific refs
  const carouselGroupRef = useRef<THREE.Group | null>(null);
  const packMeshesRef = useRef<THREE.Group[]>([]);
  const targetCarouselRotationRef = useRef(0);

  // Opening/Card specific refs
  const mainPackGroupRef = useRef<THREE.Group | null>(null);
  const startRotationRef = useRef({ x: 0, y: 0 });
  const packRotationRef = useRef({ x: 0, y: 0 }); // Idle tilt
  const currentCardIndexRef = useRef(0);

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);

    const loader = new THREE.TextureLoader();

    // --- Geometry Generators ---
    const createPillowGeometry = (
      w: number,
      h: number,
      depth: number,
      opts: { openTop?: boolean; openBottom?: boolean; flipZ?: boolean } = {}
    ) => {
      const geo = new THREE.PlaneGeometry(w, h, 32, 32);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = x / (w / 2);
        const ny = y / (h / 2);
        const zFactorX = Math.pow(Math.cos(nx * (Math.PI / 2)), 0.1);
        let zFactorY = 1.0;
        if (opts.openTop && !opts.openBottom) {
          const angle = (ny - 1) * (Math.PI / 4);
          zFactorY = Math.cos(angle);
        } else if (!opts.openTop && opts.openBottom) {
          const angle = (ny + 1) * (Math.PI / 4);
          zFactorY = Math.cos(angle);
        } else if (!opts.openTop && !opts.openBottom) {
          zFactorY = Math.cos(ny * (Math.PI / 2));
        }
        let z = depth * zFactorX * Math.pow(zFactorY, 0.6);
        if (opts.flipZ) z = -z;
        pos.setZ(i, z);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const packW = 3.5;
    const packH = 6.0;
    const packDepth = 0.15;

    // --- 1. Selection Carousel ---
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);
    carouselGroupRef.current = carouselGroup;

    // Create dummy packs for selection
    const dummyPacks: THREE.Group[] = [];
    const packCount = 8;
    const radius = 6.5;

    const dummyGeoFront = createPillowGeometry(packW, packH, packDepth);
    const dummyGeoBack = createPillowGeometry(packW, packH, packDepth);
    const dummyGeoInside = createPillowGeometry(packW, packH, packDepth * 0.9);

    const dummyTex = loader.load(assets.pack.file);
    dummyTex.colorSpace = THREE.SRGBColorSpace;
    const dummyBackTex = loader.load(assets.packBack.file);
    dummyBackTex.colorSpace = THREE.SRGBColorSpace;

    const dummyMatFront = new THREE.MeshBasicMaterial({ map: dummyTex });
    const dummyMatBack = new THREE.MeshBasicMaterial({ map: dummyBackTex });
    const dummyMatInside = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

    for (let i = 0; i < packCount; i++) {
      const group = new THREE.Group();

      // Front
      const front = new THREE.Mesh(dummyGeoFront, dummyMatFront);
      front.position.z = 0.005;
      group.add(front);

      // Back
      const back = new THREE.Mesh(dummyGeoBack, dummyMatBack);
      back.position.z = -0.005;
      back.rotation.y = Math.PI;
      group.add(back);

      // Inside
      const inside = new THREE.Mesh(dummyGeoInside, dummyMatInside);
      inside.scale.z = 0.1;
      group.add(inside);

      const insideF = new THREE.Mesh(dummyGeoInside, dummyMatInside);
      insideF.position.z = 0.004;
      insideF.scale.z = -1;
      group.add(insideF);

      const insideB = new THREE.Mesh(dummyGeoInside, dummyMatInside);
      insideB.position.z = -0.004;
      insideB.rotation.y = Math.PI;
      insideB.scale.z = -1;
      group.add(insideB);

      const angle = (i / packCount) * Math.PI * 2;
      group.position.x = Math.sin(angle) * radius;
      group.position.z = Math.cos(angle) * radius;
      group.rotation.y = angle;

      group.userData = { id: i };
      carouselGroup.add(group);
      dummyPacks.push(group);
    }
    packMeshesRef.current = dummyPacks;

    carouselGroup.position.z = -radius;

    // --- 2. Main Interactive Pack (Initially Hidden) ---
    const mainPackGroup = new THREE.Group();
    mainPackGroup.visible = false;
    scene.add(mainPackGroup);
    mainPackGroupRef.current = mainPackGroup;

    // Pack Back
    const packBackGeo = createPillowGeometry(packW, packH, packDepth);
    const packBackMat = new THREE.MeshBasicMaterial({
      map: dummyBackTex,
      side: THREE.FrontSide,
    });
    const packBack = new THREE.Mesh(packBackGeo, packBackMat);
    packBack.position.z = -0.005;
    packBack.rotation.y = Math.PI;
    mainPackGroup.add(packBack);

    // Inside Linings
    const packInsideGeo = createPillowGeometry(packW, packH, packDepth);
    const packInsideMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      side: THREE.FrontSide,
    });
    const packInside = new THREE.Mesh(packInsideGeo, packInsideMat);
    packInside.scale.z = -1;
    packInside.position.z = 0;
    mainPackGroup.add(packInside);

    // Front Split Parts
    const splitRatio = 0.15;
    const topH = packH * splitRatio;
    const botH = packH * (1 - splitRatio);

    // Clone textures for offset
    const botTex = dummyTex.clone();
    botTex.offset.y = 0;
    botTex.repeat.y = 1 - splitRatio;
    const topTex = dummyTex.clone();
    topTex.offset.y = 1 - splitRatio;
    topTex.repeat.y = splitRatio;

    // Bottom
    const botGeo = createPillowGeometry(packW, botH, packDepth, {
      openTop: true,
    });
    const botMat = new THREE.MeshBasicMaterial({
      map: botTex,
      side: THREE.FrontSide,
    });
    const packBottom = new THREE.Mesh(botGeo, botMat);
    packBottom.position.y = -packH / 2 + botH / 2;
    packBottom.position.z = 0.005;
    mainPackGroup.add(packBottom);

    // Bottom Inside
    const botInsideMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      side: THREE.FrontSide,
    });
    const packBottomInside = new THREE.Mesh(botGeo, botInsideMat);
    packBottomInside.position.y = -packH / 2 + botH / 2;
    packBottomInside.position.z = 0;
    packBottomInside.rotation.y = Math.PI;
    packBottomInside.scale.z = -1;
    mainPackGroup.add(packBottomInside);

    // Top
    const topGeo = createPillowGeometry(packW, topH, packDepth, {
      openBottom: true,
    });
    const topMat = new THREE.MeshBasicMaterial({
      map: topTex,
      side: THREE.FrontSide,
    });
    const packTop = new THREE.Mesh(topGeo, topMat);
    packTop.position.y = packH / 2 - topH / 2;
    packTop.position.z = 0.005;
    mainPackGroup.add(packTop);

    // Top Inside
    const topInsideMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      side: THREE.FrontSide,
    });
    const packTopInside = new THREE.Mesh(topGeo, topInsideMat);
    packTopInside.position.y = packH / 2 - topH / 2;
    packTopInside.position.z = 0;
    packTopInside.rotation.y = Math.PI;
    packTopInside.scale.z = -1;
    mainPackGroup.add(packTopInside);

    // Cards
    const cardsGroup = new THREE.Group();
    cardsGroup.position.z = 0;
    cardsGroup.position.y = -0.5;
    cardsGroup.scale.setScalar(0.85);
    mainPackGroup.add(cardsGroup);

    // Card Meshes
    const cardW = 3.0;
    const cardH = cardW * 1.45;
    const cardGeo = new THREE.BoxGeometry(cardW, cardH, 0.02);
    const cardBackTex = loader.load(assets.cardBack.file);
    cardBackTex.colorSpace = THREE.SRGBColorSpace;
    const cardBackMat = new THREE.MeshBasicMaterial({ map: cardBackTex });
    const sideMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });

    const meshes: THREE.Mesh[] = [];
    cards.forEach((data, i) => {
      const tex = loader.load(data.file);
      tex.colorSpace = THREE.SRGBColorSpace;
      const frontMat = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          isRare: { value: data.isRare ? 1.0 : 0.0 },
          time: { value: 0.0 },
          opacity: { value: 1.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
      });
      const mats = [sideMat, sideMat, sideMat, sideMat, frontMat, cardBackMat];
      const mesh = new THREE.Mesh(cardGeo, mats);
      mesh.rotation.y = Math.PI;
      mesh.position.z = -i * 0.02;
      mesh.userData = {
        index: i,
        isRare: data.isRare,
        state: "deck",
        originalZ: -i * 0.02,
      };
      cardsGroup.add(mesh);
      meshes.push(mesh);
    });

    // --- Interaction Logic ---
    const handleInteractionStart = (clientX: number, clientY: number) => {
      if (!isInteractableRef.current) return;
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: clientX, y: clientY };
      dragStartRef.current = { x: clientX, y: clientY };
      setCursorClass("cursor-grabbing");
    };

    const handleInteractionMove = (clientX: number, clientY: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseRef.current = {
        x: (clientX / w) * 2 - 1,
        y: -(clientY / h) * 2 + 1,
      };

      if (isDraggingRef.current) {
        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;

        if (stateRef.current === "SELECTION") {
          targetCarouselRotationRef.current += deltaX * 0.005;
        } else if (stateRef.current === "PACK_IDLE") {
          packRotationRef.current.y += deltaX * 0.01;
          packRotationRef.current.x += deltaY * 0.01;
          packRotationRef.current.x = Math.max(
            -0.5,
            Math.min(0.5, packRotationRef.current.x)
          );
        }
        previousMousePositionRef.current = { x: clientX, y: clientY };
      }
    };

    const handleInteractionEnd = (clientX: number, clientY: number) => {
      if (!isInteractableRef.current) return;
      isDraggingRef.current = false;
      setCursorClass("cursor-grab");

      const dist = Math.sqrt(
        Math.pow(clientX - dragStartRef.current.x, 2) +
          Math.pow(clientY - dragStartRef.current.y, 2)
      );

      if (dist < 10) handleTapAction();
    };

    const handleTapAction = () => {
      if (stateRef.current === "SELECTION") {
        const seg = (Math.PI * 2) / packCount;
        let index =
          Math.round(-carouselGroupRef.current!.rotation.y / seg) % packCount;
        if (index < 0) index += packCount;

        targetCarouselRotationRef.current = -index * seg;

        SoundEffects.playSelect();

        stateRef.current = "SELECT_ANIM";
        startTimeRef.current = performance.now() * 0.001;
        isInteractableRef.current = false;
      } else if (stateRef.current === "PACK_IDLE") {
        SoundEffects.playRip();
        startRotationRef.current = {
          x: mainPackGroup.rotation.x,
          y: mainPackGroup.rotation.y,
        };
        stateRef.current = "RESET_ROTATION";
        startTimeRef.current = performance.now() * 0.001;
        setStatusText("");
        isInteractableRef.current = false;
        setCursorClass("cursor-default");
      } else if (stateRef.current === "CARD_INTERACTION") {
        const idx = currentCardIndexRef.current;
        if (idx >= meshes.length) return;

        const card = meshes[idx];
        if (card.userData.state === "deck") {
          SoundEffects.playFlip();
          if (card.userData.isRare) SoundEffects.playRare();
          card.userData.state = "flipping";

          const startRot = card.rotation.y;
          const endRot = 0;
          const startZ = card.position.z;
          const targetZ = 2.0;
          const startY = card.position.y;
          const targetY = 0.8;

          const startTime = performance.now();
          const duration = 500;

          const animateFlip = () => {
            const now = performance.now();
            const p = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            card.rotation.y = startRot + (endRot - startRot) * ease;
            const zOffset = Math.sin(p * Math.PI) * 1.5;
            card.position.z = startZ + (targetZ - startZ) * ease + zOffset;
            card.position.y = startY + (targetY - startY) * ease;

            if (p < 1) requestAnimationFrame(animateFlip);
            else {
              card.userData.state = "flipped";
              card.position.z = targetZ;
              card.position.y = targetY;
            }
          };
          animateFlip();
        } else if (card.userData.state === "flipped") {
          card.userData.state = "done";
          currentCardIndexRef.current++;
          if (currentCardIndexRef.current >= meshes.length)
            setTimeout(onComplete, 800);
        }
      }
    };

    const canvas = renderer.domElement;
    const onMouseDown = (e: MouseEvent) =>
      handleInteractionStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) =>
      handleInteractionMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) =>
      handleInteractionEnd(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0)
        handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0)
        handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      handleInteractionEnd(
        previousMousePositionRef.current.x,
        previousMousePositionRef.current.y
      );
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    let animationFrameId: number;
    const animate = () => {
      const time = performance.now() * 0.001;

      for (const mesh of meshes) {
        const materials = mesh.material as THREE.Material[];
        if (materials[4] && (materials[4] as THREE.ShaderMaterial).uniforms) {
          (materials[4] as THREE.ShaderMaterial).uniforms.time.value = time;
        }
      }

      // --- STATE MACHINE ---

      // 0. Selection Phase
      if (stateRef.current === "SELECTION") {
        carouselGroup.rotation.y +=
          (targetCarouselRotationRef.current - carouselGroup.rotation.y) * 0.1;

        dummyPacks.forEach((p, i) => {
          p.position.y = Math.sin(time * 2 + i) * 0.2;
        });
      }

      // 0.5 Transition Selection -> Idle
      if (stateRef.current === "SELECT_ANIM") {
        const elapsed = time - startTimeRef.current;
        const t = Math.min(elapsed / 1.0, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);

        carouselGroup.rotation.y +=
          (targetCarouselRotationRef.current - carouselGroup.rotation.y) * 0.2;

        const seg = (Math.PI * 2) / packCount;
        let index =
          Math.round(-targetCarouselRotationRef.current / seg) % packCount;
        if (index < 0) index += packCount;

        dummyPacks.forEach((p, i) => {
          if (i !== index) {
            p.position.y += ease * 0.1;
            p.position.multiplyScalar(1.0 + ease * 0.05);
            p.scale.setScalar(1 - t);
          } else {
            p.position.y = Math.sin(time * 2 + i) * 0.2 * (1 - t);
            p.scale.setScalar(1 + t * 0.0);
          }
        });

        if (t >= 1.0) {
          stateRef.current = "PACK_IDLE";
          carouselGroup.visible = false;
          mainPackGroup.visible = true;
          setStatusText("パックをタップして開封");
          isInteractableRef.current = true;
        }
      }

      // 1. Pack Idle
      if (stateRef.current === "PACK_IDLE") {
        mainPackGroup.rotation.y +=
          (packRotationRef.current.y - mainPackGroup.rotation.y) * 0.1;
        mainPackGroup.rotation.x +=
          (packRotationRef.current.x - mainPackGroup.rotation.x) * 0.1;
        mainPackGroup.position.y = Math.sin(time * 1.5) * 0.1;
      }

      // 1.5 Reset Rotation
      if (stateRef.current === "RESET_ROTATION") {
        const elapsed = time - startTimeRef.current;
        const t = Math.min(elapsed / 0.5, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);

        mainPackGroup.rotation.x = startRotationRef.current.x * (1 - ease);
        mainPackGroup.rotation.y = startRotationRef.current.y * (1 - ease);
        mainPackGroup.position.y = Math.sin(time * 1.5) * 0.1 * (1 - ease);

        if (t >= 1.0) {
          stateRef.current = "OPENING";
          startTimeRef.current = time;
          mainPackGroup.rotation.set(0, 0, 0);
          packRotationRef.current = { x: 0, y: 0 };
        }
      }

      // 2. Opening
      if (stateRef.current === "OPENING") {
        const elapsed = time - startTimeRef.current;
        packTop.position.y += 0.15;
        packTop.position.z -= 0.1;
        packTop.rotation.x -= 0.2;
        packTop.rotation.z += 0.05;

        packTopInside.position.copy(packTop.position);
        packTopInside.rotation.copy(packTop.rotation);

        if (elapsed > 0.5) {
          stateRef.current = "CARDS_RISING";
          startTimeRef.current = time;
          packTop.visible = false;
          packTopInside.visible = false;
        }
      }

      // 3. Cards Rising
      if (stateRef.current === "CARDS_RISING") {
        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / 1.0, 1.0);
        const ease = 1 - Math.pow(1 - progress, 3);

        const startY = -0.5;
        const endY = 2.5;
        cardsGroup.position.y = startY + (endY - startY) * ease;

        mainPackGroup.position.y = -ease * 1.0;
        mainPackGroup.scale.setScalar(1.0 - ease * 0.1);

        if (progress >= 1.0) {
          stateRef.current = "CARDS_ZOOMING";
          startTimeRef.current = time;
        }
      }

      // 4. Zooming
      if (stateRef.current === "CARDS_ZOOMING") {
        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / 0.8, 1.0);
        const ease = 1 - Math.pow(1 - progress, 4);

        mainPackGroup.position.y = -1.0 - ease * 5.0;
        cardsGroup.position.y = 2.5 + ease * 3.5;
        cardsGroup.position.z = ease * 2.0;
        cardsGroup.scale.setScalar(0.9 + ease * 0.1);

        if (progress >= 1.0) {
          stateRef.current = "CARD_INTERACTION";
          setStatusText("タップしてめくる");
          isInteractableRef.current = true;
          setCursorClass("cursor-pointer");
        }
      }

      // 5. Card Interaction
      if (stateRef.current === "CARD_INTERACTION") {
        const currentIndex = currentCardIndexRef.current;
        const tiltX = mouseRef.current.y * 0.2;
        const tiltY = mouseRef.current.x * 0.2;

        meshes.forEach((mesh, i) => {
          if (mesh.userData.state === "done") {
            mesh.position.x += -0.2;
            mesh.rotation.y -= 0.1;
            mesh.position.z -= 0.1;
            return;
          }

          if (i === currentIndex) {
            if (mesh.userData.state === "flipping") return;

            if (mesh.userData.state === "deck") {
              const targetZ = 0.5;
              mesh.position.z += (targetZ - mesh.position.z) * 0.1;
              mesh.position.y = Math.sin(time * 2) * 0.05;
              mesh.rotation.x = tiltX;
              mesh.rotation.y = Math.PI + tiltY * 0.5;
            } else if (mesh.userData.state === "flipped") {
              const targetZ = 2.0;
              const targetY = 0.8;

              mesh.position.z += (targetZ - mesh.position.z) * 0.1;
              mesh.position.y += (targetY - mesh.position.y) * 0.1;

              mesh.rotation.x = tiltX;
              mesh.rotation.y = tiltY;
            }
          } else if (i > currentIndex) {
            const targetZ = -0.5 - (i - currentIndex) * 0.02;
            mesh.position.z += (targetZ - mesh.position.z) * 0.1;
            mesh.rotation.x = 0;
            mesh.rotation.y = Math.PI;
            mesh.position.y = 0;
          }
        });
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      packBackGeo.dispose();
      packInsideGeo.dispose();
      botGeo.dispose();
      topGeo.dispose();
    };
  }, [cards, assets, onComplete]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative touch-none ${cursorClass}`}
    >
      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none select-none">
        <p
          className={`text-gray-300 text-lg font-bold drop-shadow-lg transition-opacity duration-500 ${statusText ? "opacity-100" : "opacity-0"}`}
        >
          {statusText}
        </p>
      </div>
    </div>
  );
}
