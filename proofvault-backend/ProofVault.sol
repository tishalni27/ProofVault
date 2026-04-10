// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofVault {
    struct Proof {
        string fileHash;
        uint256 timestamp;
        address uploader;
        string documentTitle;
        string documentType;
    }

    mapping(string => Proof) private proofs;
    string[] private allHashes;

    event HashStored(
        string fileHash,
        uint256 timestamp,
        address uploader,
        string documentTitle,
        string documentType
    );

    function storeHash(
        string memory _fileHash,
        string memory _documentTitle,
        string memory _documentType
    ) public {
        require(bytes(_fileHash).length > 0, "Empty hash");
        require(bytes(proofs[_fileHash].fileHash).length == 0, "Hash already stored");

        proofs[_fileHash] = Proof({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            uploader: msg.sender,
            documentTitle: _documentTitle,
            documentType: _documentType
        });

        allHashes.push(_fileHash);

        emit HashStored(
            _fileHash,
            block.timestamp,
            msg.sender,
            _documentTitle,
            _documentType
        );
    }

    function verifyHash(string memory _fileHash)
        public
        view
        returns (
            bool exists,
            uint256 timestamp,
            address uploader,
            string memory documentTitle,
            string memory documentType
        )
    {
        Proof memory proof = proofs[_fileHash];

        if (bytes(proof.fileHash).length == 0) {
            return (false, 0, address(0), "", "");
        }

        return (
            true,
            proof.timestamp,
            proof.uploader,
            proof.documentTitle,
            proof.documentType
        );
    }

    function getProof(string memory _fileHash)
        public
        view
        returns (
            string memory fileHash,
            uint256 timestamp,
            address uploader,
            string memory documentTitle,
            string memory documentType
        )
    {
        require(bytes(proofs[_fileHash].fileHash).length > 0, "Hash not found");

        Proof memory proof = proofs[_fileHash];
        return (
            proof.fileHash,
            proof.timestamp,
            proof.uploader,
            proof.documentTitle,
            proof.documentType
        );
    }

    function getTotalProofs() public view returns (uint256) {
        return allHashes.length;
    }

    function getHashByIndex(uint256 index) public view returns (string memory) {
        require(index < allHashes.length, "Index out of bounds");
        return allHashes[index];
    }
}