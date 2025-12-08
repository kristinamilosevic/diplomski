from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from datetime import timedelta
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserLogin, Token
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    logger.info(f"Registration attempt for email: {user_data.email}")
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(f"Registration failed: Email {user_data.email} already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"User created successfully: ID={new_user.id}, Email={new_user.email}")
    return new_user

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    logger.info(f"Login attempt for email: {user_data.email}")
    
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        logger.warning(f"Login failed: User with email {user_data.email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(user_data.password, user.hashed_password):
        logger.warning(f"Login failed: Invalid password for email {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=30 * 24 * 60)  
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in successfully: ID={user.id}, Email={user.email}")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/users", response_model=list[UserOut])
async def get_users(db: Session = Depends(get_db)):
    """Get all registered users"""
    users = db.query(User).all()
    logger.info(f"Retrieved {len(users)} users")
    return users

