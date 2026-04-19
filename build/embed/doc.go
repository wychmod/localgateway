package embed

// This package will host embedded admin assets after the frontend build is available.
// Planned flow:
// 1. Build web/admin with Vite
// 2. Copy dist assets into build/embed/admin
// 3. Embed via Go 1.22 embed FS
// 4. Serve /admin directly from the binary
