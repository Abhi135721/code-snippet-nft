var CodeSnippetNFT = artifacts.require("CodeSnippetNFT");

module.exports = function(deployer,networks,accounts) {
  var receiver=accounts[1]; 
  var balance=10000000000000000000;  
  deployer.deploy(CodeSnippetNFT);
};
