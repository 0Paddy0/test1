# Multiple Window 3D Scene

Mehrere Browser-Fenster werden zu einer einzigen Shader-Szene zusammengefügt. Synchronisation via `BroadcastChannel` (Zeit, Maus, Layout). Renderer: Three.js Fullscreen-Quad mit GLSL-Fragment-Shader.

## Start
```bash
python3 -m http.server 8000
# oder: npx serve
```
Browser: http://localhost:8000 → Anzahl/Größe wählen → Starten (Popups erlauben).
