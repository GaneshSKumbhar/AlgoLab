"""Account service supporting local SQLite and hosted PostgreSQL databases."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from pathlib import Path
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

DATABASE_PATH = Path(__file__).resolve().parents[2] / "algolab.db"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
TOKEN_TTL_SECONDS = 60 * 60 * 12
SECRET = os.getenv("ALGOLAB_AUTH_SECRET", "change-this-development-secret-before-deploying")
bearer_scheme = HTTPBearer(auto_error=False)

if os.getenv("ALGOLAB_REQUIRE_AUTH_SECRET") == "true" and (
    SECRET == "change-this-development-secret-before-deploying" or len(SECRET) < 32
):
    raise RuntimeError("Set ALGOLAB_AUTH_SECRET to a unique value of at least 32 characters before deploying.")


def _using_postgres() -> bool:
    return DATABASE_URL.startswith(("postgres://", "postgresql://"))


def _connection() -> Any:
    """Open the configured database. SQLite remains convenient for local development."""
    if _using_postgres():
        from psycopg import connect
        from psycopg.rows import dict_row

        connection = connect(DATABASE_URL, row_factory=dict_row)
        _create_users_table(connection)
        return connection

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    _create_users_table(connection)
    return connection


def _create_users_table(connection: Any) -> None:
    if _using_postgres():
        connection.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at BIGINT NOT NULL
            )"""
        )
    else:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )"""
        )


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"{base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def _verify_password(password: str, stored: str) -> bool:
    salt_text, _ = stored.split("$", 1)
    return hmac.compare_digest(_hash_password(password, base64.urlsafe_b64decode(salt_text.encode())), stored)


def _encode(payload: dict[str, object]) -> str:
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{signature}"


def _decode(token: str) -> dict[str, object]:
    try:
        body, signature = token.rsplit(".", 1)
        expected = hmac.new(SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if not hmac.compare_digest(signature, expected) or int(payload["exp"]) < time.time():
            raise ValueError
        return payload
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")


def issue_token(username: str) -> dict[str, str]:
    return {"access_token": _encode({"sub": username, "exp": int(time.time()) + TOKEN_TTL_SECONDS}), "token_type": "bearer", "username": username}


def register(username: str, password: str) -> dict[str, str]:
    try:
        with _connection() as connection:
            placeholders = "%s, %s, %s" if _using_postgres() else "?, ?, ?"
            connection.execute(
                f"INSERT INTO users (username, password_hash, created_at) VALUES ({placeholders})",
                (username, _hash_password(password), int(time.time())),
            )
    except Exception as error:
        # SQLite and psycopg expose different exception classes for a unique key conflict.
        if isinstance(error, sqlite3.IntegrityError) or error.__class__.__name__ == "UniqueViolation":
            raise HTTPException(status_code=409, detail="That username is already in use.")
        raise
    return issue_token(username)


def login(username: str, password: str) -> dict[str, str]:
    with _connection() as connection:
        placeholder = "%s" if _using_postgres() else "?"
        row = connection.execute(f"SELECT password_hash FROM users WHERE username = {placeholder}", (username,)).fetchone()
    if row is None or not _verify_password(password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password.")
    return issue_token(username)


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> str:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in to run algorithms.")
    username = _decode(credentials.credentials).get("sub")
    if not isinstance(username, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session.")
    return username
