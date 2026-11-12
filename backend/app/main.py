import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import jwt


# Database Setup
DATABASE_URL = "sqlite:///./grievance.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "whitematrix-secret-key-2026"
ALGORITHM = "HS256"

Base.metadata.create_all(bind=engine)

# Models
class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="citizen") # citizen, cmo_admin, department_officer
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    district = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium")
    status = Column(String(30), default="Submitted") # Submitted, Under Review, In Progress, Resolved, Reopened
    assigned_dept_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    history = relationship("GrievanceHistory", back_populates="grievance")

class GrievanceHistory(Base):
    __tablename__ = "grievance_history"
    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"), nullable=False)
    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    grievance = relationship("Grievance", back_populates="history")

class ContactEnquiry(Base):
    __tablename__ = "contact_enquiries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(120))
    subject = Column(String(200))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Base.metadata.create_all(bind=engine)

# App Setup
app = FastAPI(title="CM Kerala Grievance Redressal Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Seed default departments and demo users on startup
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if not db.query(Department).first():
        depts = [
            Department(name="Public Works Department (PWD)", description="Roads, bridges, and infrastructure maintenance."),
            Department(name="Kerala Water Authority (KWA)", description="Drinking water supply and pipeline leak repairs."),
            Department(name="Kerala State Electricity Board (KSEB)", description="Power supply, transformers, and electrical network."),
            Department(name="Health & Family Welfare", description="Hospitals, public health centers, and sanitization."),
            Department(name="Revenue & Land Records", description="Pattayam, boundary issues, and certificates.")
        ]
        db.add_all(depts)
        db.commit()

        # Seed Demo accounts
        demo_users = [
            User(name="Demo Citizen", email="citizen@demo.com", phone="9876543210",
                 password_hash=pwd_context.hash("Demo@1234"), role="citizen"),
            User(name="CMO Admin", email="cmo@kerala.gov.in", phone="9876543211",
                 password_hash=pwd_context.hash("Demo@1234"), role="cmo_admin"),
            User(name="PWD Officer", email="officer.pwd@kerala.gov.in", phone="9876543212",
                 password_hash=pwd_context.hash("Demo@1234"), role="department_officer", department_id=1),
        ]
        db.add_all(demo_users)
        db.commit()
    db.close()

# Pydantic Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GrievanceCreate(BaseModel):
    district: str
    subject: str
    description: str
    category: Optional[str] = "General"
    priority: Optional[str] = "Medium"
    ai_summary: Optional[str] = None
    citizen_id: Optional[int] = None

class AIRequest(BaseModel):
    description: str
    district: Optional[str] = None

class CMOAction(BaseModel):
    department_id: int
    remarks: Optional[str] = None
    status: Optional[str] = "In Progress"

class OfficerAction(BaseModel):
    action_report: str
    status: Optional[str] = "Resolved"

# API Endpoints
@app.post("/api/auth/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=pwd_context.hash(user_data.password),
        role=user_data.role
    )
    db.add(user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = jwt.encode({"sub": user.email, "role": user.role, "id": user.id}, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }

@app.get("/api/departments")
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@app.post("/api/ai/analyze-grievance")
def analyze_grievance(req: AIRequest, db: Session = Depends(get_db)):
    desc = req.description.lower()
    
    # Heuristic analysis fallback / LLM simulation
    if "road" in desc or "pothole" in desc or "bridge" in desc:
        category = "Road Infrastructure"
        dept_id = 1
        priority = "High" if "accident" in desc or "danger" in desc else "Medium"
        summary = "Citizen reports degraded road surface requiring urgent inspection and resurfacing."
    elif "water" in desc or "pipe" in desc or "leak" in desc:
        category = "Water Supply"
        dept_id = 2
        priority = "High" if "flood" in desc or "burst" in desc else "Medium"
        summary = "Water distribution disruption reported due to damaged pipeline infrastructure."
    elif "power" in desc or "electric" in desc or "transformer" in desc or "voltage" in desc:
        category = "Electricity"
        dept_id = 3
        priority = "High"
        summary = "Electrical outage or transformer fault impacting local households."
    else:
        category = "Public Services"
        dept_id = 1
        priority = "Medium"
        summary = f"Citizen issue reported: {req.description[:80]}..."
        
    return {
        "category": category,
        "priority": priority,
        "suggested_department_id": dept_id,
        "summary": summary
    }

@app.post("/api/grievances")
def create_grievance(g: GrievanceCreate, db: Session = Depends(get_db)):
    ref_id = f"KL-2026-{uuid.uuid4().hex[:6].upper()}"
    new_g = Grievance(
        reference_id=ref_id,
        citizen_id=g.citizen_id,  # Stores the creator's ID
        district=g.district,
        subject=g.subject,
        description=g.description,
        category=g.category or "General",
        priority=g.priority or "Medium",
        ai_summary=g.ai_summary,
        status="Submitted"
    )
    db.add(new_g)
    db.commit()
    db.refresh(new_g)
    
    hist = GrievanceHistory(
        grievance_id=new_g.id,
        old_status=None,
        new_status="Submitted",
        remarks="Grievance officially submitted by citizen to CMO."
    )
    db.add(hist)
    db.commit()

    return {
        "id": new_g.id,
        "reference_id": ref_id,
        "district": new_g.district,
        "subject": new_g.subject,
        "status": new_g.status,
        "citizen_id": new_g.citizen_id,
        "message": "Grievance created successfully"
    }

@app.get("/api/grievances")
def list_grievances(db: Session = Depends(get_db)):
    return db.query(Grievance).all()

@app.get("/api/grievances/track/{reference_id}")
def track_grievance(reference_id: str, db: Session = Depends(get_db)):
    g = db.query(Grievance).filter(Grievance.reference_id == reference_id.strip()).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    dept_name = "Chief Minister's Office (Pending Assignment)"
    if g.assigned_dept_id:
        dept = db.query(Department).filter(Department.id == g.assigned_dept_id).first()
        if dept:
            dept_name = dept.name

    complainant_name = "Public Citizen"
    complainant_email = "Not Provided"
    if g.citizen_id:
        u = db.query(User).filter(User.id == g.citizen_id).first()
        if u:
            complainant_name = u.name
            complainant_email = u.email

    history = db.query(GrievanceHistory).filter(GrievanceHistory.grievance_id == g.id).order_by(GrievanceHistory.timestamp.asc()).all()
    
    return {
        "id": g.id,
        "reference_id": g.reference_id,
        "citizen_id": g.citizen_id,
        "complainant_name": complainant_name,
        "complainant_email": complainant_email,
        "district": g.district,
        "subject": g.subject,
        "description": g.description,
        "category": g.category,
        "priority": g.priority,
        "status": g.status,
        "department_name": dept_name,
        "ai_summary": g.ai_summary,
        "created_at": g.created_at.isoformat() + "Z" if g.created_at else None,
        "history": [
            {
                "new_status": h.new_status,
                "remarks": h.remarks,
                "timestamp": h.timestamp.isoformat() + "Z" if h.timestamp else ""
            }
            for h in history
        ]
    }
    
class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"
    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"), nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rating = Column(Integer, nullable=False) # 1 to 5
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeedbackCreate(BaseModel):
    grievance_id: int
    rating: int
    comments: Optional[str] = None
    
@app.get("/api/citizen/grievances")
def get_citizen_grievances(citizen_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Grievance)
    if citizen_id:
        query = query.filter(Grievance.citizen_id == citizen_id)
    return query.order_by(Grievance.created_at.desc()).all()
    
# @app.get("/api/citizen/grievances")
# def get_citizen_grievances(citizen_id: Optional[int] = None, db: Session = Depends(get_db)):
#     query = db.query(Grievance)
#     if citizen_id:
#         query = query.filter(Grievance.citizen_id == citizen_id)
#     grievances = query.order_by(Grievance.created_at.desc()).all()
    
#     result = []
#     for g in grievances:
#         dept_name = "Chief Minister's Office"
#         if g.assigned_dept_id:
#             dept = db.query(Department).filter(Department.id == g.assigned_dept_id).first()
#             if dept:
#                 dept_name = dept.name
        
#         latest_history = db.query(GrievanceHistory).filter(GrievanceHistory.grievance_id == g.id).order_by(GrievanceHistory.timestamp.desc()).first()
        
#         feedback = db.query(CitizenFeedback).filter(CitizenFeedback.grievance_id == g.id).first()
        
#         result.append({
#             "id": g.id,
#             "reference_id": g.reference_id,
#             "district": g.district,
#             "category": g.category,
#             "subject": g.subject,
#             "description": g.description,
#             "priority": g.priority,
#             "status": g.status,
#             "department_name": dept_name,
#             "latest_remarks": latest_history.remarks if latest_history else "No remarks yet",
#             "created_at": g.created_at.isoformat() + "Z" if g.created_at else None,
#             "feedback_given": feedback is not None,
#             "rating": feedback.rating if feedback else None
#         })
#     return result

@app.post("/api/citizen/feedback")
def submit_feedback(fb: FeedbackCreate, citizen_id: Optional[int] = None, db: Session = Depends(get_db)):
    g = db.query(Grievance).filter(Grievance.id == fb.grievance_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    existing = db.query(CitizenFeedback).filter(CitizenFeedback.grievance_id == fb.grievance_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this grievance")
        
    new_fb = CitizenFeedback(
        grievance_id=fb.grievance_id,
        citizen_id=citizen_id,
        rating=fb.rating,
        comments=fb.comments
    )
    db.add(new_fb)
    db.commit()
    return {"message": "Feedback submitted successfully"}

@app.patch("/api/grievances/{id}/cmo-action")
def cmo_action(id: int, action: CMOAction, db: Session = Depends(get_db)):
    g = db.query(Grievance).filter(Grievance.id == id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    old_status = g.status
    g.status = action.status or "In Progress"
    g.assigned_dept_id = action.department_id
    
    hist = GrievanceHistory(
        grievance_id=g.id,
        old_status=old_status,
        new_status=g.status,
        remarks=f"Forwarded by CMO to Department #{action.department_id}. Directives: {action.remarks or 'Immediate field action required.'}"
    )
    db.add(hist)
    db.commit()
    return {"message": "Grievance forwarded successfully"}

@app.get("/api/officer/grievances")
def get_officer_grievances(db: Session = Depends(get_db)):
    # Returns all forwarded grievances
    return db.query(Grievance).filter(Grievance.status.in_(["In Progress", "Resolved"])).all()

@app.patch("/api/grievances/{id}/officer-action")
def officer_action(id: int, action: OfficerAction, db: Session = Depends(get_db)):
    g = db.query(Grievance).filter(Grievance.id == id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    old_status = g.status
    g.status = action.status or "Resolved"
    
    hist = GrievanceHistory(
        grievance_id=g.id,
        old_status=old_status,
        new_status=g.status,
        remarks=f"Action Taken Report (ATR): {action.action_report}"
    )
    db.add(hist)
    db.commit()
    return {"message": "Action Taken Report submitted and status resolved"}

@app.get("/api/cmo/stats")
def get_cmo_stats(db: Session = Depends(get_db)):
    total = db.query(Grievance).count()
    pending = db.query(Grievance).filter(Grievance.status == "Submitted").count()
    in_progress = db.query(Grievance).filter(Grievance.status == "In Progress").count()
    resolved = db.query(Grievance).filter(Grievance.status == "Resolved").count()
    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }

@app.post("/api/contact")
def create_contact(enquiry: dict, db: Session = Depends(get_db)):
    item = ContactEnquiry(
        name=enquiry.get("name"),
        email=enquiry.get("email"),
        subject=enquiry.get("subject"),
        message=enquiry.get("message")
    )
    db.add(item)
    db.commit()
    return {"message": "Contact enquiry logged successfully"}