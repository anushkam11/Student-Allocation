from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    college_id = Column(String)
    branch = Column(String)
    cgpa = Column(Float, default=0.0)
    skills = Column(Text, default="")  # Comma separated
    preferences = Column(Text, default="") # Comma separated company names
    resume_status = Column(String, default="Pending")
    
    allocations = relationship("Allocation", back_populates="student")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String)
    required_skills = Column(Text) # Comma separated
    open_roles = Column(Integer, default=1)

    allocations = relationship("Allocation", back_populates="company")

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    algorithm = Column(String) # 'greedy' or 'backtracking'
    score = Column(Float)
    match_percentage = Column(Float)
    missing_skills = Column(Text)

    student = relationship("Student", back_populates="allocations")
    company = relationship("Company", back_populates="allocations")
