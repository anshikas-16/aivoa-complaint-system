import io
from pypdf import PdfReader


def extract_text_from_upload(filename: str, content: bytes) -> str:
    """
    Minimal, non-production-grade extraction -- per the assignment brief,
    production-grade OCR/document parsing is explicitly not required.
    Handles .pdf and plain text (.txt/.eml-as-text).
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    # fallback: treat as plain text (email body pasted as .txt, etc.)
    return content.decode("utf-8", errors="ignore").strip()
