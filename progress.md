# CertFYI — SRS vs Implementation Progress Report

> **Legend:** ✅ Done | 🔶 Partial / Mocked | ❌ Not Started | N/A Not Applicable

---

## 1. Project Structure & Architecture (SRS §3, §10.1)

| SRS Requirement | Status | Notes |
|---|---|---|
| **Monorepo with `apps/` + `packages/` + `contracts/` + `services/`** | 🔶 | Turborepo monorepo exists, but `packages/` dir (shared-types, pdf-toolkit) missing; contracts live inside `apps/api/contracts/` instead of top-level `contracts/`; no separate `services/` dir |
| **Separate frontend apps: web-admin, web-issuer, web-verifier** | ❌ | Single Next.js app serves all roles (Admin, Issuer, Verifier) via route gating |
| **`@certfyi/shared-types` package** | ❌ | Not created; types are inlined in `apps/web/lib/api-types.ts` |
| **`@certfyi/pdf-toolkit` package** | ❌ | Not created; no dedicated PDF hashing/metadata/merkle package |
| **`infra/` directory (Docker, CI/CD, Terraform)** | ❌ | Not created |
| **Smart contracts in top-level `contracts/` dir** | ❌ | Contracts are in `apps/api/contracts/` |
| **pnpm workspaces + Turborepo** | ✅ | Configured and working |

---

## 2. Smart Contracts (SRS §7)

### SRS specifies TWO contracts: `IssuerRegistry` + `CredentialAnchor`
### Current has ONE combined contract: `DocumentAnchor.sol`

### 2a. IssuerRegistry Contract (SRS §7.2)

| SRS Function | Status | Notes |
|---|---|---|
| `registerIssuer(address, string metadataURI)` — Admin grants ISSUER_ROLE + links metadata | 🔶 | DocumentAnchor has `_grantRole(ISSUER_ROLE, addr)` via OpenZeppelin, but no metadataURI or IPFS profile linkage; no dedicated IssuerRegistry contract |
| `suspendIssuer(address)` — Admin revokes ISSUER_ROLE | 🔶 | Uses OpenZeppelin's `revokeRole(ISSUER_ROLE, addr)` — works but no dedicated function |
| `isApprovedIssuer(address) view returns (bool)` | ✅ | `isIssuerApproved()` exists in DocumentAnchor |
| `event IssuerRegistered(address, string, uint256)` | ❌ | Not emitted; no registration event exists |
| `event IssuerSuspended(address, uint256)` | ❌ | Not emitted; no suspension event exists |
| **Separate IssuerRegistry contract** | ❌ | Combined into DocumentAnchor |

### 2b. CredentialAnchor Contract (SRS §7.3)

| SRS Requirement | Status | Notes |
|---|---|---|
| `anchorDocument(bytes32 docHash, bytes32 recipientRef, string cid)` | 🔶 | Current `anchorDocument()` takes `(bytes32 _documentHash, string _documentType)` — missing `recipientRef` and `cid` parameters |
| `anchorBatch(bytes32 merkleRoot, uint256 count, string batchCid)` | 🔶 | Current `anchorMerkleBatch()` takes `(bytes32, uint256, string _batchId)` — has `batchId` instead of `batchCid`; no IPFS CID |
| `revoke(bytes32 docHash)` — only original issuer or Admin | ✅ | `revokeDocument()` works as specified |
| `verify(bytes32 docHash) view returns (Status, address, uint256)` | 🔶 | `verifyDocument()` returns only `bool` (not Status enum); `getDocument()` returns details but no Status enum; no `recipientRef` in return |
| `verifyWithProof(bytes32, bytes32[], bytes32) view returns (bool)` | ✅ | `verifyMerkleProof()` exists and works |
| **Status enum: NotFound, Valid, Revoked** | ❌ | Not implemented; only boolean checks |
| `event DocumentAnchored(bytes32, address, string, uint256)` | 🔶 | Emitted but with `documentType` instead of `cid`; no `recipientRef` |
| `event BatchAnchored(bytes32, address, uint256, string, uint256)` | 🔶 | Emitted but with `batchId` instead of `batchCid`; no IPFS reference |
| `event DocumentRevoked(bytes32, address, uint256)` | ✅ | Matches SRS exactly |

### 2c. General Contract Requirements

| SRS Requirement | Status | Notes |
|---|---|---|
| **Upgradeable proxy pattern (UUPS/Transparent)** | ❌ | Contract is not upgradeable — immutable deployment with no migration strategy |
| **OpenZeppelin AccessControl** | ✅ | Used |
| **ReentrancyGuard** | ✅ | Used on state-mutating functions |
| **DEFAULT_ADMIN_ROLE held by multisig** | ❌ | Granted to deployer (single EOA) |
| **Pausable** | ❌ | No pause mechanism for emergencies |
| **Gas optimization: bytes32 over strings** | 🔶 | Uses `string memory` for documentType and batchId |
| **Gas optimization: events over storage** | 🔶 | Stores full Document structs on-chain (needed for reads) |
| **Hardhat config + deploy script** | ✅ | Exists |
| **TypeChain types generated** | ✅ | Exists |
| **Unit tests** | ✅ | `DocumentAnchor.test.ts` exists |
| **Deployed to testnet** | ❌ | Not deployed |

---

## 3. Backend API — NestJS (SRS §9.2)

### 3a. Auth Module

| SRS Requirement | Status | Notes |
|---|---|---|
| SIWE-based authentication | ✅ | Full nonce → sign → verify flow |
| JWT session (httpOnly cookie) | ✅ | `certfyi_session` cookie, 7-day expiry |
| Role-based session (Admin/Issuer/Unapproved) | ✅ | Implemented |
| Session query endpoint | ✅ | `GET /api/auth/session` |
| Logout | ✅ | `POST /api/auth/logout` |

### 3b. Admin Module

| SRS Requirement | Status | Notes |
|---|---|---|
| `POST /api/issuers` — Admin registers a new issuer | ❌ | Not implemented; uses `POST /api/admin/approve-user` instead |
| `PATCH /api/issuers/:address` — Admin suspend/reinstate issuer | ❌ | Not implemented |
| List pending access requests | ✅ | `GET /api/admin/requests` |
| Approve issuer (on-chain grantRole) | ✅ | `POST /api/admin/approve-user` — calls RPC |
| Reject issuer | ✅ | `POST /api/admin/reject-user` |
| Configure EVM network(s) for issuances (FR-A6) | ❌ | Not implemented |
| View platform-wide audit log (FR-A5) | 🔶 | Admin audit-log UI exists, but backend `GET /api/audit-log` not implemented; UI likely uses frontend-only mock data |

### 3c. Issuer Module

| SRS Requirement | Status | Notes |
|---|---|---|
| `POST /api/issuer/request` — Submit access request | ✅ | Implemented |
| `GET /api/issuer/request` — Check request status | ✅ | Implemented |
| In-app/email notification on approval (FR-I9) | ❌ | Not implemented |

### 3d. Documents Module

| SRS Requirement | Status | Notes |
|---|---|---|
| `POST /api/documents/issue` — Single document issuance | 🔶 | Uses `POST /api/documents/anchor` instead; backend creates FAKE txHash (crypto.randomBytes), no actual blockchain transaction |
| `POST /api/documents/bulk-issue` — Batch issuance | 🔶 | Uses `POST /api/documents/anchor-batch` instead; Merkle root computed but txHash is fake, no real contract call |
| `POST /api/documents/:docHash/revoke` — Revoke a document | ❌ | Not implemented as an endpoint |
| `GET /api/documents?issuer=:address` — List by issuer | ❌ | Not implemented |
| **IPFS upload** (FR-I4) | ❌ | No IPFS integration anywhere — no Pinata/web3.storage/self-hosted IPFS calls |
| **PDF metadata embedding (vPDF)** (FR-I6) | ❌ | No embedding of txHash, CID, Merkle proof into PDF metadata; no vPDF download |
| **Recipient identity attachment** (FR-I2) | ❌ | No recipient data model; no name/email/identifier fields in issuance flow backend |
| **SHA-256 fingerprint display to issuer** (FR-I3) | ❌ | Not implemented pre-issuance |
| **Email notification on confirmation** (FR-I9) | ❌ | Not implemented |
| **Bulk: CSV validation** (FR-B2) | 🔶 | Frontend UI has CSV upload, but backend validation not confirmed |
| **Bulk: progress indicator + summary** (FR-B5) | 🔶 | Frontend UI exists, but backend processing is mock |
| **Bulk: support 1,000 docs** (FR-B6) | ❌ | No load testing done; backend uses in-memory storage |

### 3e. PDF Module

| SRS Requirement | Status | Notes |
|---|---|---|
| PDF upload with validation (type/size) | ✅ | `POST /api/pdf/upload` exists |
| SHA-256 hashing of PDF | 🔶 | Hash is computed but `PATCH /api/pdf/upload` endpoint may store it; unclear if stored persistently |
| **IPFS upload of PDF** (FR-I4) | ❌ | Not implemented |
| **IPFS upload of metadata JSON sidecar** (SRS §8.2) | ❌ | Not implemented |

### 3f. Verification Module

| SRS Requirement | Status | Notes |
|---|---|---|
| `POST /api/verify` — Public verification endpoint | 🔶 | Uses `POST /api/documents/verify` instead; backend checks in-memory map only — no blockchain query |
| Upload PDF to verify (FR-V1) | ✅ | Frontend UI complete with drag-and-drop |
| Recompute SHA-256 and compare with on-chain record (FR-V2) | 🔶 | Hash is computed client-side; comparison is against in-memory mock data, not the chain |
| Report: Valid / Revoked / Tampered / Not Found (FR-V3) | 🔶 | UI shows "verified" / "revoked" / "not_found" / "error" — "Tampered" status is NOT implemented; "verified" used instead of "Valid" |
| Display issuer identity + recipient ref + timestamp (FR-V4) | 🔶 | Issuer identity displayed but from mock data; recipient reference not shown |
| Block explorer link (FR-V5) | 🔶 | UI has explorer URL display but uses mock URLs |
| Verify by hash/CID (FR-V6) | ❌ | Only file upload flow; no text input for txHash or CID |
| **Sub-3s response for cached docs** (NFR) | ❌ | Uses mock 2s delay; no real performance testing |
| **Sub-10s for live chain query** (NFR) | ❌ | No live chain querying implemented |

### 3g. Security Infrastructure (SRS §5, §10.4)

| SRS Requirement | Status | Notes |
|---|---|---|
| SessionGuard (JWT verification via jose) | ✅ | Implemented |
| RolesGuard (role-based access) | ✅ | Implemented |
| `@CurrentUser()` decorator | ✅ | Implemented |
| Helmet security headers | ✅ | Enabled in main.ts |
| CORS configured | ✅ | Configured for web app origin |
| Cookie-parser | ✅ | Enabled |
| Global ValidationPipe | ✅ | Whitelist + transform enabled |
| **Rate limiting on public endpoints** (NFR) | ❌ | Not implemented |
| **File upload malware scanning** (NFR) | ❌ | Not implemented |
| **Encryption of recipient personal data at rest** (§10.4) | ❌ | Not implemented |
| **Private keys never on frontend** | ✅ | Signing in wallet (SIWE) |
| **Hardware-backed server signer** (§5) | ❌ | Not implemented |
| **Contracts independently audited** (§10.4) | ❌ | Not audited |

---

## 4. Database / Prisma (SRS §8.3)

| SRS Table | Status | Notes |
|---|---|---|
| **AccessRequest** (wallet, name, email, org, status) | ✅ | Exists — the ONLY model |
| **issuers** (wallet_address PK, name, status, metadata_uri, registered_at) | ❌ | Not created |
| **credentials** (doc_hash PK, issuer, cid, recipient_ref, tx_hash, batch_id, issued_at, revoked_at) | ❌ | Not created; all issuance data is in-memory only |
| **batches** (batch_id PK, merkle_root, issuer, tx_hash, doc_count, cid_manifest, issued_at) | ❌ | Not created |
| **recipients** (recipient_ref PK, name, email, identifier_type, identifier_value_encrypted) | ❌ | Not created; no recipient data model exists |
| **audit_log** (id PK, actor, action, target, timestamp) | ❌ | Not created |
| PostgreSQL hosted on Render | ✅ | Connection configured |

---

## 5. Frontend Pages & Features (SRS §3.2, §9.1)

### 5a. Admin Dashboard

| SRS Feature | Status | Notes |
|---|---|---|
| Login via secured auth (FR-A1) | ✅ | SIWE + JWT session |
| Review issuer applications (FR-A2) | ✅ | Pending requests list with approve/reject |
| Register approved issuer on-chain (FR-A3) | ✅ | Calls `grantRole(ISSUER_ROLE)` via RPC |
| Suspend/reactivate issuer (FR-A4) | 🔶 | UI has suspend/reactivate buttons but actual `revokeRole` call not confirmed working |
| View filterable audit log (FR-A5) | 🔶 | UI exists at `/admin/audit-log` but likely uses mock data |
| Configure EVM networks (FR-A6) | ❌ | Not implemented |
| Issuer directory | ❌ | Not implemented |

### 5b. Issuer Dashboard

| SRS Feature | Status | Notes |
|---|---|---|
| Only approved issuers can issue (FR-I1) | ✅ | Role-gated via RolesGuard |
| Upload PDF + recipient data (FR-I2) | 🔶 | PDF upload works; recipient data fields not implemented in form |
| SHA-256 fingerprint display (FR-I3) | ❌ | Not shown to issuer pre-issuance |
| IPFS storage (FR-I4) | ❌ | Not implemented |
| Blockchain anchoring (FR-I5) | ❌ | Not implemented — uses mock txHash |
| vPDF download with embedded data (FR-I6) | ❌ | Not implemented |
| Issuance history (FR-I7) | 🔶 | `/issuer/history` UI exists but likely uses mock/empty data |
| Revoke document (FR-I8) | 🔶 | Revoke button exists in UI; backend endpoint not verified |
| Notifications (FR-I9) | ❌ | Not implemented |

### 5c. Verifier Portal

| SRS Feature | Status | Notes |
|---|---|---|
| No-login access (FR-V1) | ✅ | Public page |
| Drag-and-drop PDF upload | ✅ | Implemented with SHA-256 hashing |
| On-chain comparison (FR-V2) | ❌ | Uses mock data, no real chain query |
| Status reporting: Valid/Revoked/Tampered/Not Found (FR-V3) | 🔶 | Shows verified/revoked/not_found/error; "Tampered" missing |
| Issuer identity + timestamp display (FR-V4) | 🔶 | Displayed but from mock data; no recipient ref shown |
| Block explorer link (FR-V5) | 🔶 | URL shown but for mock transactions |
| Verify by hash/CID (FR-V6) | ❌ | Not implemented |
| Verification under 3s (NFR) | ❌ | Not tested; mock has 2s delay |

### 5d. Bulk Issuance

| SRS Feature | Status | Notes |
|---|---|---|
| CSV upload with recipient data (FR-B1) | 🔶 | UI for CSV exists; actual CSV parsing + matching not verified |
| Validate PDF↔CSV matching (FR-B2) | 🔶 | UI may validate; backend validation not confirmed |
| Merkle tree + single tx anchoring (FR-B3) | 🔶 | Merkle root computed in blockchain service; but txHash is fake |
| Individual Merkle proof per doc (FR-B4) | ❌ | Proof generation may exist in blockchain service but no embedding or vPDF output |
| Progress indicator + summary (FR-B5) | 🔶 | UI exists; backend processing is mock |
| 1,000 doc batch support (FR-B6) | ❌ | Untested |

---

## 6. IPFS Integration (SRS §2.2, §4.1, §6.3, §8.2)

| SRS Requirement | Status | Notes |
|---|---|---|
| **Store PDF on IPFS + return CID** (FR-I4) | ❌ | **No IPFS integration anywhere in the codebase** |
| **Store metadata JSON sidecar on IPFS** (§8.2) | ❌ | No metadata JSON schema implemented |
| **Pin content via managed service** (Pinata/web3.storage) | ❌ | No pinning service integration |
| **Retrieve from IPFS during verification** | ❌ | Not implemented |
| **Embed IPFS CID in vPDF metadata** (FR-I6) | ❌ | Not applicable (no IPFS yet) |
| **IPFS Metadata schema** (§8.2): docHash, issuerAddress, issuerName, recipient, documentType, issuedAt, chain, txHash, merkle, revoked | ❌ | Not implemented |

---

## 7. PDF Metadata Embedding / vPDF (SRS §6.3)

| SRS Requirement | Status | Notes |
|---|---|---|
| Embed transaction hash into PDF metadata | ❌ | Not implemented |
| Embed IPFS CID into PDF metadata | ❌ | Not implemented |
| Embed Merkle proof into PDF metadata (for batch) | ❌ | Not implemented |
| Produce downloadable vPDF post-issuance | ❌ | Not implemented |
| Auto-email vPDF to recipient(s) | ❌ | Not implemented |

---

## 8. Non-Functional Requirements (SRS §5)

| NFR | Status | Notes |
|---|---|---|
| Private keys never on frontend | ✅ | SIWE pattern; signing in wallet |
| Smart contract security audit before mainnet | ❌ | Not audited |
| OpenZeppelin audited patterns | ✅ | AccessControl + ReentrancyGuard |
| API auth + roles on mutate endpoints | ✅ | SessionGuard + RolesGuard |
| Public read endpoints rate-limited | ❌ | Not implemented |
| Verification under 3s (cached) / 10s (live) | ❌ | Not tested; mock only |
| Bulk 1,000 docs: Merkle + IPFS within 5 min | ❌ | Untested; no IPFS |
| Backend horizontally scalable (stateless) | 🔶 | NestJS is stateless by design, but uses in-memory Maps for document storage — **NOT stateless** |
| Verifier Portal 99.5% uptime | ❌ | Not deployed/measured |
| Usability: <5 steps, no blockchain jargon for verifiers | ✅ | UI is clean and intuitive |
| Hash mismatch → "Tampered" status | ❌ | Not implemented — shows "not_found" instead |
| Every event publicly reviewable on block explorer | ❌ | No real transactions exist on-chain |
| GDPR: personal data minimized on-chain, encrypted off-chain | ❌ | No recipient data handling at all |
| Smart contracts deployable to any EVM chain without code changes | 🔶 | Contract is chain-agnostic but hardhat config has hardcoded network settings |
| **Multisig for DEFAULT_ADMIN_ROLE** (§10.4) | ❌ | Single deployer EOA |
| **File upload malware scanning** (§10.4) | ❌ | Not implemented |
| **Encrypt recipient data at rest** (§10.4) | ❌ | Not applicable (no recipient data model) |
| **Monitor contract events via indexer/subgraph** (§10.4) | ❌ | Not implemented |

---

## 9. REST API Endpoint Compliance (SRS §9.2)

| SRS Endpoint | Current Implementation | Status |
|---|---|---|
| `POST /api/issuers` | `POST /api/admin/approve-user` | 🔶 Different path/contract |
| `PATCH /api/issuers/:address` | Not implemented | ❌ |
| `POST /api/documents/issue` | `POST /api/documents/anchor` | 🔶 Different path; missing params |
| `POST /api/documents/bulk-issue` | `POST /api/documents/anchor-batch` | 🔶 Different path; missing params |
| `POST /api/documents/:docHash/revoke` | Not implemented | ❌ |
| `POST /api/verify` | `POST /api/documents/verify` | 🔶 Different path; mock implementation |
| `GET /api/documents?issuer=:address` | Not implemented | ❌ |
| `GET /api/audit-log` | Not implemented | ❌ |

---

## 10. Development Roadmap Compliance (SRS §10.3)

| Phase | Deliverables | Status |
|---|---|---|
| **Phase 1: Foundations** (3-4 wks) | Smart contracts, unit tests, testnet deployment, PDF hashing/metadata library | 🔶 Contracts written & tested but NOT deployed; PDF library not created |
| **Phase 2: Core Platform** (4-5 wks) | Admin dashboard, Issuer dashboard, backend API, IPFS integration | 🔶 UI dashboards exist; backend API scaffolded but uses mock data; IPFS ❌ |
| **Phase 3: Verification** (2-3 wks) | Public Verifier Portal, upload-to-verify flow, block explorer linking | 🔶 UI exists but uses mock data; no real chain querying; no explorer linking |
| **Phase 4: Bulk & Revocation** (3-4 wks) | Bulk issuance with Merkle batching, revocation flow, notifications | 🔶 UI exists; backend Merkle computation exists; but no real anchoring, no vPDF, no notifications, no email |
| **Phase 5: Hardening** (3-4 wks) | Security audit, load testing, rate limiting, monitoring/alerting | ❌ Not started |
| **Phase 6: Mainnet Launch** (1-2 wks) | Mainnet deployment, production infra, documentation | ❌ Not started |

---

## 11. Acceptance Criteria Compliance (SRS §11)

| Scenario | SRS Criteria | Status |
|---|---|---|
| **Issuer registration** | Admin approves → wallet gets ISSUER_ROLE on-chain → issuer can log in | ✅ Works as described (role granted via RPC) |
| **Single issuance** | PDF + recipient data → downloadable vPDF with txHash on block explorer matching DocumentAnchored event | ❌ No real tx, no vPDF, no recipient data, no event on real chain |
| **Bulk issuance** | 1,000 PDFs → single on-chain tx → every vPDF verifies via Merkle proof | ❌ No real tx, no vPDF generation, no Merkle proof embedding |
| **Verification (valid)** | Unmodified vPDF → "Valid" + correct issuer + timestamp matching explorer | ❌ Uses mock data; no real chain query |
| **Verification (tampered)** | Altered vPDF → "Tampered" (never "Valid") | ❌ "Tampered" status not implemented; shows "not_found" |
| **Revocation** | Issuer revokes → portal shows "Revoked" from next block onward | 🔶 UI can show revoked; no real on-chain revocation transaction |

---

## 12. Summary Overview

| Category | Status |
|---|---|
| **Monorepo/Infrastructure** | ✅ Foundations in place |
| **Frontend UI (all roles)** | ✅ Complete UI for all pages (design + flows) |
| **Frontend → Backend integration** | 🔶 API client exists; many endpoints use mock data |
| **Smart Contract** | ✅ Written + tested; ❌ not deployed; 🔶 missing features vs SRS |
| **Backend API** | 🔶 Scaffolded; auth is real; document operations are mock |
| **IPFS Integration** | ❌ Entirely missing |
| **PDF Metadata Embedding (vPDF)** | ❌ Entirely missing |
| **Recipient Identity Data Model** | ❌ Entirely missing |
| **Database** | 🔶 Only AccessRequest model; 5 required tables missing |
| **Real Blockchain Verification** | ❌ Not implemented (mock data only) |
| **Bulk Issuance (real)** | 🔶 Merkle math exists; no real on-chain anchoring |
| **Revocation (real)** | ❌ No endpoint for revocation |
| **Notifications** | ❌ Not implemented |
| **Security Hardening** | ❌ Rate limiting, audit, encryption, multisig all missing |
| **Production Deployment** | ❌ Not deployed |
| **Contract Audit** | ❌ Not audited |
| **Testing (E2E, load)** | ❌ Not done |

---

## 13. What Must Be Done (Prioritized)

### P0 — Core Functionality (Blocking)
1. Deploy DocumentAnchor contract to a testnet
2. Implement real on-chain `anchorDocument()` call in backend documents service
3. Integrate IPFS (Pinata/web3.storage) for PDF storage
4. Add Prisma models: `issuers`, `credentials`, `batches`, `recipients`, `audit_log`
5. Implement real on-chain `verify()` call in backend verification service
6. Add "Tampered" verification status (hash mismatch detection)

### P1 — Feature Completion
7. Add `recipientRef` + `cid` parameters to `anchorDocument()` contract function
8. Replace in-memory Maps with database persistence
9. Implement PDF metadata embedding (txHash, CID, Merkle proof) → vPDF download
10. Implement `POST /api/documents/:docHash/revoke` endpoint
11. Implement verify-by-hash/CID (FR-V6)
12. Implement recipient identity data collection in issuance flow (FR-I2)
13. Add IPFS metadata JSON sidecar per SRS §8.2 schema

### P2 — Admin & Audit
14. Implement `IssuerRegistry` as separate contract (or extend DocumentAnchor)
15. Add Admin network configuration UI (FR-A6)
16. Implement `GET /api/audit-log` endpoint with full event tracking
17. Implement `GET /api/documents?issuer=:address` endpoint

### P3 — Bulk & Notifications
18. Add real Merkle proof generation + embedding per document in batch
19. Implement email/in-app notifications for issuers (FR-I9)
20. Support batch sizes of 1,000 with performance validation

### P4 — Hardening & Production
21. Contract security audit
22. Add rate limiting on public endpoints
23. Implement upgradeable proxy pattern for contracts
24. Multisig for DEFAULT_ADMIN_ROLE
25. File upload malware scanning
26. Encrypt recipient personal data at rest
27. Load testing (especially bulk issuance)
28. Deploy to mainnet
29. CI/CD pipeline
30. Monitoring/alerting
