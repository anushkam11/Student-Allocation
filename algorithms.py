def calculate_score(student, company):
    # Skill Match (50%)
    student_skills = set(s.strip().lower() for s in student.skills.split(',')) if student.skills else set()
    company_skills = set(s.strip().lower() for s in company.required_skills.split(',')) if company.required_skills else set()
    
    if not company_skills:
        skill_score = 50.0
        missing_skills = []
    else:
        match_count = len(student_skills.intersection(company_skills))
        skill_score = (match_count / len(company_skills)) * 50.0
        missing_skills = list(company_skills - student_skills)

    # CGPA (20%) - Assume max CGPA is 10.0
    cgpa_score = (student.cgpa / 10.0) * 20.0

    # Preference (20%)
    student_prefs = [p.strip().lower() for p in student.preferences.split(',')] if student.preferences else []
    if company.name.lower() in student_prefs:
        pref_score = 20.0
    else:
        pref_score = 0.0

    # Resume (10%) - Dummy check
    resume_score = 10.0 if student.resume_status == "Uploaded" else 0.0

    total_score = skill_score + cgpa_score + pref_score + resume_score
    return total_score, missing_skills

def greedy_allocation(students, companies):
    allocations = []
    # To keep track of open roles
    company_roles = {c.id: c.open_roles for c in companies}
    
    # Sort students by CGPA or just iterate
    for student in sorted(students, key=lambda x: x.cgpa, reverse=True):
        best_company = None
        best_score = -1
        best_missing = []
        
        for company in companies:
            if company_roles[company.id] > 0:
                score, missing = calculate_score(student, company)
                if score > best_score:
                    best_score = score
                    best_company = company
                    best_missing = missing
        
        if best_company and best_score > 0:
            allocations.append({
                "student_id": student.id,
                "company_id": best_company.id,
                "score": best_score,
                "missing_skills": ",".join(best_missing)
            })
            company_roles[best_company.id] -= 1
            
    return allocations

def backtracking_allocation(students, companies):
    # A simplified backtracking to maximize global score
    # For large datasets this is O(C^S) where C is companies, S is students
    # We will implement a small bounded version
    
    best_global_score = -1
    best_allocations = []
    
    company_roles = {c.id: c.open_roles for c in companies}
    
    def backtrack(student_idx, current_score, current_allocations):
        nonlocal best_global_score, best_allocations
        
        if student_idx == len(students):
            if current_score > best_global_score:
                best_global_score = current_score
                best_allocations = list(current_allocations)
            return
            
        student = students[student_idx]
        
        # Option 1: Do not allocate this student (score doesn't increase)
        backtrack(student_idx + 1, current_score, current_allocations)
        
        # Option 2: Allocate to a valid company
        for company in companies:
            if company_roles[company.id] > 0:
                score, missing = calculate_score(student, company)
                if score > 0: # Only allocate if there's some compatibility
                    company_roles[company.id] -= 1
                    current_allocations.append({
                        "student_id": student.id,
                        "company_id": company.id,
                        "score": score,
                        "missing_skills": ",".join(missing)
                    })
                    
                    backtrack(student_idx + 1, current_score + score, current_allocations)
                    
                    # Backtrack
                    current_allocations.pop()
                    company_roles[company.id] += 1

    # Run backtracking if students count is small, else fallback to greedy to prevent infinite loop
    if len(students) <= 15:
        backtrack(0, 0.0, [])
    else:
        # Fallback for too many students
        best_allocations = greedy_allocation(students, companies)
        
    return best_allocations
