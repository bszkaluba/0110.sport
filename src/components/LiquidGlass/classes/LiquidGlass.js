import Three from "./Three";
import { debounceWithHooks } from "./helpers";
import { MeshTransmissionMaterial } from "./MeshTransmissionMaterial";
import * as THREE from "three";
import * as lil from "three/addons/libs/lil-gui.module.min.js";
import html2canvas from "html2canvas-pro";
import {
  RoundedBoxGeometry,
  HueSaturationShader,
  ColorCorrectionShader,
  FXAAShader,
} from "three/examples/jsm/Addons.js";
import gsap from "gsap";
import mobileBarVs from "./shaders/mobileBarVs.glsl?raw";
import mobileBarFs from "./shaders/mobileBarFs.glsl?raw";
import pillLayerVs from "./shaders/pillLayerVs.glsl?raw";
import pillLayerFs from "./shaders/pillLayerFs.glsl?raw";
import { clamp, inverseLerp, mapLinear } from "three/src/math/MathUtils.js";

// import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
// import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
// import { SMAAPass } from "three/examples/jsm/Addons.js";

const CAPSULE_PARAMS = {
  // Physical Material
  roughness: 0,
  metalness: 0.0,
  clearcoat: 0.0,
  clearcoatRoughness: 0.0,
  ior: 1.5,
  iridescence: 1,
  iridescenceIOR: 1,
  thickness: 70,
  reflectivity: 0.4,

  // Transition Material
  transmissionSampler: true,
  chromaticAberration: 0.08,
  anisotrophicBlur: 0.0,
  distortion: 0,
  distortionScale: 0.0,
  temporalDistortion: 0,
};

const CARD_PARAMS = {
  // Physical Material
  roughness: 0,
  metalness: 0.04,
  clearcoat: 0.1,
  clearcoatRoughness: 0.05,
  ior: 1.3,
  iridescence: 1,
  iridescenceIOR: 1.4,
  thickness: 124,
  reflectivity: 0.54,

  // Transition Material
  transmissionSampler: true,
  chromaticAberration: 0.25,
  anisotrophicBlur: 0.1,
  distortion: 0,
  distortionScale: 0.0,
  temporalDistortion: 0,
};

const MOBILE_BAR_PARAMS = {
  // Physical Material
  roughness: 0.06,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  ior: 1.27,
  iridescence: 1,
  iridescenceIOR: 1,
  thickness: 208,
  reflectivity: 0.3,

  // Transition Material
  transmissionSampler: true,
  chromaticAberration: 0.15,
  anisotrophicBlur: 0.0,
  distortion: 0,
  distortionScale: 0.0,
  temporalDistortion: 0,
};

const POSTPROCESSING = {
  hue: 0,
  saturation: 0,
};

export default class LiquidGlassMeshes extends Three {
  constructor(domElement) {
    super(domElement);

    this.setResponsivenessValues();
    this.selectReferences();
    this.loadTextures();

    this.setPanel();
    this.setLighting();

    this.setMaterials();
    this.addCapsuleMesh();
    this.addCardMesh();
    this.addMobileBarMesh();

    this.addMobileTexturePlane();
    this.addDesktopTexturePlane();

    // this.addPostprocessing(); // might be needed for color corrections
  }

  setResponsivenessValues() {
    let isTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    let isMobile = () => {
      return window.innerWidth < 1024;
    };

    this.isTouchDevice = isTouchDevice();
    this.isMobile = isMobile();

    window.addEventListener("resize", () => {
      this.isTouchDevice = isTouchDevice();
      this.isMobile = isMobile();
    });
  }

  selectReferences() {
    this.references = {};

    this.references.logo = document.getElementById("hero-section-logo");
    this.references.logoOverlay = document.getElementById(
      "hero-section-logo-overlay"
    );
    this.references.logoOverlayBorder = document.getElementById(
      "hero-section-logo-overlay-border"
    );
    this.references.cards = document.getElementById("what-we-do-cards");
    this.references.mobileBar = document.getElementById("mobile-bar");
  }

  setPanel() {
    this.panel = new lil.GUI();
    this.panel.close();
    this.panel.hide();

    let params = {
      toneMapping: this.renderer.toneMapping,
      toneMappingExposure: this.renderer.toneMappingExposure,
    };

    let folder = this.panel.addFolder("Renderer");

    folder.add(params, "toneMapping", 0, 6, 1).onFinishChange((value) => {
      this.renderer.toneMapping = value;
    });

    folder.add(params, "toneMappingExposure", 0, 6, 0.01).onChange((value) => {
      this.renderer.toneMappingExposure = value;
    });
  }

  setLighting() {
    // let envmap = this.textures.envmap;
    // this.scene.environment = envmap;
    // this.textures.envmap = envmap;
    // this.scene.environmentIntensity = 0.2;
  }

  addMobileTexturePlane() {
    let mobileBar = this.references.mobileBar;

    let geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI * 0.5);
    let material = new THREE.ShaderMaterial({
      vertexShader: mobileBarVs,
      fragmentShader: mobileBarFs,
      uniforms: {
        uTexture: new THREE.Uniform(),
        uTextureHeight: new THREE.Uniform(0),
        uMeshHeight: new THREE.Uniform(this.sizes.height),
        uScreenHeight: new THREE.Uniform(window.innerHeight),
        uScrollY: new THREE.Uniform(0),
      },
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(mobileBar.offsetWidth, 1, mobileBar.offsetHeight);
    mesh.renderOrder = 2;

    this.onResize(() => {
      if (this.isMobile) {
        mesh.visible = true;

        material.uniforms.uMeshHeight.value = mobileBar.offsetHeight;
        material.uniforms.uScreenHeight.value = window.innerHeight;
      } else {
        mesh.visible = false;
      }
    });

    this.onTick(() => {
      if (this.isMobile) {
        material.uniforms.uScrollY.value = window.scrollY;
      }
    });

    this.scene.add(mesh);

    let texture;

    let updateTexture = debounceWithHooks(() => {
      if (!this.isMobile) {
        return;
      }

      html2canvas(document.body, {
        useCORS: false,
        scale: 1,
        windowWidth: document.documentElement.clientWidth,
      }).then((canvas) => {
        if (texture) {
          texture.dispose();
        }
        texture = new THREE.CanvasTexture(canvas);
        // texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        material.uniforms.uTexture.value = texture;
        material.uniforms.uTextureHeight.value = canvas.height;
      });
    }, 300);

    updateTexture();
    window.addEventListener("resize", updateTexture);
  }

  addDesktopTexturePlane() {
    let geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI * 0.5);
    let material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      stencilZPass: THREE.KeepStencilOp,
      stencilFail: THREE.KeepStencilOp,
      stencilZFail: THREE.KeepStencilOp,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 2;
    mesh.scale.set(this.sizes.width, 1, this.sizes.height);

    this.onResize((sizes) => {
      if (this.isMobile) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
        mesh.scale.set(sizes.width, 1, sizes.height);
      }
    });

    this.scene.add(mesh);

    let texture;

    let updateTexture = debounceWithHooks(() => {
      if (this.isMobile) {
        return;
      }

      html2canvas(document.body, {
        useCORS: false,
        width: this.sizes.width,
        height: this.sizes.height,
        y: window.scrollY,
        scale: window.devicePixelRatio,
        windowWidth: document.documentElement.clientWidth,
      }).then((canvas) => {
        if (texture) {
          texture.dispose();
        }
        texture = new THREE.CanvasTexture(canvas);
        // texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        material.map = texture;
        material.needsUpdate = true;
        material.color = new THREE.Color(1, 1, 1).multiplyScalar(1.1);
        if (this.capsule.mesh) {
          this.capsule.mesh.visible = true;
        }

        if (this.card.mesh) {
          this.card.mesh.visible = true;
          this.card.mesh.scale.setScalar(1);
        }

        this.references.logoOverlay.style.display = "none";
        this.references.logoOverlayBorder.style.display = "block";
      });
    }, 300);

    updateTexture();

    setTimeout(() => {
      updateTexture();
    }, 300);
    window.addEventListener("resize", updateTexture);
    window.addEventListener("scroll", updateTexture);
  }

  loadTextures() {
    let loader = new THREE.TextureLoader();

    this.textures = {};

    let rainbow = loader.load("Rainbow2.jpg");
    rainbow.wrapS = THREE.MirroredRepeatWrapping;
    rainbow.wrapT = THREE.MirroredRepeatWrapping;
    // rainbow.colorSpace = THREE.SRGBColorSpace;

    this.textures.rainbow = rainbow;

    let mask1 = loader.load("PillMask1.png");
    mask1.wrapS = THREE.MirroredRepeatWrapping;
    mask1.wrapT = THREE.MirroredRepeatWrapping;
    this.textures.mask1 = mask1;

    let mask2 = loader.load("PillMask2.png");
    this.textures.mask2 = mask2;

    let mask3 = loader.load("PillMask3.png");
    this.textures.mask3 = mask3;

    let mask4 = loader.load("PillMask4.jpg");
    mask4.wrapS = THREE.ClampToEdgeWrapping;
    mask4.wrapT = THREE.ClampToEdgeWrapping;
    this.textures.mask4 = mask4;
  }

  createMaterial(name, parameters, samples = 16) {
    let material = Object.assign(new MeshTransmissionMaterial(samples), {
      roughness: parameters.roughness,
      metalness: parameters.metalness,
      clearcoat: parameters.clearcoat,
      clearcoatRoughness: parameters.clearcoatRoughness,
      ior: parameters.ior,
      iridescence: parameters.iridescence,
      iridescenceIOR: parameters.iridescenceIOR,
      thickness: parameters.thickness,
      reflectivity: parameters.reflectivity,

      transmissionSampler: parameters.transmissionSampler,
      chromaticAberration: parameters.chromaticAberration,
      anisotrophicBlur: parameters.anisotrophicBlur,
      anisotrophicBlur: parameters.anisotrophicBlur,
      distortion: parameters.distortion,
      distortionScale: parameters.distortionScale,
      temporalDistortion: parameters.temporalDistortion,

      transmission: 1,
      side: THREE.DoubleSide,

      iridescenceThicknessRange: [0, 140],
    });

    let folder = this.panel.addFolder(`${name} Material`);
    folder.close();

    folder.add(parameters, "roughness", 0, 1, 0.01).onChange((value) => {
      material.roughness = value;
    });

    folder.add(parameters, "metalness", 0, 1, 0.01).onChange((value) => {
      material.metalness = value;
    });

    // folder.add(parameters, "clearcoat", 0, 1, 0.01).onChange((value) => {
    //   material.clearcoat = value;
    // });

    // folder
    //   .add(parameters, "clearcoatRoughness", 0, 1, 0.01)
    //   .onChange((value) => {
    //     material.clearcoatRoughness = value;
    //   });

    folder.add(parameters, "ior", 1, 4, 0.01).onChange((value) => {
      material.ior = value;
    });

    // folder.add(parameters, "iridescence", 0, 1, 0.01).onChange((value) => {
    //   material.iridescence = value;
    // });

    // folder.add(parameters, "iridescenceIOR", 1, 2.3, 0.01).onChange((value) => {
    //   material.iridescenceIOR = value;
    // });

    folder.add(parameters, "thickness", 0, 300, 1).onChange((value) => {
      material.thickness = value;
    });

    folder.add(parameters, "reflectivity", 0, 1, 0.01).onChange((value) => {
      material.reflectivity = value;
    });

    folder.add(parameters, "transmissionSampler").onChange((value) => {
      material.transmissionSampler = value;
    });

    folder
      .add(parameters, "chromaticAberration", 0, 1, 0.01)
      .onChange((value) => {
        material.chromaticAberration = value;
      });

    folder
      .add(parameters, "anisotrophicBlur", 0, 0.4, 0.01)
      .onChange((value) => {
        material.anisotrophicBlur = value;
      });

    // folder.add(parameters, "distortion", 0, 10, 0.01).onChange((value) => {
    //   material.distortion = value;
    // });

    // folder.add(parameters, "distortionScale", 0, 1, 0.01).onChange((value) => {
    //   material.distortionScale = value;
    // });

    // folder
    //   .add(parameters, "temporalDistortion", 0, 1, 0.01)
    //   .onChange((value) => {
    //     material.temporalDistortion = value;
    //   });

    return material;
  }

  setMaterials() {
    this.capsuleMaterial = this.createMaterial("Capsule", CAPSULE_PARAMS, 24);
    this.cardMaterial = this.createMaterial("Card", CARD_PARAMS);

    this.cardMaterial.transparent = true;
    this.cardMaterial.opacity = 0;

    // console.log(this.cardMaterial);
    this.mobileBarMaterial = this.createMaterial(
      "MobileBar",
      MOBILE_BAR_PARAMS,
      2
    );

    this.maskMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      colorWrite: false,
      depthWrite: false,
      depthTest: false,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilFail: THREE.KeepStencilOp,
      stencilZFail: THREE.KeepStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
    });
  }

  addCapsuleMesh() {
    let logo = this.references.logo;
    let capsule = {
      width: 0,
      height: 0,
      borderRadius: 0,
      center: new THREE.Vector2(),
      pointer: new THREE.Vector2(),
      position: new THREE.Vector2(),
      geometry: null,
      mesh: null,
      timeline: null,
      offset: 64,
      rangeTop: 40,
      rangeBottom: 4,
      limitTop: 0,
      limitBottom: 0,
      scale: 0,
      layer: null,
    };
    this.capsule = capsule;

    let removeCapsuleMesh = () => {
      if (capsule.mesh) {
        capsule.mesh.visible = false;
        capsule.mesh.clear();
        this.scene.remove(capsule.mesh);
        capsule.mesh = null;
      }
    };

    let createCapsuleMesh = debounceWithHooks(
      () => {
        let rect = logo.getBoundingClientRect();

        capsule.width = logo.offsetWidth + capsule.offset;
        capsule.height = logo.offsetHeight * 1.12 + capsule.offset;
        capsule.borderRadius = Math.min(capsule.width, capsule.height);

        capsule.center.x =
          rect.left + rect.width * 0.5 - this.sizes.width * 0.5;
        capsule.center.y =
          rect.top + rect.height * 0.5 - this.sizes.height * 0.5 + 52;

        this.references.logoOverlayBorder.style.left =
          rect.left + rect.width * 0.5 + "px";
        this.references.logoOverlayBorder.style.top =
          rect.top + rect.height * 0.5 + "px";
        this.references.logoOverlayBorder.style.width =
          capsule.width + 36 + "px";
        this.references.logoOverlayBorder.style.height =
          capsule.height * 0.5 + 52 + "px";

        capsule.limitTop = capsule.center.y - capsule.rangeTop;
        capsule.limitBottom = capsule.center.y + capsule.rangeBottom;

        capsule.position.copy(capsule.center);
      },
      300,
      {
        onComplete: () => {
          removeCapsuleMesh();

          if (this.isMobile) {
            return;
          }

          capsule.geometry = new RoundedBoxGeometry(
            capsule.width,
            capsule.borderRadius,
            capsule.height,
            8,
            capsule.borderRadius
          );

          let mesh = new THREE.Mesh(capsule.geometry, this.capsuleMaterial);
          mesh.renderOrder = 0;

          let layerGeometry = new THREE.PlaneGeometry(
            capsule.width,
            capsule.height * 0.5
          );
          layerGeometry.rotateX(-Math.PI * 0.5);
          let layerMaterial = new THREE.ShaderMaterial({
            vertexShader: pillLayerVs,
            fragmentShader: pillLayerFs,
            uniforms: {
              uTexture: new THREE.Uniform(this.textures.rainbow),
              uMask1: new THREE.Uniform(this.textures.mask1),
              uMask2: new THREE.Uniform(this.textures.mask2),
              uMask3: new THREE.Uniform(this.textures.mask3),
              uMask4: new THREE.Uniform(this.textures.mask4),
              uNoise: new THREE.Uniform(this.textures.noise),
              uProgress: new THREE.Uniform(),
            },
            depthWrite: true,
            depthTest: true,
            // visible: false,
            // transparent: true,
            // toneMapped: false,
            // blending: THREE.NormalBlending,
          });
          let layer = new THREE.Mesh(layerGeometry, layerMaterial);
          layer.renderOrder = 1;

          layer.position.set(0, -200, capsule.height * 0.25 - 12);
          capsule.layer = layer;

          mesh.add(layer);

          let cutoutGeometry = new THREE.PlaneGeometry(
            capsule.width + 32,
            capsule.height * 0.5 + 48
          );
          cutoutGeometry.rotateX(-Math.PI * 0.5);
          let cutoutMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setScalar(14 / 255),
            // depthTest: false,
            transparent: true,
            toneMapped: false,
          });
          let cutout = new THREE.Mesh(cutoutGeometry, cutoutMaterial);
          cutout.position.set(0, -100, capsule.height * 0.25 + 24);
          mesh.add(cutout);

          let mask = new THREE.Mesh(capsule.geometry, this.maskMaterial);
          mesh.add(mask);

          mesh.position.set(capsule.position.x, 500, capsule.position.y);
          mesh.renderOrder = 1;
          mesh.position.y = capsule.borderRadius;
          mesh.visible = false;
          this.scene.add(mesh);
          capsule.mesh = mesh;
        },
      }
    );

    createCapsuleMesh();

    window.addEventListener("mousemove", (e) => {
      capsule.pointer.x = e.clientX - this.sizes.width * 0.5;
      capsule.pointer.y = e.clientY - this.sizes.height * 0.5;
    });

    this.onTick(() => {
      if (!capsule.mesh) {
        return;
      }

      if (this.isMobile || this.isTouchDevice) {
        return;
      }

      let pointerX = capsule.pointer.x;
      let pointerY = capsule.pointer.y;

      let targetY = clamp(pointerY, capsule.limitTop, capsule.limitBottom);

      let returnOffsetX = 400;
      let returnOffsetY = 240;

      if (
        pointerX > capsule.center.x + returnOffsetX ||
        pointerX < capsule.center.x - returnOffsetX ||
        pointerY < capsule.limitTop - returnOffsetY ||
        pointerY > capsule.limitBottom + returnOffsetY
      ) {
        targetY = capsule.center.y;
      }

      // capsule.mesh.position.z = targetY; // Instant update

      capsule.mesh.position.z -= (capsule.mesh.position.z - targetY) * 0.08;
      this.references.logoOverlayBorder.style.top =
        capsule.mesh.position.z + this.sizes.height * 0.5 + "px";

      let p =
        1 -
        inverseLerp(
          capsule.limitTop,
          capsule.limitBottom,
          capsule.mesh.position.z
        );
      capsule.layer.material.uniforms.uProgress.value = p;

      // this.scene.environmentIntensity = p * 0.2;
    });

    window.addEventListener("resize", createCapsuleMesh);
  }

  addCardMesh() {
    let cardsContainer = this.references.cards;
    let cards = cardsContainer.querySelectorAll(".card-btn");
    let cardCenters = [];
    let snapTo = 0;
    let closestId = 0;
    let pointer = 0;

    let card = {
      width: 0,
      height: 0,
      scale: 0,
      opacity: 0,
      centerY: 0,
      geometry: null,
      mesh: null,
      timeline: null,
    };
    this.card = card;

    let geometryParams = {
      radius: 0.15,
      scaleY: 1.2,
    };

    let createGeometry = () => {
      let geometry = new RoundedBoxGeometry(
        card.width + 8,
        card.height,
        card.height + 8,
        12,
        card.height * geometryParams.radius
      );

      return geometry;
    };

    let updateGeometry = () => {
      if (card.geometry) {
        card.geometry.dispose();
      }
      card.geometry = createGeometry();
      card.mesh.geometry = card.geometry;
    };

    let removeCardMesh = () => {
      if (card.mesh) {
        card.mesh.visible = false;
        this.scene.remove(card.mesh);
        card.mesh = null;
      }
    };

    let folder = this.panel.addFolder("CardGeometry");
    folder
      .add(geometryParams, "radius", 0.01, 0.45, 0.01)
      .onFinishChange((value) => {
        updateGeometry();
      });

    folder.add(geometryParams, "scaleY", 0.05, 2, 0.01).onChange((value) => {
      if (card.mesh) {
        card.mesh.scale.y = value;
      }
    });

    let createCardMesh = debounceWithHooks(
      () => {
        cardCenters = [];
        cards.forEach((card) => {
          let rect = card.getBoundingClientRect();
          let x = rect.x + rect.width * 0.5 - this.sizes.width * 0.5;
          cardCenters.push(x);
        });
        snapTo = cardCenters[0];

        let rect = cards[0].getBoundingClientRect();

        card.width = rect.width;
        card.height = rect.height;
        card.centerY = rect.top + rect.height * 0.5 - this.sizes.height * 0.5;
      },
      300,
      {
        onComplete: () => {
          removeCardMesh();

          if (this.isMobile) {
            return;
          }

          // let geometry = createCardGeometry(card.width, card.height, 32);
          let geometry = createGeometry();

          let material = new THREE.MeshNormalMaterial({ wireframe: false });

          if (card.mesh) {
            card.mesh.visible = false;
            this.scene.remove(card.mesh);
          }

          card.opacity = 0;

          let mesh = new THREE.Mesh(geometry, this.cardMaterial);
          mesh.scale.setScalar(0);
          mesh.visible = false;

          let mask = new THREE.Mesh(geometry, this.maskMaterial);
          mask.scale.setScalar(0);
          mesh.add(mask);

          mesh.position.x = cardCenters[0];
          mesh.position.y = 320;
          mesh.position.z = card.centerY;

          mesh.renderOrder = 1;
          this.scene.add(mesh);
          card.mesh = mesh;

          if (card.timeline) {
            card.timeline.clear();
          }

          let tl = gsap.timeline().pause();
          tl.to(card, {
            opacity: 1,
            duration: 0.01,
            ease: "power2.out",
            onUpdate: () => {
              card.mesh.material.opacity = card.opacity;
              if (card.opacity < 0.05) {
                mask.scale.setScalar(0);
              } else {
                mask.scale.setScalar(1);
              }
            },
          });

          card.timeline = tl;
        },
      }
    );

    createCardMesh();

    cardsContainer.addEventListener("mousemove", (e) => {
      if (card.mesh) {
        card.timeline.play();
      }

      let x = e.clientX - this.sizes.width * 0.5;
      pointer = x;

      let distance = 2000;

      cardCenters.forEach((cX, i) => {
        let d = Math.abs(cX - x);
        if (d < distance) {
          closestId = i;
          distance = d;
        }
      });

      let snapRange = card.width * 0.35;
      let closestCenter = cardCenters[closestId];

      snapTo = distance < snapRange ? closestCenter : x;
    });

    cardsContainer.addEventListener("mouseenter", (e) => {
      let x = e.clientX - this.sizes.width * 0.5;
      snapTo = cardCenters[closestId];

      if (card.mesh) {
        card.timeline.play();
        card.mesh.position.x = x;
      }
    });

    cardsContainer.addEventListener("mouseleave", () => {
      snapTo = cardCenters[closestId];
      if (card.mesh) {
        card.timeline.reverse();
      }
    });

    this.onTick(() => {
      if (card.mesh) {
        // let easeFactor =
        //   Math.abs(pointer - card.mesh.position.x) / this.sizes.width;
        // easeFactor *= 0.05;

        card.mesh.position.x += (snapTo - card.mesh.position.x) * 0.08;

        card.mesh.position.x = clamp(
          card.mesh.position.x,
          cardCenters[0] - 20,
          cardCenters[cardCenters.length - 1] + 20
        );
      }
    });

    window.addEventListener("resize", createCardMesh);
    window.addEventListener("scroll", createCardMesh);
  }

  addMobileBarMesh() {
    let mobileBar = this.references.mobileBar;
    let bar = {
      width: 0,
      height: 0,
      geometry: null,
      mesh: null,
    };

    bar.width = mobileBar.offsetWidth;
    bar.height = mobileBar.offsetHeight;

    let geometry = new THREE.CylinderGeometry(
      bar.height * 0.5,
      bar.height * 0.5,
      bar.width * 1.5,
      32,
      12
    );
    geometry.scale(0.2, 1, 1);
    geometry.rotateZ(Math.PI * 0.5);
    let material = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.5,
    });
    let mesh = new THREE.Mesh(geometry, this.mobileBarMaterial);
    mesh.visible = this.isMobile;

    bar.mesh = mesh;
    this.mobileBar = bar;

    this.onResize(() => {
      mesh.visible = this.isMobile;
    });

    this.scene.add(mesh);
  }

  addPostprocessing() {
    let renderTarget = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height,
      {
        stencilBuffer: true,
      }
    );
    let composer = new EffectComposer(this.renderer, renderTarget);

    let renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    let huePass = new ShaderPass(HueSaturationShader);
    huePass.uniforms.hue.value = POSTPROCESSING.hue;
    huePass.uniforms.saturation.value = POSTPROCESSING.saturation;
    composer.addPass(huePass);

    // let ccShader = new ShaderPass(ColorCorrectionShader);
    // console.log(ccShader);
    // ccShader.uniforms.powRGB.value = new THREE.Vector3().setScalar(0.9);
    // composer.addPass(ccShader);

    let smaaPass = new SMAAPass();
    composer.addPass(smaaPass);

    let outputPass = new OutputPass();
    composer.addPass(outputPass);

    this.onTick(() => {
      composer.render();
    });

    let folder = this.panel.addFolder("Postprocessing");
    folder.close();

    folder
      .add(POSTPROCESSING, "hue", 0, Math.PI * 2, 0.01)
      .onChange((value) => {
        huePass.uniforms.hue.value = value;
      });

    folder.add(POSTPROCESSING, "saturation", 0, 1, 0.01).onChange((value) => {
      huePass.uniforms.saturation.value = value;
    });
  }
}
