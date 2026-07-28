// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DocumentAnchor
 * @dev Anchors document hashes and revocations on-chain with Merkle tree support.
 * Access is role-gated via OpenZeppelin AccessControl: ADMIN_ROLE manages ISSUER_ROLE
 * membership (grantRole/revokeRole), and only ISSUER_ROLE holders may anchor documents.
 */
contract DocumentAnchor is AccessControl, ReentrancyGuard {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // Document struct to store metadata
    struct Document {
        bytes32 hash;
        address issuer;
        uint256 timestamp;
        bool revoked;
        string documentType;
    }

    // Merkle tree batch struct
    struct MerkleBatch {
        bytes32 merkleRoot;
        address issuer;
        uint256 documentCount;
        uint256 timestamp;
        string batchId;
    }

    // Mappings
    mapping(bytes32 => Document) public documents;
    mapping(bytes32 => bool) public revokedDocuments;
    mapping(bytes32 => MerkleBatch) public merkleBatches;
    mapping(bytes32 => bool) public usedMerkleRoots;

    // Events
    event DocumentAnchored(
        bytes32 indexed documentHash,
        address indexed issuer,
        string documentType,
        uint256 timestamp
    );

    event DocumentRevoked(
        bytes32 indexed documentHash,
        address indexed issuer,
        uint256 timestamp
    );

    event MerkleRootAnchored(
        bytes32 indexed merkleRoot,
        address indexed issuer,
        uint256 documentCount,
        uint256 timestamp,
        string batchId
    );

    event IssuerMetadataSet(
        address indexed issuer,
        string metadataURI,
        uint256 timestamp
    );

    /**
     * @dev Deployer receives root ADMIN_ROLE (and DEFAULT_ADMIN_ROLE so it can
     * manage ADMIN_ROLE membership itself). ADMIN_ROLE is set as the admin of
     * ISSUER_ROLE, so any admin can grantRole(ISSUER_ROLE, wallet) directly.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ISSUER_ROLE, ADMIN_ROLE);
    }

    /**
     * @dev Anchor a single document hash
     */
    function anchorDocument(
        bytes32 _documentHash,
        string memory _documentType
    ) external onlyRole(ISSUER_ROLE) nonReentrant {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(documents[_documentHash].timestamp == 0, "Document already anchored");

        documents[_documentHash] = Document({
            hash: _documentHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            revoked: false,
            documentType: _documentType
        });

        emit DocumentAnchored(_documentHash, msg.sender, _documentType, block.timestamp);
    }

    /**
     * @dev Anchor multiple documents using Merkle root for gas efficiency
     */
    function anchorMerkleBatch(
        bytes32 _merkleRoot,
        uint256 _documentCount,
        string memory _batchId
    ) external onlyRole(ISSUER_ROLE) nonReentrant {
        require(_merkleRoot != bytes32(0), "Invalid merkle root");
        require(!usedMerkleRoots[_merkleRoot], "Merkle root already used");
        require(_documentCount > 0, "Invalid document count");

        usedMerkleRoots[_merkleRoot] = true;
        merkleBatches[_merkleRoot] = MerkleBatch({
            merkleRoot: _merkleRoot,
            issuer: msg.sender,
            documentCount: _documentCount,
            timestamp: block.timestamp,
            batchId: _batchId
        });

        emit MerkleRootAnchored(_merkleRoot, msg.sender, _documentCount, block.timestamp, _batchId);
    }

    /**
     * @dev Revoke a document
     */
    function revokeDocument(bytes32 _documentHash) external nonReentrant {
        Document storage doc = documents[_documentHash];
        require(doc.timestamp != 0, "Document not found");
        require(doc.issuer == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Only issuer or admin can revoke");
        require(!doc.revoked, "Document already revoked");

        doc.revoked = true;
        revokedDocuments[_documentHash] = true;

        emit DocumentRevoked(_documentHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify if a document is valid and not revoked
     */
    function verifyDocument(bytes32 _documentHash) external view returns (bool) {
        Document memory doc = documents[_documentHash];
        
        if (doc.timestamp == 0) {
            return false; // Document not anchored
        }
        
        return !doc.revoked;
    }

    /**
     * @dev Get document details
     */
    function getDocument(bytes32 _documentHash) 
        external 
        view 
        returns (
            address issuer,
            uint256 timestamp,
            bool revoked,
            string memory documentType
        ) 
    {
        Document memory doc = documents[_documentHash];
        return (doc.issuer, doc.timestamp, doc.revoked, doc.documentType);
    }

    /**
     * @dev Get Merkle batch details
     */
    function getMerkleBatch(bytes32 _merkleRoot)
        external
        view
        returns (
            address issuer,
            uint256 documentCount,
            uint256 timestamp,
            string memory batchId
        )
    {
        MerkleBatch memory batch = merkleBatches[_merkleRoot];
        return (batch.issuer, batch.documentCount, batch.timestamp, batch.batchId);
    }

    /**
     * @dev Check if an issuer is approved (holds ISSUER_ROLE)
     */
    function isIssuerApproved(address _issuer) external view returns (bool) {
        return hasRole(ISSUER_ROLE, _issuer);
    }

    /**
     * @dev Set off-chain issuer profile metadata URI. ADMIN_ROLE only.
     */
    function setIssuerMetadata(
        address _issuer,
        string calldata _metadataURI
    ) external onlyRole(ADMIN_ROLE) {
        require(hasRole(ISSUER_ROLE, _issuer), "Not an issuer");
        emit IssuerMetadataSet(_issuer, _metadataURI, block.timestamp);
    }

    /**
     * @dev Verify Merkle proof for a document in a batch
     * This can be used to verify that a document is part of the anchored batch
     */
    function verifyMerkleProof(
        bytes32[] calldata _proof,
        bytes32 _merkleRoot,
        bytes32 _leaf
    ) external pure returns (bool) {
        bytes32 computedHash = _leaf;

        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == _merkleRoot;
    }
}
