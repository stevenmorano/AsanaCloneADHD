# AI Agent strict Protocol & Instruction Manual

All autonomous or semi-autonomous AI agents operating within this workspace **MUST STRICTLY ADHERE** to the following protocol loop. 

### Mandatory Workflow

1. **Read Context First**
   Before executing *any* task, generating *any* code, or making assumptions, you must read all base `.md` files located in the root directory (e.g., `product_requirements.md`, `data_schema.md`, `gamification_logic.md`). 

2. **Never Guess Architecture**
   Our product philosophy ("ADHD low-friction dopamine engine") is highly opinionated. Do not inject standard PM database hierarchies or standard CRUD app behavior. Refer directly to the schema and logic files whenever designing a new view, storing data, or deciding on interactions.

3. **Log All Progress**
   Document every major change or newly completed feature by checking off the corresponding item in `project_roadmap.md`. If a feature required new sub-steps, add them logically to the roadmap.

4. **Handoff Summary**
   At the end of your conversation or specific task block, provide the user with a concise summary of what was accomplished, what blockers remain, and exactly where the *next* specialized agent needs to pick up.
