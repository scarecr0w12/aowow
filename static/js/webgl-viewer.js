/**
 * WebGL Model Viewer for AoWoW
 * Replaces Flash-based ZAMviewer with modern Three.js implementation.
 *
 * Provides WoWModelViewer class for embedding in any container,
 * plus global ModelViewer compatibility used by global.js / Profiler.js.
 *
 * Dependencies: Three.js r128+ (loaded from CDN in head.tpl.php)
 *               THREE.GLTFLoader (loaded from CDN in head.tpl.php)
 */

(function (window) {
    'use strict';

    /* ------------------------------------------------------------------
     *  Guard: Three.js must be loaded
     * ------------------------------------------------------------------ */
    if (typeof THREE === 'undefined') {
        console.warn('[WoWModelViewer] Three.js not loaded - viewer disabled.');
        return;
    }

    /* Model asset version – bump after re-generating GLB files to bust caches */
    var MODEL_VERSION = 5;

    /* ==================================================================
     *  WoWModelViewer - reusable 3-D viewer class
     *  Can be embedded in any DOM container.
     * ================================================================== */
    class WoWModelViewer {

        /**
         * @param {HTMLElement} container - the DOM element to render into
         * @param {Object}      opts      - optional overrides
         */
        constructor(container, opts) {
            if (!container) throw new Error('WoWModelViewer: container required');

            this.container   = container;
            this.opts        = Object.assign({ background: 0x181818 }, opts);
            this.scene       = null;
            this.camera      = null;
            this.renderer    = null;
            this.currentModel = null;
            this.mixer       = null;
            this.clock       = new THREE.Clock();
            this.animFrameId = null;
            this.gltfLoader  = null;
            this._orbitState = null;
            this._animations = null;
            this._disposed   = false;
            this._loadId     = 0;          // monotonic counter to cancel stale loads
            this._charDebounce = null;     // debounce timer for loadCharacter
            this._modelHint  = 'generic';  // 'character', 'item', 'npc', 'spell', 'generic'

            this._init();
        }

        /* ---- initialisation ----------------------------------------- */

        _init() {
            var w = this.container.clientWidth  || 600;
            var h = this.container.clientHeight || 400;

            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(this.opts.background);

            // Camera
            this.camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000);
            this.camera.position.set(0, 1.5, 5);
            this.camera.lookAt(0, 1, 0);

            // Renderer
            try {
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            } catch (e) {
                console.error('[WoWModelViewer] WebGL not available:', e);
                this.container.innerHTML = '<div style="color:#c00;padding:20px;">WebGL is not available in this browser.</div>';
                return;
            }
            this.renderer.setSize(w, h);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            if (this.renderer.outputEncoding !== undefined) {
                this.renderer.outputEncoding = THREE.sRGBEncoding || THREE.LinearEncoding;
            }
            this.container.appendChild(this.renderer.domElement);

            // Lighting
            this._setupLighting();

            // Ground plane
            this._setupGround();

            // Orbit controls (manual - no dependency on OrbitControls addon)
            this._setupOrbitControls();

            // GLTFLoader
            if (typeof THREE.GLTFLoader !== 'undefined') {
                this.gltfLoader = new THREE.GLTFLoader();
            } else {
                this.gltfLoader = new MinimalGLTFLoader();
            }

            // Resize observer
            if (typeof ResizeObserver !== 'undefined') {
                this._resizeObserver = new ResizeObserver(this._onResize.bind(this));
                this._resizeObserver.observe(this.container);
            }

            // Start render loop
            this._animate();
        }

        _setupLighting() {
            this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));

            var key = new THREE.DirectionalLight(0xffffff, 0.85);
            key.position.set(5, 10, 7);
            key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            key.shadow.camera.near = 0.5;
            key.shadow.camera.far = 50;
            key.shadow.camera.left = key.shadow.camera.bottom = -10;
            key.shadow.camera.right = key.shadow.camera.top = 10;
            this.scene.add(key);

            var fill = new THREE.DirectionalLight(0x8888ff, 0.25);
            fill.position.set(-5, 5, -5);
            this.scene.add(fill);

            var rim = new THREE.DirectionalLight(0xffffff, 0.15);
            rim.position.set(0, 5, -8);
            this.scene.add(rim);
        }

        _setupGround() {
            var geo = new THREE.PlaneGeometry(30, 30);
            var mat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0 });
            var ground = new THREE.Mesh(geo, mat);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.01;
            ground.receiveShadow = true;
            ground.name = '__ground';
            this.scene.add(ground);
        }

        _setupOrbitControls() {
            var s = this._orbitState = {
                theta: 0, phi: Math.PI / 3,
                distance: 5,
                target: new THREE.Vector3(0, 1, 0),
                dragging: false, rotating: false, panning: false,
                prev: { x: 0, y: 0 }
            };

            var self = this;
            var el = this.renderer.domElement;

            el.addEventListener('mousedown', function(e) {
                s.dragging = true;
                s.rotating = (e.button === 0 && !e.ctrlKey && !e.metaKey);
                s.panning  = (e.button === 2 || e.ctrlKey || e.metaKey);
                s.prev = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            });

            el.addEventListener('mousemove', function(e) {
                if (!s.dragging) return;
                var dx = e.clientX - s.prev.x;
                var dy = e.clientY - s.prev.y;
                if (s.rotating) {
                    s.theta -= dx * 0.008;
                    s.phi   -= dy * 0.008;
                    s.phi    = Math.max(0.1, Math.min(Math.PI - 0.1, s.phi));
                }
                if (s.panning) {
                    var panSpeed = s.distance * 0.002;
                    var right = new THREE.Vector3();
                    right.setFromMatrixColumn(self.camera.matrixWorld, 0);
                    s.target.addScaledVector(right, -dx * panSpeed);
                    s.target.y += dy * panSpeed;
                }
                s.prev = { x: e.clientX, y: e.clientY };
                self._updateCamera();
            });

            var stopDrag = function() { s.dragging = s.rotating = s.panning = false; };
            el.addEventListener('mouseup', stopDrag);
            el.addEventListener('mouseleave', stopDrag);

            el.addEventListener('wheel', function(e) {
                e.preventDefault();
                s.distance *= (1 + e.deltaY * 0.001);
                s.distance = Math.max(0.3, Math.min(100, s.distance));
                self._updateCamera();
            }, { passive: false });

            el.addEventListener('contextmenu', function(e) { e.preventDefault(); });

            // Touch support
            var touchDist = 0;
            el.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    s.dragging = s.rotating = true;
                    s.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                } else if (e.touches.length === 2) {
                    touchDist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                }
                e.preventDefault();
            }, { passive: false });

            el.addEventListener('touchmove', function(e) {
                if (e.touches.length === 1 && s.rotating) {
                    var dx = e.touches[0].clientX - s.prev.x;
                    var dy = e.touches[0].clientY - s.prev.y;
                    s.theta -= dx * 0.008;
                    s.phi   -= dy * 0.008;
                    s.phi    = Math.max(0.1, Math.min(Math.PI - 0.1, s.phi));
                    s.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    self._updateCamera();
                } else if (e.touches.length === 2) {
                    var d = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    s.distance *= (touchDist / d);
                    s.distance = Math.max(0.3, Math.min(100, s.distance));
                    touchDist = d;
                    self._updateCamera();
                }
                e.preventDefault();
            }, { passive: false });

            el.addEventListener('touchend', stopDrag);

            this._updateCamera();
        }

        _updateCamera() {
            var s = this._orbitState;
            var x = s.distance * Math.sin(s.phi) * Math.cos(s.theta);
            var y = s.distance * Math.cos(s.phi);
            var z = s.distance * Math.sin(s.phi) * Math.sin(s.theta);
            this.camera.position.set(
                s.target.x + x,
                s.target.y + y,
                s.target.z + z
            );
            this.camera.lookAt(s.target);
        }

        _animate() {
            var self = this;
            this.animFrameId = requestAnimationFrame(function() { self._animate(); });
            var dt = this.clock.getDelta();
            if (this.mixer) this.mixer.update(dt);
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }

        _onResize() {
            if (!this.container || !this.renderer) return;
            var w = this.container.clientWidth  || 1;
            var h = this.container.clientHeight || 1;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }

        /* ---- public API --------------------------------------------- */

        /**
         * Load a model by path (e.g. "/static/models/item/sword.glb")
         */
        loadModelFromPath(path, onDone) {
            var myLoadId = ++this._loadId;   // invalidate any in-flight load
            this._showLoading();
            var self = this;

            // Detect model type from path for material hinting
            if (path.indexOf('/character/') !== -1) this._modelHint = 'character';
            else if (path.indexOf('/item/') !== -1)  this._modelHint = 'item';
            else if (path.indexOf('/npc/') !== -1)   this._modelHint = 'npc';
            else if (path.indexOf('/spell/') !== -1) this._modelHint = 'spell';
            else if (path.indexOf('/object/') !== -1) this._modelHint = 'object';

            var cacheBustedPath = path + (path.indexOf('?') === -1 ? '?' : '&') + 'v=' + MODEL_VERSION;
            this.gltfLoader.load(
                cacheBustedPath,
                function(gltf) {
                    if (self._disposed || myLoadId !== self._loadId) return; // stale
                    self._clearModel();
                    self._displayModel(gltf.scene || gltf);
                    if (gltf.animations && gltf.animations.length) {
                        self.mixer = new THREE.AnimationMixer(gltf.scene);
                        self._animations = gltf.animations;
                    }
                    self._hideLoading();
                    if (onDone) onDone(true);
                },
                undefined,
                function(err) {
                    if (self._disposed || myLoadId !== self._loadId) return; // stale
                    console.warn('[WoWModelViewer] Failed to load:', path, err);
                    self._hideLoading();
                    if (onDone) onDone(false);
                }
            );
        }

        /**
         * Load a model via the model-lookup API.
         * @param {number} type       - 1=NPC, 2=Object, 3=Item, 4=ItemSet, 8=Pet, 16=Character
         * @param {number} displayId
         * @param {Object} extra      - { slot, race, sex }
         */
        loadByDisplayId(type, displayId, extra, onDone) {
            extra = extra || {};
            var qs = 'type=' + type +
                     '&displayId=' + (displayId || 0) +
                     '&slot=' + (extra.slot || 0) +
                     '&race=' + (extra.race || 0) +
                     '&sex='  + (extra.sex  || 0);

            this._showLoading();
            var self = this;
            var myLoadId = this._loadId;     // snapshot current load id

            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/model-lookup.php?' + qs, true);
            xhr.onload = function() {
                if (self._disposed || myLoadId !== self._loadId) return;
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.success && data.exists) {
                        self.loadModelFromPath(data.path, onDone);
                    } else {
                        self._clearModel();
                        self._showPlaceholder(type, displayId, extra.slot);
                        self._hideLoading();
                        if (onDone) onDone(false);
                    }
                } catch (e) {
                    console.warn('[WoWModelViewer] API parse error:', e);
                    self._clearModel();
                    self._showPlaceholder(type, displayId, extra.slot);
                    self._hideLoading();
                    if (onDone) onDone(false);
                }
            };
            xhr.onerror = function() {
                if (self._disposed || myLoadId !== self._loadId) return;
                console.warn('[WoWModelViewer] API error');
                self._clearModel();
                self._showPlaceholder(type, displayId, extra.slot);
                self._hideLoading();
                if (onDone) onDone(false);
            };
            xhr.send();
        }

        /**
         * Load a character model with equipment list (for Profiler).
         * equipList: [slot1, displayId1, slot2, displayId2, ...]
         * Debounced: rapid successive calls only trigger the last one.
         */
        loadCharacter(raceName, sexName, equipList, appearance) {
            var self = this;
            // Debounce: cancel pending load, wait 150ms for rapid _updateModel calls to settle
            if (this._charDebounce) clearTimeout(this._charDebounce);
            this._charDebounce = setTimeout(function() {
                self._charDebounce = null;
                self._doLoadCharacter(raceName, sexName, equipList, appearance);
            }, 150);
        }

        /** @private Actually perform the character load (after debounce) */
        _doLoadCharacter(raceName, sexName, equipList, appearance) {
            if (this._disposed) return;
            var charModel = (raceName + sexName).toLowerCase();
            var charPath  = '/static/models/character/' + charModel + '.glb';
            var self = this;

            // Parse equipList: [slot, displayId, slot, displayId, ...]
            var displayIds = [];
            if (equipList && equipList.length) {
                for (var i = 0; i < equipList.length; i += 2) {
                    if (i + 1 < equipList.length && equipList[i + 1]) {
                        displayIds.push(equipList[i + 1]);
                    }
                }
            }

            // Skin color from appearance
            var skinColor = (appearance && appearance.sk !== undefined) ? appearance.sk : 0;

            // Build composite texture URL (only if we have equipment)
            var compositeUrl = null;
            if (displayIds.length > 0) {
                compositeUrl = '/api/character-texture.php'
                    + '?race=' + encodeURIComponent(raceName)
                    + '&sex='  + encodeURIComponent(sexName)
                    + '&skin=' + skinColor
                    + '&items=' + displayIds.join(',');
            }

            this.loadModelFromPath(charPath, function(ok) {
                // Note: no staleness check here — loadModelFromPath already
                // validates staleness before calling onDone.
                if (self._disposed) return;
                if (!ok && charModel !== 'humanmale') {
                    // Try humanmale as fallback (once only)
                    self.loadModelFromPath('/static/models/character/humanmale.glb', function(ok2) {
                        if (self._disposed) return;
                        if (!ok2) {
                            self._clearModel();
                            self._showPlaceholder(16, 0, 0);
                            console.warn('[WoWModelViewer] Character model unavailable, showing placeholder.');
                            return;
                        }
                        // Fallback model loaded – still apply composite texture if available
                        if (compositeUrl) {
                            self._applyCompositeTexture(compositeUrl, self._loadId);
                        }
                    });
                } else if (!ok) {
                    self._clearModel();
                    self._showPlaceholder(16, 0, 0);
                    console.warn('[WoWModelViewer] Character model unavailable, showing placeholder.');
                } else {
                    // Character model loaded – apply composite texture if available
                    if (compositeUrl) {
                        self._applyCompositeTexture(compositeUrl, self._loadId);
                    }
                }
            });
        }

        /**
         * @private Fetch composite texture from the API and apply it to the current model.
         * Replaces the character model's embedded texture with armor-composited version.
         */
        _applyCompositeTexture(url, expectedLoadId) {
            var self = this;
            var textureLoader = new THREE.TextureLoader();
            console.log('[WoWModelViewer] Loading composite texture:', url);

            textureLoader.load(
                url,
                function(texture) {
                    // Staleness / disposal check
                    if (self._disposed || expectedLoadId !== self._loadId || !self.currentModel) {
                        console.warn('[WoWModelViewer] Composite texture stale/disposed, skipping.');
                        return;
                    }

                    texture.flipY = false;        // Match GLB/glTF UV convention
                    texture.encoding = THREE.sRGBEncoding || THREE.LinearEncoding;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearMipmapLinearFilter;
                    texture.generateMipmaps = true;

                    // Replace texture on all meshes in the character model
                    var applied = 0;
                    self.currentModel.traverse(function(n) {
                        if (!n.isMesh) return;
                        var mats = Array.isArray(n.material) ? n.material : [n.material];
                        mats.forEach(function(mat) {
                            // Dispose old texture
                            if (mat.map) mat.map.dispose();
                            mat.map = texture;
                            mat.needsUpdate = true;
                            applied++;
                        });
                    });

                    console.log('[WoWModelViewer] Composite texture applied to', applied, 'materials.');
                },
                undefined,
                function(err) {
                    // Texture load failed – keep showing the base skin texture
                    console.warn('[WoWModelViewer] Composite texture failed, keeping base skin.', err);
                }
            );
        }

        /** Play named animation (if model has animations) */
        setAnimation(name) {
            if (!this.mixer || !this._animations) return;
            this.mixer.stopAllAction();
            var clip = THREE.AnimationClip.findByName(this._animations, name);
            if (clip) {
                this.mixer.clipAction(clip).play();
            }
        }

        /** Get list of animation names */
        getAnimationNames() {
            if (!this._animations) return [];
            return this._animations.map(function(a) { return a.name; }).filter(Boolean);
        }

        /** Reset camera to default position */
        resetCamera() {
            var s = this._orbitState;
            s.theta = 0;
            s.phi = Math.PI / 3;
            s.distance = 5;
            s.target.set(0, 1, 0);
            this._updateCamera();
        }

        /** Resize the renderer (call after container size changes) */
        resize(w, h) {
            if (!this.renderer) return;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }

        /** Dispose of all resources */
        dispose() {
            this._disposed = true;
            if (this._charDebounce) { clearTimeout(this._charDebounce); this._charDebounce = null; }
            if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
            if (this._resizeObserver) this._resizeObserver.disconnect();
            if (this.renderer) {
                this.renderer.dispose();
                if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                    this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
                }
            }
            this._clearModel();
            this.scene = this.camera = this.renderer = null;
        }

        /* ---- Compatibility shims for Profiler.js -------------------- */

        /** No-op compatibility with Flash SWF method */
        clearSlots() {}

        /** No-op compatibility with Flash SWF method */
        setAppearance() {}

        /** No-op compatibility with Flash SWF method */
        attachList() {}

        /* ---- internal helpers --------------------------------------- */

        /** Return a material appropriate for the current model type */
        _getMaterialForHint() {
            var h = this._modelHint;
            if (h === 'character' || h === 'npc') {
                return new THREE.MeshStandardMaterial({
                    color: 0xc8a882, roughness: 0.75, metalness: 0.05,
                    side: THREE.DoubleSide
                });
            }
            if (h === 'item') {
                return new THREE.MeshStandardMaterial({
                    color: 0xb0b0b0, roughness: 0.4, metalness: 0.6,
                    side: THREE.DoubleSide
                });
            }
            if (h === 'spell') {
                return new THREE.MeshStandardMaterial({
                    color: 0x6688cc, roughness: 0.3, metalness: 0.2,
                    emissive: 0x223355, emissiveIntensity: 0.3,
                    side: THREE.DoubleSide
                });
            }
            // generic / object
            return new THREE.MeshStandardMaterial({
                color: 0x999999, roughness: 0.6, metalness: 0.3,
                side: THREE.DoubleSide
            });
        }

        _clearModel() {
            if (this.currentModel) {
                if (this.scene) this.scene.remove(this.currentModel);
                this.currentModel.traverse(function(n) {
                    if (n.geometry)  n.geometry.dispose();
                    if (n.material) {
                        var mats = Array.isArray(n.material) ? n.material : [n.material];
                        mats.forEach(function(m) {
                            if (m.map) m.map.dispose();
                            m.dispose();
                        });
                    }
                });
                this.currentModel = null;
            }
            this.mixer = null;
            this._animations = null;
        }

        _displayModel(obj) {
            if (!this.scene) return;
            var self = this;

            // --- Fix M2→GLB coordinate system: Z-up → Y-up ---
            // WoW M2 models use Z-up; glTF/Three.js uses Y-up.
            // Detect by checking if Z-extent is the largest axis.
            var preBox = new THREE.Box3().setFromObject(obj);
            var preSize = preBox.getSize(new THREE.Vector3());
            if (preSize.z > preSize.y * 1.3) {
                // Z is tallest → rotate around X by -90°
                obj.rotation.x = -Math.PI / 2;
                obj.updateMatrixWorld(true);
            }

            // --- Post-process meshes: fix normals & materials ---
            obj.traverse(function(n) {
                if (!n.isMesh) return;
                n.castShadow = true;
                n.receiveShadow = true;

                var geo = n.geometry;
                var hasNormals = !!geo.getAttribute('normal');
                var hasUVs = !!geo.getAttribute('uv');
                var hasTexture = n.material && n.material.map;
                var colorAttr = geo.getAttribute('color');

                // New-format GLBs: already have NORMAL + TEXCOORD_0 + embedded texture.
                // Just ensure double-sided rendering and move on.
                if (hasNormals && hasUVs && hasTexture) {
                    n.material.side = THREE.DoubleSide;
                    return;
                }

                // New-format GLBs without embedded texture but with proper geometry:
                // Apply a context-appropriate material.
                if (hasNormals && hasUVs && !hasTexture) {
                    n.material = self._getMaterialForHint();
                    return;
                }

                // Legacy GLBs: COLOR_0 exists but looks like encoded normals
                // (M2 converters bake normals into vertex colors as n*0.5+0.5),
                // decode them as real normals and apply a skin-toned material.
                if (colorAttr && !hasNormals) {
                    var count = colorAttr.count;
                    var normals = new Float32Array(count * 3);

                    for (var i = 0; i < count; i++) {
                        // Decode: normal = color * 2 - 1
                        normals[i * 3]     = colorAttr.getX(i) * 2 - 1;
                        normals[i * 3 + 1] = colorAttr.getY(i) * 2 - 1;
                        normals[i * 3 + 2] = colorAttr.getZ(i) * 2 - 1;

                        // Normalise
                        var nx = normals[i*3], ny = normals[i*3+1], nz = normals[i*3+2];
                        var len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                        normals[i*3]   /= len;
                        normals[i*3+1] /= len;
                        normals[i*3+2] /= len;
                    }

                    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
                    geo.deleteAttribute('color');

                    // Apply context-appropriate material
                    n.material = self._getMaterialForHint();
                } else {
                    if (n.material) n.material.side = THREE.DoubleSide;
                    if (!hasNormals) geo.computeVertexNormals();
                }
            });

            // Auto-scale: fit into a ~3-unit bounding sphere
            var box = new THREE.Box3().setFromObject(obj);
            var size = box.getSize(new THREE.Vector3());
            var center = box.getCenter(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z) || 1;
            var scale = 3 / maxDim;
            obj.scale.multiplyScalar(scale);

            // Re-center
            box.setFromObject(obj);
            box.getCenter(center);
            obj.position.sub(center);
            obj.position.y += (size.y * scale) / 2;

            // Place ground at feet
            var ground = this.scene.getObjectByName('__ground');
            if (ground) ground.position.y = 0;

            this.currentModel = obj;
            this.scene.add(obj);

            // Fit camera
            var s = this._orbitState;
            s.target.set(0, (size.y * scale) / 2, 0);
            s.distance = Math.max(size.x, size.y, size.z) * scale * 2;
            s.distance = Math.max(2, Math.min(20, s.distance));
            this._updateCamera();
        }

        _showPlaceholder(type, displayId, slot) {
            if (!this.scene) return;
            var seed  = parseInt(displayId, 10) || 1;
            var color = _seedColor(seed);
            var mesh;

            if (type === 3 || type === 4) {
                mesh = this._makeItemPlaceholder(seed, color);
            } else if (type === 16) {
                mesh = this._makeCharacterPlaceholder(color);
            } else {
                mesh = this._makeNPCPlaceholder(seed, color);
            }

            this.currentModel = mesh;
            this.scene.add(mesh);

            var s = this._orbitState;
            s.target.set(0, 1, 0);
            s.distance = 5;
            this._updateCamera();
        }

        _makeItemPlaceholder(seed, color) {
            var shapes = [
                function() { // Sword
                    var g = new THREE.Group();
                    var blade = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 0.06), new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8, roughness: 0.2 }));
                    blade.position.y = 1.2;
                    g.add(blade);
                    var guard = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: color, metalness: 0.5, roughness: 0.4 }));
                    guard.position.y = 0.3;
                    g.add(guard);
                    var hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
                    hilt.position.y = 0.08;
                    g.add(hilt);
                    return g;
                },
                function() { // Shield
                    var g = new THREE.Group();
                    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 6), new THREE.MeshStandardMaterial({ color: color, metalness: 0.4, roughness: 0.6 }));
                    body.position.y = 1;
                    g.add(body);
                    var boss = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 }));
                    boss.position.set(0, 1, 0.08);
                    g.add(boss);
                    return g;
                },
                function() { // Staff
                    var g = new THREE.Group();
                    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
                    shaft.position.y = 1.1;
                    g.add(shaft);
                    var orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.3 }));
                    orb.position.y = 2.3;
                    g.add(orb);
                    return g;
                },
                function() { // Axe
                    var g = new THREE.Group();
                    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
                    handle.position.y = 0.8;
                    g.add(handle);
                    var head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.08), new THREE.MeshStandardMaterial({ color: color, metalness: 0.7, roughness: 0.3 }));
                    head.position.set(0.15, 1.6, 0);
                    g.add(head);
                    return g;
                }
            ];
            return shapes[seed % shapes.length]();
        }

        _makeCharacterPlaceholder(color) {
            var g = new THREE.Group();
            var body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 1.2, 8), new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 }));
            body.position.y = 1;
            g.add(body);
            var head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshStandardMaterial({ color: 0xddb893 }));
            head.position.y = 1.85;
            g.add(head);
            return g;
        }

        _makeNPCPlaceholder(seed, color) {
            var g = new THREE.Group();
            // Use CylinderGeometry as CapsuleGeometry may not exist in r128
            var body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.6, 12), new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 }));
            body.position.y = 1;
            g.add(body);
            var head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: _seedColor(seed + 3) }));
            head.position.y = 2;
            g.add(head);
            return g;
        }

        _showLoading() {
            if (this._loadingEl) return;
            var el = document.createElement('div');
            el.className = 'wow-mv-loading';
            el.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#999;font:14px/1.4 Arial,sans-serif;text-align:center;z-index:5;pointer-events:none;';
            el.innerHTML = '<div style="border:3px solid #444;border-top-color:#fff;border-radius:50%;width:28px;height:28px;margin:0 auto 8px;animation:wowMvSpin 0.8s linear infinite"></div>Loading model\u2026';
            // Add spin keyframes if not present
            if (!document.getElementById('wowMvSpinStyle')) {
                var style = document.createElement('style');
                style.id = 'wowMvSpinStyle';
                style.textContent = '@keyframes wowMvSpin{to{transform:rotate(360deg)}}';
                document.head.appendChild(style);
            }
            if (!this.container.style.position || this.container.style.position === 'static') {
                this.container.style.position = 'relative';
            }
            this.container.appendChild(el);
            this._loadingEl = el;
        }

        _hideLoading() {
            if (this._loadingEl) {
                this._loadingEl.remove();
                this._loadingEl = null;
            }
        }
    }

    /* ------------------------------------------------------------------
     *  Minimal GLB/glTF loader fallback
     *  Used only if THREE.GLTFLoader is not available from CDN.
     * ------------------------------------------------------------------ */
    class MinimalGLTFLoader {
        load(url, onLoad, onProgress, onError) {
            var loader = new THREE.FileLoader();
            loader.setResponseType('arraybuffer');
            loader.load(url, function(buf) {
                try {
                    var result = MinimalGLTFLoader.prototype._parseGLB(buf);
                    onLoad(result);
                } catch (e) {
                    console.error('[MinimalGLTFLoader]', e);
                    if (onError) onError(e);
                }
            }, onProgress, onError);
        }

        _parseGLB(buf) {
            var view = new DataView(buf);
            if (view.getUint32(0, true) !== 0x46546C67) throw new Error('Not GLB');
            if (view.getUint32(4, true) !== 2) throw new Error('Unsupported glTF version');

            var jsonLen = view.getUint32(12, true);
            var json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen)));

            var bin = null;
            var binStart = 20 + jsonLen;
            if (binStart + 8 < buf.byteLength) {
                var binLen = view.getUint32(binStart, true);
                bin = new Uint8Array(buf, binStart + 8, binLen);
            }

            var scene = new THREE.Group();

            if (json.meshes && bin) {
                for (var mi = 0; mi < json.meshes.length; mi++) {
                    var mesh = json.meshes[mi];
                    var primitives = mesh.primitives || [];
                    for (var pi = 0; pi < primitives.length; pi++) {
                        var prim = primitives[pi];
                        var geo = new THREE.BufferGeometry();

                        // Positions
                        if (prim.attributes.POSITION !== undefined) {
                            var acc = json.accessors[prim.attributes.POSITION];
                            var bv  = json.bufferViews[acc.bufferView];
                            var off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
                            var posArr = new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * 3);
                            var posCopy = new Float32Array(posArr.length);
                            posCopy.set(posArr);
                            geo.setAttribute('position', new THREE.BufferAttribute(posCopy, 3));
                        }

                        // Normals
                        if (prim.attributes.NORMAL !== undefined) {
                            var nacc = json.accessors[prim.attributes.NORMAL];
                            var nbv  = json.bufferViews[nacc.bufferView];
                            var noff = (nbv.byteOffset || 0) + (nacc.byteOffset || 0);
                            var nrmArr = new Float32Array(bin.buffer, bin.byteOffset + noff, nacc.count * 3);
                            var nrmCopy = new Float32Array(nrmArr.length);
                            nrmCopy.set(nrmArr);
                            geo.setAttribute('normal', new THREE.BufferAttribute(nrmCopy, 3));
                        }

                        // UVs
                        if (prim.attributes.TEXCOORD_0 !== undefined) {
                            var uacc = json.accessors[prim.attributes.TEXCOORD_0];
                            var ubv  = json.bufferViews[uacc.bufferView];
                            var uoff = (ubv.byteOffset || 0) + (uacc.byteOffset || 0);
                            var uvArr = new Float32Array(bin.buffer, bin.byteOffset + uoff, uacc.count * 2);
                            var uvCopy = new Float32Array(uvArr.length);
                            uvCopy.set(uvArr);
                            geo.setAttribute('uv', new THREE.BufferAttribute(uvCopy, 2));
                        }

                        // Vertex colors — in M2-converted GLBs these are actually
                        // encoded normals (n*0.5+0.5). We decode them as normals
                        // here; _displayModel will handle the material fix.
                        if (prim.attributes.COLOR_0 !== undefined && !geo.attributes.normal) {
                            var cacc = json.accessors[prim.attributes.COLOR_0];
                            var cbv  = json.bufferViews[cacc.bufferView];
                            var coff = (cbv.byteOffset || 0) + (cacc.byteOffset || 0);
                            var components = cacc.type === 'VEC4' ? 4 : 3;
                            var colArr = new Float32Array(bin.buffer, bin.byteOffset + coff, cacc.count * components);

                            // Decode as normals: normal = color * 2 - 1
                            var normals = new Float32Array(cacc.count * 3);
                            for (var ci = 0; ci < cacc.count; ci++) {
                                var nx = colArr[ci * components]     * 2 - 1;
                                var ny = colArr[ci * components + 1] * 2 - 1;
                                var nz = colArr[ci * components + 2] * 2 - 1;
                                var nlen = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                                normals[ci * 3]     = nx / nlen;
                                normals[ci * 3 + 1] = ny / nlen;
                                normals[ci * 3 + 2] = nz / nlen;
                            }
                            geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
                            // Don't set color attribute — _displayModel will handle material
                        } else if (prim.attributes.COLOR_0 !== undefined) {
                            var cacc = json.accessors[prim.attributes.COLOR_0];
                            var cbv  = json.bufferViews[cacc.bufferView];
                            var coff = (cbv.byteOffset || 0) + (cacc.byteOffset || 0);
                            var components = cacc.type === 'VEC4' ? 4 : 3;
                            var colArr = new Float32Array(bin.buffer, bin.byteOffset + coff, cacc.count * components);
                            var colCopy = new Float32Array(colArr.length);
                            colCopy.set(colArr);
                            geo.setAttribute('color', new THREE.BufferAttribute(colCopy, components));
                        }

                        // Indices
                        if (prim.indices !== undefined) {
                            var iacc = json.accessors[prim.indices];
                            var ibv  = json.bufferViews[iacc.bufferView];
                            var ioff = (ibv.byteOffset || 0) + (iacc.byteOffset || 0);
                            var idx, idxCopy;
                            if (iacc.componentType === 5125) {
                                idx = new Uint32Array(bin.buffer, bin.byteOffset + ioff, iacc.count);
                                idxCopy = new Uint32Array(idx.length);
                                idxCopy.set(idx);
                            } else {
                                idx = new Uint16Array(bin.buffer, bin.byteOffset + ioff, iacc.count);
                                idxCopy = new Uint16Array(idx.length);
                                idxCopy.set(idx);
                            }
                            geo.setIndex(new THREE.BufferAttribute(idxCopy, 1));
                        }

                        if (!geo.attributes.normal) geo.computeVertexNormals();

                        // Material
                        var matOpts = { roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide };
                        var hasVertexColors = !!geo.attributes.color;
                        if (hasVertexColors) matOpts.vertexColors = true;

                        if (json.materials && prim.material !== undefined) {
                            var m = json.materials[prim.material];
                            if (m.pbrMetallicRoughness) {
                                var pbr = m.pbrMetallicRoughness;
                                if (pbr.baseColorFactor) {
                                    matOpts.color = new THREE.Color(pbr.baseColorFactor[0], pbr.baseColorFactor[1], pbr.baseColorFactor[2]);
                                    if (pbr.baseColorFactor[3] < 1) {
                                        matOpts.transparent = true;
                                        matOpts.opacity = pbr.baseColorFactor[3];
                                    }
                                }
                                if (pbr.metallicFactor  !== undefined) matOpts.metalness  = pbr.metallicFactor;
                                if (pbr.roughnessFactor !== undefined) matOpts.roughness = pbr.roughnessFactor;

                                // Handle embedded texture
                                if (pbr.baseColorTexture && json.textures && json.images && bin) {
                                    try {
                                        var texInfo = json.textures[pbr.baseColorTexture.index];
                                        var imgInfo = json.images[texInfo.source];
                                        if (imgInfo.bufferView !== undefined) {
                                            var imgBv = json.bufferViews[imgInfo.bufferView];
                                            var imgOff = imgBv.byteOffset || 0;
                                            var imgLen = imgBv.byteLength;
                                            var imgData = new Uint8Array(bin.buffer, bin.byteOffset + imgOff, imgLen);
                                            var blob = new Blob([imgData], { type: imgInfo.mimeType || 'image/png' });
                                            var texUrl = URL.createObjectURL(blob);
                                            var texture = new THREE.TextureLoader().load(texUrl, function() {
                                                URL.revokeObjectURL(texUrl);
                                            });
                                            texture.flipY = false; // glTF textures are not flipped
                                            texture.encoding = THREE.sRGBEncoding;
                                            matOpts.map = texture;
                                            // Remove baseColorFactor when we have a texture
                                            delete matOpts.color;
                                        }
                                    } catch(texErr) {
                                        console.warn('[MinimalGLTFLoader] Failed to load embedded texture:', texErr);
                                    }
                                }
                            }
                            if (m.doubleSided !== undefined) {
                                matOpts.side = m.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
                            }
                        }

                        var mat = new THREE.MeshStandardMaterial(matOpts);
                        var meshObj = new THREE.Mesh(geo, mat);
                        meshObj.castShadow = true;
                        meshObj.receiveShadow = true;
                        scene.add(meshObj);
                    }
                }
            }

            if (scene.children.length === 0) {
                var fallGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                var fallMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
                scene.add(new THREE.Mesh(fallGeo, fallMat));
            }

            return { scene: scene, scenes: [scene], animations: [] };
        }
    }

    /* ------------------------------------------------------------------
     *  Utility: seed -> colour
     * ------------------------------------------------------------------ */
    function _seedColor(seed) {
        var palette = [
            0xCC4444, 0x44AA88, 0x4488BB, 0xCC8855,
            0x77BB77, 0xBBAA44, 0x9966AA, 0x6699BB,
            0xBB7744, 0x5599BB
        ];
        return palette[Math.abs(seed) % palette.length];
    }

    /* ==================================================================
     *  Expose globally
     * ================================================================== */
    window.WoWModelViewer = WoWModelViewer;

})(window);
