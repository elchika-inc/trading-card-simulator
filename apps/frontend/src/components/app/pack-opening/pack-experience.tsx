import type { Card } from "@repo/types";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getImageUrl } from "@/lib/api-client";

interface PackAssets {
  pack: { file: string; fallback: string };
  packBack: { file: string; fallback: string };
  cardBack: { file: string; fallback: string };
}

interface PackExperienceProps {
  cards: Card[];
  assets: PackAssets;
  onCardsReady: () => void;
}

const SoundEffects = {
  playRip: () => console.log("Sound:ビリッ"),
  playSelect: () => console.log("Sound:ポチッ"),
};

/**
 * パック選択・開封までのThree.js体験コンポーネント
 * カードめくりは別コンポーネント（PackInspecting）で行う
 */
export function PackExperience({ cards, assets, onCardsReady }: PackExperienceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [statusText, setStatusText] = useState("スワイプで選んでタップ");
  const [cursorClass, setCursorClass] = useState("cursor-grab");
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const stateRef = useRef("SELECTION");
  const isInteractableRef = useRef(false); // ローディング完了までインタラクション無効
  const startTimeRef = useRef(0);

  // Selection specific refs
  const carouselGroupRef = useRef<THREE.Group | null>(null);
  const targetCarouselRotationRef = useRef(0);

  // Opening specific refs
  const startRotationRef = useRef({ x: 0, y: 0 });
  const packRotationRef = useRef({ x: 0, y: 0 });

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });

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

    // LoadingManagerで全テクスチャの読み込みを管理
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = () => {
      setIsLoading(false);
      isInteractableRef.current = true; // ローディング完了後にインタラクション有効化
    };
    const loader = new THREE.TextureLoader(loadingManager);

    // --- Geometry Generators ---
    const createPillowGeometry = (
      w: number,
      h: number,
      depth: number,
      opts: { openTop?: boolean; openBottom?: boolean; flipZ?: boolean } = {},
    ) => {
      const geo = new THREE.PlaneGeometry(w, h, 32, 32);
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = x / (w / 2);
        const ny = y / (h / 2);
        const zFactorX = Math.cos(nx * (Math.PI / 2)) ** 0.1;
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
        let z = depth * zFactorX * zFactorY ** 0.6;
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

      const front = new THREE.Mesh(dummyGeoFront, dummyMatFront);
      front.position.z = 0.005;
      group.add(front);

      const back = new THREE.Mesh(dummyGeoBack, dummyMatBack);
      back.position.z = -0.005;
      back.rotation.y = Math.PI;
      group.add(back);

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
    carouselGroup.position.z = -radius;

    // --- 2. Main Interactive Pack (Initially Hidden) ---
    const mainPackGroup = new THREE.Group();
    mainPackGroup.visible = false;
    scene.add(mainPackGroup);

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

    // Cards (just for visual during opening)
    const cardsGroup = new THREE.Group();
    cardsGroup.position.z = 0;
    cardsGroup.position.y = -0.5;
    cardsGroup.scale.setScalar(0.85);
    mainPackGroup.add(cardsGroup);

    // Card Meshes (back only for opening animation)
    const cardW = 3.0;
    const cardH = cardW * 1.45;
    const cardGeo = new THREE.BoxGeometry(cardW, cardH, 0.02);
    const cardBackTex = loader.load(assets.cardBack.file);
    cardBackTex.colorSpace = THREE.SRGBColorSpace;
    const cardBackMat = new THREE.MeshBasicMaterial({ map: cardBackTex });
    const sideMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });

    cards.forEach((data, i) => {
      const tex = loader.load(getImageUrl(data.image, { format: "webp" }));
      tex.colorSpace = THREE.SRGBColorSpace;
      const frontMat = new THREE.MeshBasicMaterial({ map: tex });
      const mats = [sideMat, sideMat, sideMat, sideMat, frontMat, cardBackMat];
      const mesh = new THREE.Mesh(cardGeo, mats);
      mesh.rotation.y = Math.PI; // Show back initially
      mesh.position.z = -i * 0.02;
      cardsGroup.add(mesh);
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
      if (isDraggingRef.current) {
        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;

        if (stateRef.current === "SELECTION") {
          targetCarouselRotationRef.current += deltaX * 0.005;
        } else if (stateRef.current === "PACK_IDLE") {
          packRotationRef.current.y += deltaX * 0.01;
          packRotationRef.current.x += deltaY * 0.01;
          packRotationRef.current.x = Math.max(-0.5, Math.min(0.5, packRotationRef.current.x));
        }
        previousMousePositionRef.current = { x: clientX, y: clientY };
      }
    };

    const handleInteractionEnd = (clientX: number, clientY: number) => {
      if (!isInteractableRef.current) return;
      isDraggingRef.current = false;
      setCursorClass("cursor-grab");

      const dist = Math.sqrt(
        (clientX - dragStartRef.current.x) ** 2 + (clientY - dragStartRef.current.y) ** 2,
      );

      if (dist < 10) handleTapAction();
    };

    const handleTapAction = () => {
      if (stateRef.current === "SELECTION") {
        const seg = (Math.PI * 2) / packCount;
        const rotationY = carouselGroupRef.current?.rotation.y ?? 0;
        let index = Math.round(-rotationY / seg) % packCount;
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
      }
    };

    const canvas = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => handleInteractionStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handleInteractionEnd(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleInteractionStart(touch.clientX, touch.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleInteractionMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
      handleInteractionEnd(previousMousePositionRef.current.x, previousMousePositionRef.current.y);
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
        const ease = 1 - (1 - t) ** 3;

        carouselGroup.rotation.y +=
          (targetCarouselRotationRef.current - carouselGroup.rotation.y) * 0.2;

        const seg = (Math.PI * 2) / packCount;
        let index = Math.round(-targetCarouselRotationRef.current / seg) % packCount;
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
        mainPackGroup.rotation.y += (packRotationRef.current.y - mainPackGroup.rotation.y) * 0.1;
        mainPackGroup.rotation.x += (packRotationRef.current.x - mainPackGroup.rotation.x) * 0.1;
        mainPackGroup.position.y = Math.sin(time * 1.5) * 0.1;
      }

      // 1.5 Reset Rotation
      if (stateRef.current === "RESET_ROTATION") {
        const elapsed = time - startTimeRef.current;
        const t = Math.min(elapsed / 0.5, 1.0);
        const ease = 1 - (1 - t) ** 3;

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
        const ease = 1 - (1 - progress) ** 3;

        const startY = -0.5;
        const endY = 1; // カードめくり画面と位置を合わせる
        cardsGroup.position.y = startY + (endY - startY) * ease;

        mainPackGroup.position.y = -ease * 1.0;
        mainPackGroup.scale.setScalar(1.0 - ease * 0.1);

        if (progress >= 1.0) {
          stateRef.current = "CARDS_ZOOMING";
          startTimeRef.current = time;
        }
      }

      // 4. Cards fade out upward, pack fades out downward
      if (stateRef.current === "CARDS_ZOOMING") {
        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / 0.8, 1.0);
        const ease = 1 - (1 - progress) ** 2;

        // 最初のフレームでカードをシーン直下に移動（パックから切り離す）
        if (elapsed < 0.02 && cardsGroup.parent === mainPackGroup) {
          // ワールド座標とスケールを取得
          const worldPos = new THREE.Vector3();
          const worldScale = new THREE.Vector3();
          cardsGroup.getWorldPosition(worldPos);
          cardsGroup.getWorldScale(worldScale);
          // シーン直下に移動
          scene.add(cardsGroup);
          cardsGroup.position.copy(worldPos);
          cardsGroup.scale.copy(worldScale);
        }

        // カードを上方向に移動しながらフェードアウト
        cardsGroup.position.y = 1 + ease * 5.0;
        cardsGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const mat of mats) {
              if (mat instanceof THREE.MeshBasicMaterial) {
                mat.transparent = true;
                mat.opacity = 1 - ease;
              }
            }
          }
        });

        // パックを下方向に移動しながらフェードアウト
        mainPackGroup.position.y = -1.0 - ease * 5.0;
        mainPackGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material;
            if (mat instanceof THREE.MeshBasicMaterial) {
              mat.transparent = true;
              mat.opacity = 1 - ease;
            }
          }
        });

        // 完全にフェードアウトしたら遷移
        if (progress >= 1.0) {
          mainPackGroup.visible = false;
          cardsGroup.visible = false;
          stateRef.current = "COMPLETE";
          onCardsReady();
        }
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
  }, [cards, assets, onCardsReady]);

  return (
    <div ref={mountRef} className={`w-full h-full relative touch-none ${cursorClass}`}>
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">読み込み中...</p>
          </div>
        </div>
      )}

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
