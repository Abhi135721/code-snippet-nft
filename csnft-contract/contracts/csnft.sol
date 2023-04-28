// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//used to import the ERC721 smart contract 
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/*
Solidity smart contract that inherits from ERC721, which is the standard interface 
for non-fungible tokens (NFTs) on the Ethereum blockchain.
*/
contract CodeSnippetNFT is ERC721 {

    //max value
    //uint MAX_VALUE = 115792089237316195423570985008687907853269984665640564;
    uint MAX_VALUE = 99999999;
    //manager of smart contract
    address custodian;

    //To represent the status of the code snippet
    enum ApprovalStatus {notverified, verified}

    //To store the detais of the codesnippet
    struct CodeSnippet {
        string name;
        string language;
        string code;
        uint price;
        address currentOwner;
        ApprovalStatus approvalStatus;
    }

    //Used to store the approved codesnippet tockenids
    uint[] private approvedCodeSnippetTokens;
    //Used to store the pending approved codesnippet tockenids
    uint[] private pendingApprovalCodeSnippetTokens;

    //CodeSnippet[] private codeSnippets;
    // Using the tokenids of codesnippet to identify the details of codesnippets uniquely
    mapping (uint => CodeSnippet) private codeSnippets;

    //mapping of creators with their tokenIds who created code snippets 
    mapping (address => uint) creators;

    //Modifier to Check wherther the person tried to access is Custodian or not
    modifier onlyCustodian(){
        require(msg.sender == custodian);
        _;
    }

   //Modifier to Check wherther sent amount is sufficien to buy the codesnippet or not
    modifier validAmount(uint tokenId){
        require(codeSnippets[tokenId].price == msg.value, "Invalid amount to buy code snippet");
        _;
    }
    
    //Modifier to Check given tockenid is valid or not
    modifier validToken(uint tokenId){
        require(_exists(tokenId), "CodeSnippetNFT: Token does not exist");
        _;
    }

    //Modifier to Check whether the  seller is valid or not
    modifier validSeller(uint tokenId){
        require(codeSnippets[tokenId].currentOwner == msg.sender);
        _;
    }

    constructor() ERC721("CodeSnippetNFT", "CSNFT") 
    {
        custodian = msg.sender;
    }

    function getCurrentTimeStamp() public view returns (uint256){
        return block.timestamp;
    }

    function getCustodianAddress() public view onlyCustodian returns (uint256){
        return custodian;
    }

    function createCodeSnippet(string memory name, string memory language, string memory code, uint price) public returns(uint256)  {
       //Using the time stamp as the unique Tocken id.
        uint256 tokenId = getCurrentTimeStamp();
        address creator = msg.sender;
        //Creating the tocken for codesnippet
        _safeMint(creator, tokenId);
        creators[creator] = tokenId;
        CodeSnippet memory newCodeSnippet =  CodeSnippet(name, language, code, price, creator, ApprovalStatus.notverified);
        codeSnippets[tokenId] = newCodeSnippet;
        pendingApprovalCodeSnippetTokens.push(tokenId);
        return tokenId;
    }

    function getIndex(uint[] memory arr, uint item)public view returns(uint){
        for(uint i = 0; i < arr.length; i++){
            if(arr[i] == item)
                return i;
        }
        return MAX_VALUE;
    }

    //function to approve the code snippets created by the developer to place on sale
    function approveCodeSnippet(uint tokenId) public onlyCustodian  validToken(tokenId){
        codeSnippets[tokenId].approvalStatus = ApprovalStatus.verified;

        uint pendApprIndex = getIndex(pendingApprovalCodeSnippetTokens, tokenId);
        require(pendApprIndex != MAX_VALUE, "CodeSnippetNFT: token not present in pending approval list");
        delete pendingApprovalCodeSnippetTokens[pendApprIndex];

        approvedCodeSnippetTokens.push(tokenId);
    }

    //Function which is used by the owner to get their code snippet
    function getCodeSnippet(uint256 _tokenId) public view validToken(_tokenId) returns (string memory, string memory, string memory){
        require(codeSnippets[_tokenId].currentOwner == msg.sender || msg.sender == custodian, "Only owner/custodian can view code snippets");
        CodeSnippet memory codeSnippet = codeSnippets[_tokenId];
        return (codeSnippet.name, codeSnippet.language, codeSnippet.code);
    }


    //function for buying the code snippets available
    function buyCodeSnippet(uint tokenId) public payable validAmount(tokenId) validToken(tokenId) {
        address buyer = msg.sender;
        address payable currentOwner = payable(codeSnippets[tokenId].currentOwner);
        uint price = codeSnippets[tokenId].price;

        //transfer amount from buyer to original owner
        currentOwner.transfer(price);
        //remove from approved list
        uint apprIndex = getIndex(approvedCodeSnippetTokens, tokenId);
        delete approvedCodeSnippetTokens[apprIndex];
        //change owner
        safeTransferFrom(currentOwner, buyer, tokenId);
        codeSnippets[tokenId].currentOwner = msg.sender;
    }


    //function to sell the code snippet
    function sellCodeSnippet(uint tokenId, uint price) public validToken(tokenId) validSeller(tokenId) {
        codeSnippets[tokenId].price = price;
        approvedCodeSnippetTokens.push(tokenId);
    }
}