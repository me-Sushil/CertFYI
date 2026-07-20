// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DocumentAnchor
 * @dev Anchors document hashes and revocations on-chain with Merkle tree support
 */
contract DocumentAnchor is Ownable, ReentrancyGuard {
    
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
    mapping(address => bool) public approvedIssuers;
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

    event IssuerApproved(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    // Modifiers
    modifier onlyApprovedIssuer() {
        require(approvedIssuers[msg.sender], "Issuer not approved");
        _;
    }

    /**
     * @dev Approve an issuer address
     */
    function approveIssuer(address _issuer) external onlyOwner {
        approvedIssuers[_issuer] = true;
        emit IssuerApproved(_issuer);
    }

    /**
     * @dev Revoke an issuer's privileges
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        approvedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }

    /**
     * @dev Anchor a single document hash
     */
    function anchorDocument(
        bytes32 _documentHash,
        string memory _documentType
    ) external onlyApprovedIssuer nonReentrant {
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
    ) external onlyApprovedIssuer nonReentrant {
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
        require(doc.issuer == msg.sender || msg.sender == owner(), "Only issuer or owner can revoke");
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
     * @dev Check if an issuer is approved
     */
    function isIssuerApproved(address _issuer) external view returns (bool) {
        return approvedIssuers[_issuer];
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
