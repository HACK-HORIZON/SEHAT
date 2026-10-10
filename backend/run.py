import os
import sys
from pathlib import Path

# Ensure root workspace directory is in python search path
workspace_root = str(Path(__file__).resolve().parent.parent)
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8088))
    print(f"Starting SEHAT FastAPI on http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")

