# LUNA-SAFE

AI-powered lunar terrain intelligence and rover navigation simulator (frontend prototype).

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Status
- All data is **simulated**. Terrain is procedural, hazard detection returns mock results, routing uses a local A* in `src/services/pathfinding.js`.
- No AI model is connected.

## Connecting the FastAPI backend
1. Copy `.env.example` to `.env`, set `VITE_API_URL`, and set `VITE_USE_MOCK=false`.
2. Implement these endpoints with the response shapes in `src/services/api.js`:
   `POST /api/terrain/analyze`, `POST /api/hazards/detect` (multipart `image`), `POST /api/navigation/generate-route`,
   `POST /api/mission/start`, `POST /api/mission/reroute`, `GET /api/mission/status`, `GET /api/analytics`.
3. Swap `planRoute` for your Python A*, and the mock detector for YOLO/OpenCV.

## Structure
`src/services` API + terrain + pathfinding, `src/store.jsx` shared mission state, `src/components` layout/3D/UI, `src/pages` one file per section.
