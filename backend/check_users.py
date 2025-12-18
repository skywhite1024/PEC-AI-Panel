import sqlite3
from pathlib import Path


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    db_path = base_dir / "app.db"

    if not db_path.exists():
        print(f"[error] database not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    try:
        rows = list(cur.execute("SELECT id, phone, is_active, created_at FROM users;"))
    except sqlite3.OperationalError as exc:
        print(f"[error] query failed: {exc}")
        conn.close()
        return

    if not rows:
        print("[info] users table is empty")
    else:
        for row in rows:
            print(row)

    conn.close()


if __name__ == "__main__":
    main()
