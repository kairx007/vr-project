# Outpost — Meta Quest VR Target Range

A browser-based Three.js target range built for Meta Quest Browser with WebXR. It supports controller aiming and trigger shooting in immersive VR, plus mouse aiming on desktop for quick previews.

Each shot also sends a small request to the game server and displays its measured application round-trip time (RTT). When accessed through the temporary Cloudflare tunnel, this timing includes the Quest-to-server route and tunnel overhead; it is not a measurement of 5G radio-only latency.

## Run locally

```sh
npm install
npm run dev -- --host 0.0.0.0
```

Open the served address on a desktop browser to preview, or serve it over HTTPS and open it in Meta Quest Browser to use immersive VR. WebXR immersive sessions require a secure context (HTTPS, or localhost).

## Run with Docker

Build and start the production container:

```sh
docker compose up --build -d
```

The app listens on host port `8081` (container port `8080`). Open `http://localhost:8081` locally. For Meta Quest, publish it behind an HTTPS reverse proxy because immersive WebXR requires a secure context. The container also serves the `/api/shot` acknowledgement used by the in-game latency display.

Stop the container with:

```sh
docker compose down
```

## Controls

- Quest: use the left thumbstick to move, the right thumbstick horizontally to turn, push it down or click it to crouch, and squeeze either controller trigger to fire.
- Desktop: move with WASD or arrow keys relative to the direction you are looking; click and drag to look around; click without dragging to shoot; press Space to shoot at screen center.
- 12 rounds per magazine; reloads automatically.

The range is an original fictional training simulation with geometric targets and no real-world weapon instructions.
