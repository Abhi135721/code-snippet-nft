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
    //uint256 MAX_VALUE = 115792089237316195423570985008687907853269984665640564;
    uint256 MAX_VALUE = 99999999;
    //manager of smart contract
    address custodian;

    //To represent the status of the code snippet
    enum ApprovalStatus {notverified, verified, requested, requestapproved}

    //To store the detais of the codesnippet
    struct CodeSnippet {
        string name;
        string language;
        string code;
        uint256 price;
        address currentOwner;
        ApprovalStatus approvalStatus;
        address requestedBy; 
    }

    //Used to store the approved codesnippet tockenids
    uint256[] public approvedCodeSnippetTokens;
    //Used to store the pending approved codesnippet tockenids
    uint256[] public pendingApprovalCodeSnippetTokens;

    uint256[] public requestedCodeSnippetTokens;

    //CodeSnippet[] private codeSnippets;
    // Using the tokenids of codesnippet to identify the details of codesnippets uniquely
    mapping (uint256 => CodeSnippet) public codeSnippets;

    //mapping of creators with their tokenIds who created code snippets 
    mapping (address => uint256) creators;

    mapping (address => uint256[]) addressTokens;

    //Modifier to Check wherther the person tried to access is Custodian or not
    modifier onlyCustodian(){
        require(msg.sender == custodian);
        _;
    }

   //Modifier to Check wherther sent amount is sufficien to buy the codesnippet or not
    modifier validAmount(uint256 tokenId){
        require(codeSnippets[tokenId].price == msg.value, "Invalid amount to buy code snippet");
        _;
    }
    
    //Modifier to Check given tockenid is valid or not
    modifier validToken(uint256 tokenId){
        require(_exists(tokenId), "CodeSnippetNFT: Token does not exist");
        _;
    }

    //Modifier to Check whether the  seller is valid or not
    modifier validSeller(uint256 tokenId){
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

    function getCustodianAddress() public view returns (address){
        return custodian;
    }

    function createCodeSnippet(string memory name, string memory language, string memory code, uint256 price) public returns(uint256)  {
       //Using the time stamp as the unique Tocken id.
        uint256 tokenId = getCurrentTimeStamp();
        address creator = msg.sender;
        //Creating the tocken for codesnippet
        _safeMint(creator, tokenId);
        approve(custodian, tokenId);
        creators[creator] = tokenId;
        addressTokens[creator].push(tokenId);
        CodeSnippet memory newCodeSnippet =  CodeSnippet(name, language, code, price, creator, ApprovalStatus.notverified, address(0));
        codeSnippets[tokenId] = newCodeSnippet;
        pendingApprovalCodeSnippetTokens.push(tokenId);
        return tokenId;
    }

    function getIndex(uint256[] memory arr, uint256 item)public view returns(uint256){
        for(uint256 i = 0; i < arr.length; i++){
            if(arr[i] == item)
                return i;
        }
        return MAX_VALUE;
    }

    //function to approve the code snippets created by the developer to place on sale
    function approveCodeSnippet(uint256 tokenId) public onlyCustodian  validToken(tokenId) returns(uint256[] memory, uint256[] memory, ApprovalStatus){
        codeSnippets[tokenId].approvalStatus = ApprovalStatus.verified;

        approvedCodeSnippetTokens.push(tokenId);
        uint256 pendApprIndex = MAX_VALUE;
        //getIndex(pendingApprovalCodeSnippetTokens, tokenId);
        for(uint256 i = 0; i < pendingApprovalCodeSnippetTokens.length; i++){
            if(pendingApprovalCodeSnippetTokens[i] == tokenId){
                pendApprIndex = i;
                break;
            } 
        }
        require(pendApprIndex != MAX_VALUE && pendApprIndex < pendingApprovalCodeSnippetTokens.length, "CodeSnippetNFT: token not present in pending approval list");
        //delete pendingApprovalCodeSnippetTokens[pendApprIndex];
        for(uint256 i = pendApprIndex; i < pendingApprovalCodeSnippetTokens.length - 1; i++){
            pendingApprovalCodeSnippetTokens[i] = pendingApprovalCodeSnippetTokens[i+1];
        }
        pendingApprovalCodeSnippetTokens.pop();
        return (pendingApprovalCodeSnippetTokens, approvedCodeSnippetTokens, codeSnippets[tokenId].approvalStatus);
    }

    function getPendingApprovalTokens() public view onlyCustodian returns(uint256[] memory){
        uint256[] memory tokens = pendingApprovalCodeSnippetTokens;
        return tokens;
    }

    function getApprovedTokens() public view returns(uint256[] memory){
        uint256[] memory tokens = approvedCodeSnippetTokens;
        return tokens;
    }

    function getrequestedTokens() public view returns(uint256[] memory){
        uint256[] memory tokens = requestedCodeSnippetTokens;
        return tokens;
    }

    //Function which is used by the owner to get their code snippet
    function getCodeSnippet(uint256 _tokenId) public view validToken(_tokenId) returns (string memory, string memory, string memory, uint256, ApprovalStatus, address ){
        //require(codeSnippets[_tokenId].currentOwner == msg.sender || msg.sender == custodian, "Only owner/custodian can view code snippets");
        CodeSnippet memory codeSnippet = codeSnippets[_tokenId];
        return (codeSnippet.name, codeSnippet.language, codeSnippet.code, codeSnippet.price, codeSnippet.approvalStatus, codeSnippet.currentOwner);
    }

    function requestCodeSnippet(uint256 tokenId) public payable validAmount(tokenId)
    {
        //remove from approved list
        //uint256 apprIndex = getIndex(approvedCodeSnippetTokens, tokenId);
        uint256 apprIndex = MAX_VALUE;
        //getIndex(pendingApprovalCodeSnippetTokens, tokenId);
        for(uint256 i = 0; i < approvedCodeSnippetTokens.length; i++){
            if(approvedCodeSnippetTokens[i] == tokenId){
                apprIndex = i;
                break;
            } 
        }
        //delete approvedCodeSnippetTokens[apprIndex];
        for(uint256 i = apprIndex; i < approvedCodeSnippetTokens.length - 1; i++){
            approvedCodeSnippetTokens[i] = approvedCodeSnippetTokens[i+1];
        }
        approvedCodeSnippetTokens.pop();
        requestedCodeSnippetTokens.push(tokenId);
        codeSnippets[tokenId].requestedBy = msg.sender;
        codeSnippets[tokenId].approvalStatus = ApprovalStatus.requested;
        
        //payable(address(this)).transfer(codeSnippets[tokenId].price);
    }

    //function for buying the code snippets available
    function approveCodeSnippetRequestAndTransfer(uint256 tokenId) public payable {
       
        address payable currentOwner = payable(codeSnippets[tokenId].currentOwner);
        uint256 price = codeSnippets[tokenId].price;
        address _buyer = codeSnippets[tokenId].requestedBy;
        //change owner
        safeTransferFrom(currentOwner, _buyer, tokenId);
        codeSnippets[tokenId].currentOwner = _buyer;

        //transfer amount from buyer to original owner
        currentOwner.transfer(price);

        codeSnippets[tokenId].approvalStatus = ApprovalStatus.requestapproved;

        uint256 reqIndex = MAX_VALUE;
        //getIndex(pendingApprovalCodeSnippetTokens, tokenId);
        for(uint256 i = 0; i < requestedCodeSnippetTokens.length; i++){
            if(requestedCodeSnippetTokens[i] == tokenId){
                reqIndex = i;
                break;
            } 
        }
        //delete approvedCodeSnippetTokens[reqIndex];
        for(uint256 i = reqIndex; i < requestedCodeSnippetTokens.length - 1; i++){
            requestedCodeSnippetTokens[i] = requestedCodeSnippetTokens[i+1];
        }
        requestedCodeSnippetTokens.pop();

        uint256 tokIndex = MAX_VALUE;
        for(uint256 i = 0; i < addressTokens[currentOwner].length; i++){
            if(addressTokens[currentOwner][i] == tokenId){
                tokIndex = i;
                break;
            } 
        }
        for(uint256 i = tokIndex; i < addressTokens[currentOwner].length - 1; i++){
            addressTokens[currentOwner][i] = addressTokens[currentOwner][i+1];
        }
        addressTokens[currentOwner].pop();

        addressTokens[_buyer].push(tokenId);
        
    }

    function getMyTokens() public view returns(uint256[] memory)
    {
        address csowner = msg.sender;
        return addressTokens[csowner];
    }

    //function to sell the code snippet
    function sellCodeSnippet(uint256 tokenId, uint256 price) public validToken(tokenId) validSeller(tokenId) {
        codeSnippets[tokenId].price = price;
        codeSnippets[tokenId].approvalStatus = ApprovalStatus.verified;
        approvedCodeSnippetTokens.push(tokenId);
        approve(custodian, tokenId);
    }
}