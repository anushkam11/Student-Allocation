from pydantic import BaseModel
from typing import List, Optional

class StudentBase(BaseModel):
    name: str
    email: str
    college_id: str
    branch: Optional[str] = None

class StudentCreate(StudentBase):
    password: str

class StudentProfileUpdate(BaseModel):
    name: str
    branch: str
    cgpa: float
    skills: str
    preferences: str

class StudentResponse(StudentBase):
    id: int
    cgpa: float
    skills: str
    preferences: str
    resume_status: str

    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    city: str
    required_skills: str
    open_roles: int

class CompanyResponse(CompanyBase):
    id: int

    class Config:
        from_attributes = True

class AllocationResponse(BaseModel):
    id: int
    student_id: int
    company_id: int
    algorithm: str
    score: float
    match_percentage: float
    missing_skills: str
    
    company: Optional[CompanyResponse] = None
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True
