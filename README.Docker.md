# Docker instructions

Build the production image locally (PowerShell):

```powershell
# from project root
docker build -t project-management-frontend:latest .
```

Run the container:

```powershell
docker run --rm -p 8080:80 project-management-frontend:latest
```

Or use docker-compose (build + run):

```powershell
docker-compose up --build
```

Open http://localhost:8080 in your browser.

Notes:
- The Dockerfile uses a multi-stage build: Node to build, nginx to serve.
- If you need dev-mode hot-reload inside Docker, let me know and I will add a `Dockerfile.dev` that runs `ng serve`.
