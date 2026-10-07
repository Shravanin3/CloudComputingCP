import os
from pathlib import Path

base_dir = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile")

# Fix AuthContext.tsx imports
auth_ctx = base_dir / "src/navigation/AuthContext.tsx"
content = auth_ctx.read_text(encoding="utf-8")
content = content.replace("../../types/auth", "../types/auth")
content = content.replace("../../utils/secureStorage", "../utils/secureStorage")
content = content.replace("../../services/auth/authService", "../services/auth/authService")
content = content.replace("../../services/api/apiClient", "../services/api/apiClient")
content = content.replace("../../utils/authEvents", "../utils/authEvents")
auth_ctx.write_text(content, encoding="utf-8")

print("Fixed imports")
