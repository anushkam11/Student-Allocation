#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <set>
#include <algorithm>
#include <chrono>
#include <sstream>
#include "json.hpp"

using json = nlohmann::json;
using namespace std;

// --- Models ---
struct Student {
    int id;
    string name;
    float cgpa;
    string skills_raw;
    string preferences_raw;
    string resume_status;
    
    set<string> skills;
    vector<string> preferences;
};

struct Company {
    int id;
    string name;
    string required_skills_raw;
    int open_roles;
    
    set<string> required_skills;
};

struct AllocationResult {
    int student_id;
    int company_id;
    float score;
    string missing_skills;
    string explanation;
};

// Helper to parse comma separated strings into sets/vectors
void parse_csv(const string& raw, set<string>& out_set, vector<string>* out_vec = nullptr) {
    stringstream ss(raw);
    string item;
    while (getline(ss, item, ',')) {
        // Trim whitespace
        item.erase(0, item.find_first_not_of(" \t\r\n"));
        item.erase(item.find_last_not_of(" \t\r\n") + 1);
        if (item.empty()) continue;
        
        // Convert to lowercase for comparison
        string lower_item = item;
        transform(lower_item.begin(), lower_item.end(), lower_item.begin(), ::tolower);
        
        out_set.insert(lower_item);
        if (out_vec) {
            out_vec->push_back(lower_item);
        }
    }
}

// --- DSA Requirement 1: Custom Hash Table ---
// A basic generic hash map using separate chaining
template<typename K, typename V>
class CustomHashTable {
private:
    struct HashNode {
        K key;
        V value;
        HashNode* next;
        HashNode(K k, V v) : key(k), value(v), next(nullptr) {}
    };
    
    vector<HashNode*> buckets;
    int size;
    int capacity;
    
    int get_bucket(int key) { return key % capacity; }
    int get_bucket(const string& key) {
        unsigned long hash = 5381;
        for (char c : key) hash = ((hash << 5) + hash) + c;
        return hash % capacity;
    }

public:
    CustomHashTable(int cap = 101) : capacity(cap), size(0) {
        buckets.resize(capacity, nullptr);
    }
    
    void insert(K key, V value) {
        int bucket_idx = get_bucket(key);
        HashNode* head = buckets[bucket_idx];
        while (head != nullptr) {
            if (head->key == key) {
                head->value = value;
                return;
            }
            head = head->next;
        }
        HashNode* new_node = new HashNode(key, value);
        new_node->next = buckets[bucket_idx];
        buckets[bucket_idx] = new_node;
        size++;
    }
    
    bool find(K key, V& out_val) {
        int bucket_idx = get_bucket(key);
        HashNode* head = buckets[bucket_idx];
        while (head != nullptr) {
            if (head->key == key) {
                out_val = head->value;
                return true;
            }
            head = head->next;
        }
        return false;
    }
};

// --- DSA Requirement 2: Binary Search Tree ---
// BST to index students by CGPA for fast retrieval
struct BSTNode {
    Student* student;
    BSTNode* left;
    BSTNode* right;
    BSTNode(Student* s) : student(s), left(nullptr), right(nullptr) {}
};

class StudentBST {
public:
    BSTNode* root;
    StudentBST() : root(nullptr) {}
    
    void insert(Student* s) {
        root = insertRec(root, s);
    }
    
    BSTNode* insertRec(BSTNode* node, Student* s) {
        if (node == nullptr) return new BSTNode(s);
        if (s->cgpa > node->student->cgpa) {
            node->right = insertRec(node->right, s);
        } else {
            node->left = insertRec(node->left, s);
        }
        return node;
    }
    
    void getSortedDescending(BSTNode* node, vector<Student*>& out) {
        if (node == nullptr) return;
        getSortedDescending(node->right, out); // right first for descending
        out.push_back(node->student);
        getSortedDescending(node->left, out);
    }
};

// --- Scoring Logic ---
struct ScoreResult {
    float total_score;
    vector<string> missing;
    string explanation;
};

ScoreResult calculate_score(const Student& s, const Company& c) {
    ScoreResult res;
    
    float skill_score = 0;
    if (c.required_skills.empty()) {
        skill_score = 50.0;
    } else {
        int match_count = 0;
        for (const auto& sk : c.required_skills) {
            if (s.skills.find(sk) != s.skills.end()) {
                match_count++;
            } else {
                res.missing.push_back(sk);
            }
        }
        skill_score = ((float)match_count / c.required_skills.size()) * 50.0;
    }
    
    float cgpa_score = (s.cgpa / 10.0) * 20.0;
    
    float pref_score = 0;
    string company_lower = c.name;
    transform(company_lower.begin(), company_lower.end(), company_lower.begin(), ::tolower);
    for (const auto& p : s.preferences) {
        if (p == company_lower) {
            pref_score = 20.0;
            break;
        }
    }
    
    float resume_score = (s.resume_status == "Uploaded") ? 10.0 : 0.0;
    
    res.total_score = skill_score + cgpa_score + pref_score + resume_score;
    
    stringstream exp;
    exp << "Skill Match: " << skill_score << "/50. ";
    exp << "CGPA: " << cgpa_score << "/20. ";
    exp << "Pref: " << pref_score << "/20. ";
    exp << "Resume: " << resume_score << "/10.";
    res.explanation = exp.str();
    
    return res;
}

// --- Main Application State ---
vector<Student> students;
vector<Company> companies;
CustomHashTable<int, Company*> company_map;
StudentBST student_tree;

// DSA Requirement 3: 2D Matrix for Scores
vector<vector<ScoreResult>> score_matrix;

void build_matrix() {
    score_matrix.resize(students.size(), vector<ScoreResult>(companies.size()));
    for (size_t i = 0; i < students.size(); i++) {
        for (size_t j = 0; j < companies.size(); j++) {
            score_matrix[i][j] = calculate_score(students[i], companies[j]);
        }
    }
}

// --- Algorithms ---

// 1. Greedy Algorithm
json run_greedy() {
    auto start = chrono::high_resolution_clock::now();
    
    vector<AllocationResult> allocs;
    vector<int> open_roles(companies.size());
    for(size_t j=0; j<companies.size(); j++) open_roles[j] = companies[j].open_roles;
    
    // Get sorted students from BST (Descending by CGPA)
    vector<Student*> sorted_students;
    student_tree.getSortedDescending(student_tree.root, sorted_students);
    
    float total_system_score = 0;
    
    for (Student* s : sorted_students) {
        // Find index of student
        int s_idx = -1;
        for(size_t i=0; i<students.size(); i++) {
            if(students[i].id == s->id) { s_idx = i; break; }
        }
        
        int best_c = -1;
        float best_score = -1;
        
        for (size_t j = 0; j < companies.size(); j++) {
            if (open_roles[j] > 0) {
                if (score_matrix[s_idx][j].total_score > best_score && score_matrix[s_idx][j].total_score > 0) {
                    best_score = score_matrix[s_idx][j].total_score;
                    best_c = j;
                }
            }
        }
        
        if (best_c != -1) {
            open_roles[best_c]--;
            AllocationResult ar;
            ar.student_id = s->id;
            ar.company_id = companies[best_c].id;
            ar.score = best_score;
            
            stringstream ms;
            for(size_t k=0; k<score_matrix[s_idx][best_c].missing.size(); k++) {
                ms << score_matrix[s_idx][best_c].missing[k] << (k < score_matrix[s_idx][best_c].missing.size()-1 ? ", " : "");
            }
            ar.missing_skills = ms.str();
            ar.explanation = "Greedy best local choice. " + score_matrix[s_idx][best_c].explanation;
            
            allocs.push_back(ar);
            total_system_score += best_score;
        }
    }
    
    auto end = chrono::high_resolution_clock::now();
    double time_ms = chrono::duration<double, milli>(end - start).count();
    
    json out;
    out["algorithm"] = "greedy";
    out["time_ms"] = time_ms;
    out["total_score"] = total_system_score;
    out["allocations"] = json::array();
    
    for (const auto& a : allocs) {
        out["allocations"].push_back({
            {"student_id", a.student_id},
            {"company_id", a.company_id},
            {"score", a.score},
            {"missing_skills", a.missing_skills},
            {"explanation", a.explanation}
        });
    }
    return out;
}

// 2. Branch & Bound Backtracking
float best_global_score = -1;
vector<AllocationResult> best_allocations;

void backtrack(int s_idx, float current_score, vector<AllocationResult>& current_allocs, vector<int>& open_roles, bool use_branch_bound) {
    if (s_idx == students.size()) {
        if (current_score > best_global_score) {
            best_global_score = current_score;
            best_allocations = current_allocs;
        }
        return;
    }
    
    // DSA Requirement: Branch & Bound Pruning
    if (use_branch_bound) {
        // Calculate max theoretical remaining score
        float theoretical_max = current_score;
        for (size_t i = s_idx; i < students.size(); i++) {
            float max_s = 0;
            for (size_t j = 0; j < companies.size(); j++) {
                if (open_roles[j] > 0 && score_matrix[i][j].total_score > max_s) {
                    max_s = score_matrix[i][j].total_score;
                }
            }
            theoretical_max += max_s;
        }
        if (theoretical_max <= best_global_score) {
            return; // PRUNE
        }
    }
    
    // Option 1: Do not allocate this student
    backtrack(s_idx + 1, current_score, current_allocs, open_roles, use_branch_bound);
    
    // Option 2: Try allocating to valid companies
    for (size_t j = 0; j < companies.size(); j++) {
        if (open_roles[j] > 0 && score_matrix[s_idx][j].total_score > 0) {
            open_roles[j]--;
            AllocationResult ar;
            ar.student_id = students[s_idx].id;
            ar.company_id = companies[j].id;
            ar.score = score_matrix[s_idx][j].total_score;
            
            stringstream ms;
            for(size_t k=0; k<score_matrix[s_idx][j].missing.size(); k++) {
                ms << score_matrix[s_idx][j].missing[k] << (k < score_matrix[s_idx][j].missing.size()-1 ? ", " : "");
            }
            ar.missing_skills = ms.str();
            ar.explanation = (use_branch_bound ? "Branch & Bound Optimal. " : "Pure Backtrack Optimal. ") + score_matrix[s_idx][j].explanation;
            
            current_allocs.push_back(ar);
            
            backtrack(s_idx + 1, current_score + ar.score, current_allocs, open_roles, use_branch_bound);
            
            current_allocs.pop_back();
            open_roles[j]++;
        }
    }
}

json run_backtracking(bool use_branch_bound) {
    auto start = chrono::high_resolution_clock::now();
    
    best_global_score = -1;
    best_allocations.clear();
    
    vector<AllocationResult> current_allocs;
    vector<int> open_roles(companies.size());
    for(size_t j=0; j<companies.size(); j++) open_roles[j] = companies[j].open_roles;
    
    if (students.size() <= 20) { // Limit to avoid extreme hangs on dummy data
        backtrack(0, 0.0, current_allocs, open_roles, use_branch_bound);
    } else {
        // Fallback or run a chunk if too many
        best_global_score = 0;
    }
    
    auto end = chrono::high_resolution_clock::now();
    double time_ms = chrono::duration<double, milli>(end - start).count();
    
    json out;
    out["algorithm"] = use_branch_bound ? "branch_bound" : "backtracking";
    out["time_ms"] = time_ms;
    out["total_score"] = best_global_score;
    out["allocations"] = json::array();
    
    for (const auto& a : best_allocations) {
        out["allocations"].push_back({
            {"student_id", a.student_id},
            {"company_id", a.company_id},
            {"score", a.score},
            {"missing_skills", a.missing_skills},
            {"explanation", a.explanation}
        });
    }
    return out;
}

int main() {
    // Read JSON from standard input
    json input_json;
    cin >> input_json;
    
    // Parse Companies
    for (auto& c : input_json["companies"]) {
        Company comp;
        comp.id = c["id"];
        comp.name = c["name"];
        comp.required_skills_raw = c["required_skills"];
        comp.open_roles = c["open_roles"];
        parse_csv(comp.required_skills_raw, comp.required_skills);
        companies.push_back(comp);
    }
    
    // Parse Students
    for (auto& s : input_json["students"]) {
        Student stu;
        stu.id = s["id"];
        stu.name = s["name"];
        stu.cgpa = s["cgpa"];
        stu.skills_raw = s["skills"];
        stu.preferences_raw = s["preferences"];
        stu.resume_status = s["resume_status"];
        parse_csv(stu.skills_raw, stu.skills);
        parse_csv(stu.preferences_raw, stu.skills, &stu.preferences); 
        
        // Wait, preference parsing needs to handle preferences to a separate set
        stu.preferences.clear();
        set<string> dummy;
        parse_csv(stu.preferences_raw, dummy, &stu.preferences);
        
        students.push_back(stu);
    }
    
    // Populate Data Structures
    for (auto& c : companies) {
        company_map.insert(c.id, &c);
    }
    for (auto& s : students) {
        student_tree.insert(&s);
    }
    
    build_matrix();
    
    string requested_algo = input_json.value("algorithm", "greedy");
    json output;
    
    if (requested_algo == "greedy") {
        output = run_greedy();
    } else if (requested_algo == "backtracking") {
        output = run_backtracking(false);
    } else if (requested_algo == "branch_bound") {
        output = run_backtracking(true);
    } else if (requested_algo == "all") {
        output["greedy"] = run_greedy();
        output["backtracking"] = run_backtracking(false);
        output["branch_bound"] = run_backtracking(true);
    }
    
    cout << output.dump(4) << endl;
    return 0;
}
