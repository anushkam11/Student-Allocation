import subprocess
import json
import os
from typing import List
from models import Student, Company

def run_cpp_algorithms(students: List[Student], companies: List[Company], algorithm: str = "all"):
    # Construct input JSON
    input_data = {
        "algorithm": algorithm,
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "cgpa": s.cgpa,
                "skills": s.skills,
                "preferences": s.preferences,
                "resume_status": s.resume_status
            } for s in students
        ],
        "companies": [
            {
                "id": c.id,
                "name": c.name,
                "required_skills": c.required_skills,
                "open_roles": c.open_roles
            } for c in companies
        ]
    }
    
    input_str = json.dumps(input_data)
    
    executable_path = os.path.join(os.path.dirname(__file__), "cpp_core", "allocator.out")
    
    # Run the C++ executable
    result = subprocess.run(
        [executable_path],
        input=input_str,
        text=True,
        capture_output=True
    )
    
    if result.returncode != 0:
        print("C++ Error:", result.stderr)
        raise RuntimeError("C++ algorithm execution failed")
        
    try:
        output_data = json.loads(result.stdout)
        return output_data
    except json.JSONDecodeError:
        print("C++ Output was not valid JSON:", result.stdout)
        raise RuntimeError("C++ algorithm returned invalid JSON")
