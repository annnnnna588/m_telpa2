/**
 * A-Frame Lightmap Component
 * 
 * This component allows the application of lightmaps to GLB models in A-Frame scenes.
 * It supports multiple lightmaps and materials with advanced configuration options.
 * 
 * Compatible with A-Frame 1.7 and Three.js r173.
 */

AFRAME.registerComponent("lightmap", {
    multiple: true,
    schema: {
        // Texture asset for the lightmap
        texture: { type: "asset", default: "" },
        // Key to match the material name
        key: { type: "string", default: "" },
        // Intensity of the lightmap
        intensity: { type: "number", default: 1.0 }
    },

    init: function () {
        var self = this;

        console.log(
            "lightmap component initialized",
            self.data.texture,
            self.data.key
        );

        // Event listener for when the model is loaded
        this.el.addEventListener("model-loaded", () => {
            var textureEl = self.data.texture;
            if (!textureEl || !textureEl.src) {
                console.error('Lightmap texture not found or invalid:', self.data.texture);
                return;
            }

            console.log('Creating lightmap texture from image element:', textureEl.src);

            // Create a THREE.Texture from the image element
            var texture = new THREE.Texture(textureEl);
            texture.flipY = false;
            texture.channel = 1; // Use uv1
            texture.needsUpdate = true;

            // Configure color space and encoding for lightmaps
            if (typeof THREE.LinearSRGBColorSpace !== 'undefined') {
                texture.colorSpace = THREE.LinearSRGBColorSpace;
            }
            if (typeof THREE.sRGBEncoding !== 'undefined') {
                texture.encoding = THREE.sRGBEncoding;
            }

            // Set texture parameters
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.generateMipmaps = true;

            console.log('Lightmap texture prepared');

            var obj = self.el.object3D;
            var applied = false;

            // Traverse the object and apply the lightmap to matching materials
            obj.traverse((node) => {
                if (node.isMesh) {
                    var matName = (node.material && node.material.name) ? node.material.name : '';
                    var matArguments = matName.split("|");

                    matArguments.forEach((element) => {
                        if (element === self.data.key) {
                            console.log('Applying lightmap to material:', matName);

                            node.material.lightMap = texture;
                            node.material.lightMapIntensity = self.data.intensity;
                            node.material.needsUpdate = true;

                            // Ensure shader knows to use the lightmap
                            if (!node.material.defines) node.material.defines = {};
                            node.material.defines.USE_LIGHTMAP = '';

                            applied = true;
                        }
                    });
                }
            });

            if (!applied) {
                console.warn('No material found with key:', self.data.key);
                console.log('Available materials in model:');
                obj.traverse((node) => {
                    if (node.isMesh) {
                        console.log('  - Material name:', node.material && node.material.name);
                    }
                });
            }
        });
    },
});

/**
 * Debug Component
 * 
 * This component applies the lightmap to all materials in the model for testing purposes.
 */
AFRAME.registerComponent("lightmap-test", {
    schema: {
        // Texture asset for the lightmap
        texture: { type: "asset", default: "" },
        // Intensity of the lightmap
        intensity: { type: "number", default: 1.0 }
    },

    init: function () {
        var self = this;

        console.log("lightmap-test component initialized", self.data.texture);

        // Event listener for when the model is loaded
        this.el.addEventListener('model-loaded', () => {
            var textureEl = self.data.texture;
            if (!textureEl || !textureEl.src) {
                console.error('Lightmap texture not found or invalid:', self.data.texture);
                return;
            }

            console.log('Creating lightmap texture from image element (test):', textureEl.src);

            var texture = new THREE.Texture(textureEl);
            texture.flipY = false;
            texture.channel = 1;
            texture.needsUpdate = true;

            if (typeof THREE.LinearSRGBColorSpace !== 'undefined') {
                texture.colorSpace = THREE.LinearSRGBColorSpace;
            }
            if (typeof THREE.sRGBEncoding !== 'undefined') {
                texture.encoding = THREE.sRGBEncoding;
            }
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.generateMipmaps = true;

            console.log('Lightmap texture created, applying to ALL materials');

            // Apply the lightmap to all materials in the object
            self.el.object3D.traverse((node) => {
                if (node.isMesh) {
                    console.log('Applying lightmap to:', node.material && node.material.name);
                    node.material.lightMap = texture;
                    node.material.lightMapIntensity = self.data.intensity;
                    node.material.needsUpdate = true;
                    if (!node.material.defines) node.material.defines = {};
                    node.material.defines.USE_LIGHTMAP = '';
                }
            });
        });
    },
});
