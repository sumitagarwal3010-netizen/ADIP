# Team RACI

## Roles and responsibilities

| Activity | ML | GenAI | Backend | Frontend | DB | SRE | DevOps | QA | Security |
|----------|----|-------|---------|----------|----|-----|--------|----|----------|
| Prompt templates | C | R/A | C | I | I | I | I | C | C |
| LLM providers | C | R/A | R | I | I | C | C | C | C |
| Connectors | I | C | R/A | C | C | C | C | R | C |
| APIs | I | C | R/A | C | C | I | I | R | C |
| UI workbenches | I | C | C | R/A | I | I | I | R | I |
| Migrations | I | I | C | I | R/A | C | C | C | I |
| Deploy/Helm | I | I | C | I | C | C | R/A | C | C |
| Security/OIDC | I | I | R | R | I | C | R | C | R/A |
| Documentation | C | C | C | C | C | C | C | C | R |

R = Responsible, A = Accountable, C = Consulted, I = Informed

## Ownership matrix

| Module | Primary owner |
|--------|---------------|
| `app/llm/` | GenAI + ML |
| `app/connectors/` | Backend + GenAI |
| `app/services/rule_engine.py` | GenAI + QA |
| `src/pages/*` | Frontend |
| `alembic/` | DB |
| `deploy/` | DevOps + SRE |

## Escalation

1. **P1 outage** — SRE → DevOps → Backend lead
2. **Security incident** — Security architect → disable bypass, enable OIDC
3. **Data issue** — DB engineer → restore from backup
4. **LLM quality regression** — ML → GenAI → prompt regression run
