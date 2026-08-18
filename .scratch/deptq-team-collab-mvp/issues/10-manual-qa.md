# 10 — Manual QA with curl probes (Task 10)

Status: ready-for-agent
Type: task
Blocked by: 02, 03, 04, 05, 06, 07, 08, 09

## Task

Manual QA with two test accounts (`alice` = owner, `bob` = member). Run the probe list below; fix findings.

```bash
# bob joins via static link
curl -X POST localhost:3000/api/collections/<id>/join -b "bob_cookie"          # 200
curl -X POST localhost:3000/api/collections/<id>/join -b "bob_cookie"          # 200 (idempotent)
curl -X POST localhost:3000/api/collections/<id>/join -b "alice_cookie"        # 400 (owner)

# members list visible to both
curl localhost:3000/api/collections/<id>/members -b "alice_cookie"             # 200, includes bob
curl localhost:3000/api/collections/<id>/members -b "bob_cookie"               # 200

# bob adds his own doc, then removes it
curl -X POST localhost:3000/api/collections/<id>/documents -b "bob_cookie" \
  -H 'Content-Type: application/json' -d '{"documentId":"<bob_doc>"}'          # 200
curl -X DELETE localhost:3000/api/collections/<id>/documents/<alice_doc> -b "bob_cookie"  # 403 (fixed)
curl -X DELETE localhost:3000/api/collections/<id>/documents/<bob_doc> -b "bob_cookie"    # 200 (own doc)

# chat scoped to collection works for bob; blocked after removal
curl -X POST localhost:3000/api/chat -b "bob_cookie" ...                        # 200 while member
curl -X DELETE localhost:3000/api/collections/<id>/members/<bob_id> -b "alice_cookie"     # 200
curl -X POST localhost:3000/api/chat -b "bob_cookie" ...                        # 403 after removal

# owner protections
curl -X DELETE localhost:3000/api/collections/<id>/members/<alice_id> -b "bob_cookie"      # 403 (owner)
curl -X DELETE localhost:3000/api/collections/<id>/members/<alice_id> -b "alice_cookie"    # 403 (can't remove owner)

# hardening
curl -F 'file=@big_25mb.pdf' localhost:3000/api/upload -b "alice_cookie"       # 413
# 31st chat request within a minute                                             # 429
```

## Acceptance

- All probes return the expected codes; any failures fixed before closing.

## Comments

- Final gate before ticket 11.
