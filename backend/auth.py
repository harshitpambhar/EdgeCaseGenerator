"""
JWT and Password hashing authentication utilities.
"""
from __future__ import annotations

import datetime
import os
import hashlib
import base64
import json
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database import get_db

# Try to import bcrypt directly to avoid passlib compatibility issues with bcrypt 4.x
try:
    import bcrypt
    _BCRYPT_AVAILABLE = True
except ImportError:
    _BCRYPT_AVAILABLE = False

# Try to import jose, fallback to PyJWT or custom token verification if not installed
try:
    from jose import JWTError, jwt
    _JOSE_AVAILABLE = True
except ImportError:
    try:
        import jwt  # PyJWT
        _JOSE_AVAILABLE = True
        JWTError = jwt.PyJWTError
    except ImportError:
        jwt = None
        _JOSE_AVAILABLE = False
        JWTError = Exception

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkeyfor-smart-testcase-generator")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    """Hash password using bcrypt directly or hashlib fallback."""
    if _BCRYPT_AVAILABLE:
        try:
            password_bytes = password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password_bytes, salt)
            return hashed.decode('utf-8')
        except Exception:
            pass
    # Fallback to SHA256 with static salt
    salted = password + SECRET_KEY
    return hashlib.sha256(salted.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify standard password against hash."""
    if _BCRYPT_AVAILABLE:
        try:
            plain_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(plain_bytes, hashed_bytes)
        except Exception:
            pass
    # Fallback verification
    return hash_password(plain_password) == hashed_password


def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None) -> str:
    """Generate JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    
    if _JOSE_AVAILABLE and jwt:
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Custom fallback token generator (HMAC/SHA256 mock token)
    payload_b64 = base64.b64encode(json.dumps(to_encode).encode()).decode()
    signature = hashlib.sha256(f"{payload_b64}.{SECRET_KEY}".encode()).hexdigest()
    return f"{payload_b64}.{signature}"


def decode_access_token(token: str) -> dict | None:
    """Decode JWT access token."""
    if not token:
        return None
    try:
        if _JOSE_AVAILABLE and jwt:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
            
        # Custom fallback decoder
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        expected_sig = hashlib.sha256(f"{payload_b64}.{SECRET_KEY}".encode()).hexdigest()
        if signature != expected_sig:
            return None
        payload_data = json.loads(base64.b64decode(payload_b64).decode())
        exp = payload_data.get("exp")
        if exp and exp < datetime.datetime.utcnow().timestamp():
            return None  # Expired
        return payload_data
    except Exception:
        return None


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """FastAPI dependency to retrieve the current authorized user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
        
    from backend.models import User
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
