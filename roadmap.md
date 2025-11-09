# 🧭 Roadmap – CV Analyzer & Job Matcher

> Proiect web bazat pe AI care analizează CV-ul unui utilizator, oferă un scor de calitate și recomandări de îmbunătățire, iar opțional compară CV-ul cu joburi reale de pe internet.

---

## 🏗️ Structură generală

- **Frontend:** React + TailwindCSS  
- **Backend:** FastAPI (Python)  
- **DB:** PostgreSQL  
- **AI/NLP:** spaCy + Sentence Transformers + OpenAI API  
- **Deployment:** Vercel (frontend) / Render (backend) / Supabase (DB)

---

## 📅 Etape de dezvoltare (MVP complet – ~6 săptămâni)

---

### 🟢 Etapa 1 – Upload & Parsing CV (Săptămâna 1–2)

**🎯 Obiectiv:** Permite utilizatorului să urce un fișier CV și să extragă textul din el.

**📁 Fișiere implicate:**
- `frontend/src/pages/Analyze.tsx`
- `frontend/src/components/UploadCV.tsx`
- `frontend/src/services/cvService.ts`
- `backend/app/main.py`
- `backend/app/routers/cv_routes.py`
- `backend/app/services/cv_parser.py`
- `backend/app/utils/file_utils.py`

**✅ Task-uri:**
- [ ] Creează endpoint `/analyze_cv` în backend (POST)
- [ ] Extrage textul din PDF/DOCX (folosind `PyMuPDF` sau `docx2txt`)
- [ ] Trimite textul extras înapoi ca JSON
- [ ] Creează UI pentru upload (drag & drop)
- [ ] Afișează textul returnat în interfață

**⏱️ Estimare:** 10–15 ore

---

### 🟡 Etapa 2 – Scoring & AI Feedback (Săptămâna 3–4)

**🎯 Obiectiv:** Analizează CV-ul și oferă un scor + recomandări inteligente.

**📁 Fișiere implicate:**
- `backend/app/services/cv_scorer.py`
- `backend/app/utils/scoring_rules.py`
- `backend/app/services/ai_feedback.py`
- `frontend/src/components/ScoreCard.tsx`

**✅ Task-uri:**
- [ ] Implementează funcția `calculate_cv_score(text)` cu reguli fixe:
  - Lungime optimă
  - Prezență secțiuni (Educație, Experiență, Skilluri)
  - Cuvinte de acțiune (“developed”, “managed”, “led”)
- [ ] Creează endpoint `/analyze_cv` care returnează:
  ```json
  {
    "score": 82,
    "criteria": { "structure": 90, "clarity": 75, "keywords": 80 },
    "feedback": ["Adaugă cifre în experiența ta", "Include secțiunea Skills"]
  }
