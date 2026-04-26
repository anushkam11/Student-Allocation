from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import time

import models, schemas, algorithms, dummy_data, cpp_runner
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Allocation System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    dummy_data.seed_data(db)

@app.get("/")
def read_root():
    return {"message": "Allocation System API running"}

@app.post("/students/", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.email == student.email).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_student = models.Student(
        name=student.name,
        email=student.email,
        password=student.password, # In production, hash this!
        college_id=student.college_id,
        branch=student.branch
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@app.get("/students/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.put("/students/{student_id}/profile", response_model=schemas.StudentResponse)
def update_profile(student_id: int, profile: schemas.StudentProfileUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student.name = profile.name
    student.branch = profile.branch
    student.cgpa = profile.cgpa
    student.skills = profile.skills
    student.preferences = profile.preferences
    
    db.commit()
    db.refresh(student)
    return student

@app.get("/companies/", response_model=list[schemas.CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()

@app.get("/students/", response_model=list[schemas.StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    return db.query(models.Student).all()

@app.post("/students/login")
def login_student(credentials: dict, db: Session = Depends(get_db)):
    email = credentials.get("email")
    password = credentials.get("password")
    student = db.query(models.Student).filter(models.Student.email == email, models.Student.password == password).first()
    if not student:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"id": student.id}

@app.post("/admin/allocate/compare")
def run_all_allocations(db: Session = Depends(get_db)):
    all_students = db.query(models.Student).all()
    # PREVENT EXPONENTIAL TIMEOUT: Backtracking is O(M^N). 
    # If users keep signing up, N grows and freezes the server. 
    # We bound N to the 6 most recent students to keep execution under 1 second.
    students = all_students[-6:] if len(all_students) > 6 else all_students
    
    companies = db.query(models.Company).all()
    
    # Calls C++ binary for Greedy, Backtracking, and Branch & Bound
    results = cpp_runner.run_cpp_algorithms(students, companies, "all")
    
    return results

@app.get("/student/{student_id}/allocation")
def get_student_allocation(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    companies = db.query(models.Company).all()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    results = cpp_runner.run_cpp_algorithms([student], companies, "greedy")
    
    allocs = results.get("allocations", [])
    allocated = allocs[0] if allocs else None
    
    missing = allocated["missing_skills"] if allocated and allocated.get("missing_skills") else ""
    
    return {
        "recommended": [], # Could be extracted from matrix later
        "allocated_greedy": allocated,
        "skill_gap_analyzer": f"Learn {missing} to increase chances" if missing else "You match perfectly!"
    }
