# 3D model slot

Put your model here as `hero-object.glb`, then set `model.enabled: true` in
`src/data/portfolio.ts`. Until then the hero shows a procedural 3D object.

Recommended: under 1.5 MB, Draco-compressed (`gltf-transform optimize in.glb hero-object.glb --compress draco`),
textures as KTX2/WebP, centred at the origin and roughly 2.5 units across.
