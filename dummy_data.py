from sqlalchemy.orm import Session
import models

def seed_data(db: Session):
    if db.query(models.Company).first():
        return # Already seeded
        
    companies = [
        {"name": "TCS", "city": "Pune", "required_skills": "Java, SQL, Spring Boot", "open_roles": 5},
        {"name": "Infosys", "city": "Bangalore", "required_skills": "Python, Django, SQL", "open_roles": 3},
        {"name": "Wipro", "city": "Hyderabad", "required_skills": "C++, Algorithms, Data Structures", "open_roles": 4},
        {"name": "Accenture", "city": "Mumbai", "required_skills": "React, Node.js, MongoDB", "open_roles": 2},
        {"name": "Cognizant", "city": "Chennai", "required_skills": "Angular, .NET, SQL", "open_roles": 3},
        {"name": "Flipkart", "city": "Bangalore", "required_skills": "Java, Spring, Microservices, System Design", "open_roles": 2},
        {"name": "Zomato", "city": "Gurgaon", "required_skills": "Python, React, AWS", "open_roles": 2},
        {"name": "Amazon India", "city": "Hyderabad", "required_skills": "Java, AWS, System Design, Algorithms", "open_roles": 5},
    ]
    
    for c in companies:
        db.add(models.Company(**c))
        
    students = [
        {"name": "Aarav Sharma", "email": "aarav@test.com", "password": "pass", "college_id": "C01", "branch": "Computer Science", "cgpa": 9.2, "skills": "Java, Spring Boot, SQL", "preferences": "TCS, Amazon India", "resume_status": "Uploaded"},
        {"name": "Diya Patel", "email": "diya@test.com", "password": "pass", "college_id": "C02", "branch": "Information Technology", "cgpa": 8.5, "skills": "Python, Django, AWS", "preferences": "Zomato, Infosys", "resume_status": "Uploaded"},
        {"name": "Rohan Gupta", "email": "rohan@test.com", "password": "pass", "college_id": "C03", "branch": "Electronics", "cgpa": 7.8, "skills": "C++, Algorithms, Data Structures", "preferences": "Wipro, Amazon India", "resume_status": "Pending"},
        {"name": "Sneha Reddy", "email": "sneha@test.com", "password": "pass", "college_id": "C04", "branch": "Computer Science", "cgpa": 9.6, "skills": "React, Node.js, MongoDB, AWS", "preferences": "Accenture, Zomato", "resume_status": "Uploaded"},
        {"name": "Arjun Kumar", "email": "arjun@test.com", "password": "pass", "college_id": "C05", "branch": "Mechanical", "cgpa": 8.0, "skills": "Python, SQL", "preferences": "Infosys, TCS", "resume_status": "Uploaded"},
        {"name": "Anjali Desai", "email": "anjali@test.com", "password": "pass", "college_id": "C06", "branch": "Information Technology", "cgpa": 9.0, "skills": "Java, Microservices, System Design", "preferences": "Flipkart, Amazon India", "resume_status": "Uploaded"},
    ]
    
    for s in students:
        db.add(models.Student(**s))
        
    db.commit()
