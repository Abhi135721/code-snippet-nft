App = {
    // top level varaibles
    web3: null,
    contracts: {},
    //development
    url:'http://127.0.0.1:7545',
    network_id:5777,
    sender:null,
    receiver:null,
    value:1000000000000000000,
    index:0,
	custodian : "",
	account: "",
	codeSnippetsForApprovalHtml: "",
	approvedCodeSnippetsHtml: "",
	requestedCodeSnippetsHtml: "",
	viewCodeSnippets: "",
    margin:10,
    left:15,
    init: function() {
      return App.initWeb3();
    },

    initWeb3: function(){
        //initializing web3      
        if (typeof web3 !== 'undefined') {
            App.web3 = new Web3(Web3.givenProvider);
        } else {
            App.web3 = new Web3(App.url);
        }
        ethereum.enable();    
		
		window.ethereum.on('accountsChanged', function(accountId){
			App.checkOwner();
			showStartPage();
		});
		
        return App.initContract();
    },

    initContract: function(){
        $.getJSON('CodeSnippetNFT.json', function(data) {      
            App.contracts.Payment = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});
			// console.log(App.contracts.Payment);
            //populating contract's balance
            //App.web3.eth.getBalance(App.contracts.Payment._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");})   
          }); 
		  //App.web3.eth.on('accountsChanged', App.checkOwner);
		  App.checkOwner();
          return App.bindEvents();
    },

	checkOwner: function(){
		App.web3.eth.getCoinbase(function(err, account) {
			App.account = account;
			App.contracts.Payment.methods.getCustodianAddress().call((error, custodian) =>{
				App.custodian =  custodian;
				if(error == null){
					if(custodian.toLowerCase() == account.toLowerCase()){
						$("#a-approve-code-snippets").show();
						$("#a-approve-requested-code-snippets").show();
						$("#a-explore-code-snippets").hide();
						$("#btn-explore-code-snippets").hide();
					}
					else{
						$("#a-approve-code-snippets").hide();
						$("#a-approve-requested-code-snippets").hide();
						$("#a-explore-code-snippets").show();
						$("#btn-explore-code-snippets").show();
					}
				}
				else{
					console.log(error);
				}
				
			});
		});
	},

	bindEvents: function(){
		$(document).on('click', '#btn-create-code-snippet', function(){
			App.handleCreateCodeSnippet();
		});

		$(document).on('click', '#a-approve-code-snippets', function(){
			App.handleApproveCodeSnippets();
		});

		$(document).on('click', '#btn-explore-code-snippets', function(){
			App.handleGetApprovedCodeSnippets();
		});
		
		$(document).on('click', "#btn-approve-code-snippet",function(){
			App.handleApproveSelectedCodeSnippet();
		});
		$(document).on('click', "#a-approve-requested-code-snippets",function(){
			App.handleApproveRequests();
		});

		$(document).on('click', "#btn-my-code-snippets",function(){
			App.handleViewCodeSnippets();
		});


	},
	sellCodeSnippet: function(tokenId){
		updatedPrice = $("#btnSellValue_" + tokenId).val();
		if(updatedPrice == "" || typeof(updatedPrice) === undefined){
			alert("Enter valid amount");
		}
		else{
			// console.log("sale tokenId: " + tokenId);
			// console.log("Updated sale value:" + updatedPrice);

			var weiamount=App.web3.utils.toWei(updatedPrice + '','ether')
			var amount=App.web3.utils.toHex(weiamount)
			var option = {from: App.account};
			App.contracts.Payment.methods.sellCodeSnippet(tokenId, amount).send(option).on('receipt', (receipt) =>{
				if(receipt.status){
					alert("Your code snippet is up for sale");
					showStartPage();
				}
			});
			alert("Your code snippet is up for sale");
			showStartPage();
		}
		
	},
	handleViewCodeSnippets: function(){
		myCodeSnippets();
		getSnippetoption = {from: App.account};
		App.viewCodeSnippets = "";
		App.contracts.Payment.methods.getMyTokens().call(getSnippetoption, function(error, data){
			// console.log(data);
			// console.log(error);
			if(error == null){
				if(data.length == 0)
				{
					App.viewCodeSnippets += "<p> No code snippets are owned by you!!! </p>";
					$("#viewCodeSnippets").html(App.viewCodeSnippets);
				}
				(function() {
					var i = 0;
					function appendmyCodeSnippet() {
						if (i < data.length) {
							tokenId = parseInt(data[i]);
							// console.log(tokenId);
							var getSnippetoption = {from: App.account};
							App.contracts.Payment.methods.getCodeSnippet(tokenId).call(getSnippetoption, function(getSnippeterror, snippetData){
								// console.log(snippetData);
								// console.log(tokenId);

								var price = App.web3.utils.fromWei(snippetData[3],"ether");
								let owner = snippetData[5];
								App.viewCodeSnippets += '<div class="col-lg-4 col-md-12 mb-2">';
								App.viewCodeSnippets += ' <div class="card h-100 shadow-lg">';
								App.viewCodeSnippets += ' 	<div class="card-body">';
								App.viewCodeSnippets += ' 	<div class="text-center p-3">';
								App.viewCodeSnippets += ' 		<h5 class="card-title">'+ snippetData[0] +'</h5>';
								App.viewCodeSnippets += ' 		<br>';
								App.viewCodeSnippets += ' 		<h5 class="card-title">'+ snippetData[1] +'</h5>';
								App.viewCodeSnippets += ' 		<br>';
								App.viewCodeSnippets += ' 		<span class="h2">'+ price +' ETH</span>';
								App.viewCodeSnippets += ' 		<br>';
								App.viewCodeSnippets += ' 	</div>';
								App.viewCodeSnippets += ' 	</div>';
								App.viewCodeSnippets += ' 	<div class="card-body text-center">';
								App.viewCodeSnippets += ' 	<button class="btn btn-outline-primary" style="border-radius:30px" onclick="App.viewAndApproveCodeSnippet(' + tokenId + ', 1);">View</button>';
								App.viewCodeSnippets += ' 	</div>';
								if(snippetData[4] == '3')
								{
									
									App.viewCodeSnippets += '<div class="card-body text-center">';
									App.viewCodeSnippets += '<div class="input-group mb-2" style="width: 70%; margin-left: 15%;">';
									App.viewCodeSnippets += '	<input type="text" class="form-control" placeholder="Update new price" aria-label="New Price" aria-describedby="basic-addon2" id="btnSellValue_' + tokenId + '">';
									App.viewCodeSnippets += '	<div class="input-group-append">';
									App.viewCodeSnippets += '		<button class="btn btn-outline-primary" type="button" onclick="App.sellCodeSnippet(' + tokenId + ');">Sell</button>';
									App.viewCodeSnippets += '	</div>';
									App.viewCodeSnippets += '</div>';
									//App.viewCodeSnippets += ' 	<button class="btn btn-outline-primary btn-lg" style="border-radius:30px" onclick="App.SellCodeSnippet(' + tokenId + ');">Sell</button>';
									App.viewCodeSnippets += '</div>';
								}	
								App.viewCodeSnippets += ' </div>';
								App.viewCodeSnippets += ' </div>';
								// console.log(App.viewCodeSnippets);
								$("#viewCodeSnippets").html(App.viewCodeSnippets);
								i++;
								appendmyCodeSnippet();
							});
						}
					}
					appendmyCodeSnippet();
				})();
				
			}
			else{
				console.log(error);
			}

		});
	},

	handleApproveRequests: function(){
		approveRequestedCodeSnippets();
		App.requestedCodeSnippetsHtml = "";
		App.contracts.Payment.methods.getrequestedTokens().call(function(error, data){
			// console.log("Requested tokens");
			// console.log(data);
			if(error == null){
				if(data.length == 0)
				{
					App.requestedCodeSnippetsHtml += "<p> No code snippets avaialable right now!!! </p>";
					$("#listRequestedCodeSnippets").html(App.requestedCodeSnippetsHtml);
				}
				else{
					(function() {
						var i = 0;
						function appendApprovedCodeSnippet() {
							if (i < data.length) {
								tokenId = parseInt(data[i]);
								// console.log(tokenId);
								var getSnippetoption = {from: App.account};
								App.contracts.Payment.methods.getCodeSnippet(tokenId).call(getSnippetoption, function(getSnippeterror, snippetData){
									// console.log(snippetData);
									// console.log(tokenId);
	
									var price = App.web3.utils.fromWei(snippetData[3],"ether");
									let owner = snippetData[5];
									// console.log("Code snippet price: " + price);
									App.requestedCodeSnippetsHtml += '<div class="col-lg-4 col-md-12 mb-2">';
									App.requestedCodeSnippetsHtml += ' <div class="card h-100 shadow-lg">';
									App.requestedCodeSnippetsHtml += ' 	<div class="card-body">';
									App.requestedCodeSnippetsHtml += ' 	<div class="text-center p-3">';
									App.requestedCodeSnippetsHtml += ' 		<h5 class="card-title">'+ snippetData[0] +'</h5>';
									App.requestedCodeSnippetsHtml += ' 		<br>';
									App.requestedCodeSnippetsHtml += ' 		<h5 class="card-title">'+ snippetData[1] +'</h5>';
									App.requestedCodeSnippetsHtml += ' 		<br>';
									App.requestedCodeSnippetsHtml += ' 		<span class="h2">'+ price +' ETH</span>';
									App.requestedCodeSnippetsHtml += ' 		<br>';
									App.requestedCodeSnippetsHtml += ' 	</div>';
									App.requestedCodeSnippetsHtml += ' 	</div>';
									App.requestedCodeSnippetsHtml += ' 	<div class="card-body text-center">';
									App.requestedCodeSnippetsHtml += ' 	<button class="btn btn-outline-primary btn-lg" style="border-radius:30px" onclick="App.ApproveRequestedCodeSnippet(' + tokenId +');">Approve Request</button>';
									App.requestedCodeSnippetsHtml += ' 	</div>';
									App.requestedCodeSnippetsHtml += ' </div>';
									App.requestedCodeSnippetsHtml += ' </div>';
									// console.log(App.requestedCodeSnippetsHtml);
									$("#listRequestedCodeSnippets").html(App.requestedCodeSnippetsHtml);
									i++;
									appendApprovedCodeSnippet();
								});
							}
						}
						appendApprovedCodeSnippet();
					})();
				}
				
				
			}
			else{
				console.log(error);
			}
		});
	},

	ApproveRequestedCodeSnippet: function(tokenId){
		let approveRequestedSnippetoption = {from : App.account};

		App.contracts.Payment.methods.approveCodeSnippetRequestAndTransfer(tokenId).send(approveRequestedSnippetoption).on('receipt', (receipt) =>{
			if(receipt.status){
				alert("Request approval success");
				showStartPage();
			}
		});
		showStartPage();
	},

	handleApproveSelectedCodeSnippet : function(){
		let tokenId = $("#hiddenApprovaltokenId").val();
		let approveSnippetoption = {from : App.account};
		// console.log(approveSnippetoption);
		App.contracts.Payment.methods.approveCodeSnippet(tokenId).send(approveSnippetoption).on('receipt', (receipt) =>{
			if(receipt.status){
				alert("Code approval success");
				showStartPage();
			}
		});
	},

	requestCodeSnippet: async function(tokenId, price){
		var weiamount=App.web3.utils.toWei(price + '','ether');
		var amount=App.web3.utils.toHex(weiamount);
		let requestCodeSnippetoption = {from: App.account, value: amount};
		App.contracts.Payment.methods.requestCodeSnippet(tokenId).send(requestCodeSnippetoption).on('receipt', (receipt) => {
			if(receipt.status){
				alert("Request code snippet success");
				showStartPage();
			}
		});
	},

	validateCreateCodeSnippet: function()
	{
		var codeSnippetName = $("#codeSnippetName").val();
		var codeSnippetPrice = $("#codeSnippetPrice").val();
		var codeSnippetLanguage = $("#codeSnippetLanguage").val();
		var codeSnippet = btoa(($("#codeSnippet").val()));

		if(codeSnippetName == "")
		{
			return 1;
		}
		else if(codeSnippetPrice == "")
		{
			return 2;
		}
		else if(codeSnippetLanguage == -1)
		{
			return 3;
		}
		else if(codeSnippet == "")
		{
			return 4;
		}
		else{
			return 0;
		}
	},

	handleCreateCodeSnippet : function(){
		var isValid = App.validateCreateCodeSnippet();
		if(isValid == 0)
		{	
			// console.log("Your Account: " + App.account);
			var codeSnippetName = $("#codeSnippetName").val();
			var codeSnippetPrice = $("#codeSnippetPrice").val();
			var codeSnippetLanguage = $("#codeSnippetLanguage").val();
			var codeSnippet = btoa(($("#codeSnippet").val()));

			var weiamount=App.web3.utils.toWei(codeSnippetPrice,'ether')
			var amount=App.web3.utils.toHex(weiamount)

			var option={from:App.account};
			App.contracts.Payment.methods.createCodeSnippet(codeSnippetName, codeSnippetLanguage, codeSnippet, amount).send(option).on('receipt', (receipt) =>{
				if(receipt.status){
					alert("Code creation success");
					showStartPage();
				}
			});
			showStartPage();
		}
		else{
			switch(isValid){
				case 1: 
					alert("Invalid Name");
					break;
				case 2: 
					alert("Invalid Price. Please enter a valid price");
					break;
				case 3: 
					alert("Please select the language to continue");
					break;
				case 4: 
					alert("Invalid Code Snippet");
					break;

			}
		}
		
	},

	viewAndApproveCodeSnippet: function(tokenId, isOnlyView){
		// console.log(App.account);
		getSnippetoption = {from: App.account};
		
		App.contracts.Payment.methods.getCodeSnippet(tokenId).call(getSnippetoption, function(getSnippeterror, snippetData){
			// console.log(snippetData);
			// console.log(tokenId);
			$("#approve-single-code-snippet").show();
			$("#approve-code-snippets").hide();
			$("#view-my-code-snippets").hide();

			$("#approvalCodeSnippetName").prop("disabled", true);
			$("#approvalCodeSnippetPrice").prop("disabled", true);
			$("#approvalCodeSnippetLanguage").prop("disabled", true);
			$("#approvalCodeSnippet").prop("disabled", true);

			$("#approvalCodeSnippetName").val(snippetData[0]);
			var price = App.web3.utils.fromWei(snippetData[3],"ether");
			$("#approvalCodeSnippetPrice").val(price);

			let id = snippetData[1]; 
			$('#approvalCodeSnippetLanguage option').filter(function(){
				return this.id === id
			}).prop('selected', true);

			$("#approvalCodeSnippet").val(atob(snippetData[2]));
			if(isOnlyView == 1){
				$("#btn-approve-code-snippet").hide();
				$("#viewCodeSnippetText").html("Code Snippet");
				$("#btn-cancel-view-code-snippet").show();
				$("#btn-cancel-code-snippet").hide();
			}
			else{
				$("#btn-approve-code-snippet").show();
				$("#hiddenApprovaltokenId").val(tokenId);
				$("#viewCodeSnippetText").html("Approve Code Snippet");
				$("#btn-cancel-view-code-snippet").hide();
				$("#btn-cancel-code-snippet").show();
				
			}

		});	
	},

	handleGetApprovedCodeSnippets: function(){
		exploreCodeSnippets();
		App.web3.eth.getCoinbase(function(err, account) {
			if (err === null) {
				var option={from:account};
				//var html = "";
				App.approvedCodeSnippetsHtml = "";
				let tokenId = 0;
				let cnt = 0;
				App.contracts.Payment.methods.getApprovedTokens().call(option, function(error, data){
					if(error == null){
						if(data.length == 0)
						{
							App.approvedCodeSnippetsHtml += "<p> No code snippets avaialable right now!!! </p>";
							$("#listApprovedCodeSnippets").html(App.approvedCodeSnippetsHtml);
						}
						(function() {
							var i = 0;
							function appendApprovedCodeSnippet() {
								if (i < data.length) {
									tokenId = parseInt(data[i]);
									// console.log(tokenId);
									var getSnippetoption = {from: account};
									App.contracts.Payment.methods.getCodeSnippet(tokenId).call(getSnippetoption, function(getSnippeterror, snippetData){
										if(account.toLowerCase() != snippetData[5].toLowerCase())
										{
											cnt++;
											// console.log(snippetData);
											// console.log(tokenId);

											var price = App.web3.utils.fromWei(snippetData[3],"ether");
											let owner = snippetData[5];
											// console.log("Code snippet price: " + price);
											App.approvedCodeSnippetsHtml += '<div class="col-lg-4 col-md-12 mb-2">';
											App.approvedCodeSnippetsHtml += ' <div class="card h-100 shadow-lg">';
											App.approvedCodeSnippetsHtml += ' 	<div class="card-body">';
											App.approvedCodeSnippetsHtml += ' 	<div class="text-center p-3">';
											App.approvedCodeSnippetsHtml += ' 		<h5 class="card-title">'+ snippetData[0] +'</h5>';
											App.approvedCodeSnippetsHtml += ' 		<br>';
											App.approvedCodeSnippetsHtml += ' 		<h5 class="card-title">'+ snippetData[1] +'</h5>';
											App.approvedCodeSnippetsHtml += ' 		<br>';
											App.approvedCodeSnippetsHtml += ' 		<span class="h2">'+ price +' ETH</span>';
											App.approvedCodeSnippetsHtml += ' 		<br>';
											App.approvedCodeSnippetsHtml += ' 	</div>';
											App.approvedCodeSnippetsHtml += ' 	</div>';
											App.approvedCodeSnippetsHtml += ' 	<div class="card-body text-center">';
											App.approvedCodeSnippetsHtml += ' 	<button class="btn btn-outline-primary btn-lg" style="border-radius:30px" onclick="App.requestCodeSnippet(' + tokenId + ',' + price + ');">Request</button>';
											App.approvedCodeSnippetsHtml += ' 	</div>';
											App.approvedCodeSnippetsHtml += ' </div>';
											App.approvedCodeSnippetsHtml += ' </div>';
											// console.log(App.approvedCodeSnippetsHtml);
											$("#listApprovedCodeSnippets").html(App.approvedCodeSnippetsHtml);
										}
										i++;
										appendApprovedCodeSnippet();
									});
								}
							}
							appendApprovedCodeSnippet();
						})();
						
					}
					else{
						console.log(error);
					}
				});
			}
		});
	},

	handleApproveCodeSnippets: function(){
		approveCodeSnippets();
		App.web3.eth.getCoinbase(function(err, account) {
			if (err === null) {
				
				var option={from:account};
				//var html = "";
				App.codeSnippetsForApprovalHtml = "";
				let tokenId = 0;
				App.contracts.Payment.methods.getPendingApprovalTokens().call(option, function(error, data){
					// console.log(data);
					if(error == null){
						if(data.length == 0)
						{
							App.codeSnippetsForApprovalHtml += "<p> No code snippets avaialable right now!!! </p>";
							$("#codeSnippetsForApproval").html(App.codeSnippetsForApprovalHtml);
						}
						(function() {
							var i = 0;
							function appendCodeSnippet() {
								if (i < data.length) {
									tokenId = parseInt(data[i]);
									// console.log(tokenId);
									var getSnippetoption = {from: account};
									App.contracts.Payment.methods.getCodeSnippet(tokenId).call(getSnippetoption, function(getSnippeterror, snippetData){
										// console.log(snippetData);
										// console.log(tokenId);

										var price = App.web3.utils.fromWei(snippetData[3],"ether");
										// console.log("Code snippet price: " + price);
										App.codeSnippetsForApprovalHtml += '<div class="col-lg-4 col-md-12 mb-2">';
										App.codeSnippetsForApprovalHtml += ' <div class="card h-100 shadow-lg">';
										App.codeSnippetsForApprovalHtml += ' 	<div class="card-body">';
										App.codeSnippetsForApprovalHtml += ' 	<div class="text-center p-3">';
										App.codeSnippetsForApprovalHtml += ' 		<h5 class="card-title">'+ snippetData[0] +'</h5>';
										App.codeSnippetsForApprovalHtml += ' 		<br><br>';
										App.codeSnippetsForApprovalHtml += ' 		<h5 class="card-title">'+ snippetData[1] +'</h5>';
										App.codeSnippetsForApprovalHtml += ' 		<br><br>';
										App.codeSnippetsForApprovalHtml += ' 		<span class="h2">'+ price +' ETH</span>';
										App.codeSnippetsForApprovalHtml += ' 		<br><br>';
										App.codeSnippetsForApprovalHtml += ' 	</div>';
										App.codeSnippetsForApprovalHtml += ' 	</div>';
										App.codeSnippetsForApprovalHtml += ' 	<div class="card-body text-center">';
										App.codeSnippetsForApprovalHtml += ' 	<button class="btn btn-outline-primary btn-lg" style="border-radius:30px" onclick="App.viewAndApproveCodeSnippet(' + tokenId + ', 0);">View & Approve</button>';
										App.codeSnippetsForApprovalHtml += ' 	</div>';
										App.codeSnippetsForApprovalHtml += ' </div>';
										App.codeSnippetsForApprovalHtml += ' </div>';
										// console.log(App.codeSnippetsForApprovalHtml);
										$("#codeSnippetsForApproval").html(App.codeSnippetsForApprovalHtml);
										i++;
										appendCodeSnippet();
									});
								}
							}
							appendCodeSnippet();
						})();
						
					}
					else{
						console.log(error);
					}
				});
			}
		});
	},

	populateAddress : async function(){  
        // getting sender and their balances      
		var acc = "";
		App.web3.eth.getCoinbase(function(err, account) {
			if (err === null) {
				acc = account;
				// console.log("Your Account: " + account);
			}
		}); 
		return acc;  
    }
    
}

function showStartPage(){
	$("#startPage").show();
	$("#explore-code-snippets").hide();
	$("#approve-requested-code-snippets").hide();
	$("#create-code-snippet").hide();
	$("#approve-code-snippets").hide();
	$("#approve-single-code-snippet").hide();
	$("#view-my-code-snippets").hide();
}

function resetCodeSnippetFields(){
	$("#codeSnippetName").val("");
	$("#codeSnippetPrice").val("");
	$("#codeSnippetLanguage").val(-1);
	$("#codeSnippet").val("");
}

function showCreateCodeSnippet(){
	resetCodeSnippetFields();
	$("#explore-code-snippets").hide();
	$("#create-code-snippet").show();
	$("#approve-code-snippets").hide();
	$("#approve-single-code-snippet").hide();
	$("#approve-requested-code-snippets").hide();
	$("#startPage").hide();
	$("#view-my-code-snippets").hide();
}

function exploreCodeSnippets(){
	$("#explore-code-snippets").show();
	$("#create-code-snippet").hide();
	$("#approve-code-snippets").hide();
	$("#approve-single-code-snippet").hide();
	$("#approve-requested-code-snippets").hide();
	$("#startPage").hide();
	$("#view-my-code-snippets").hide();
}

function approveCodeSnippets(){
	$("#explore-code-snippets").hide();
	$("#approve-code-snippets").show();
	$("#create-code-snippet").hide();
	$("#approve-single-code-snippet").hide();
	$("#approve-requested-code-snippets").hide();
	$("#startPage").hide();
	$("#view-my-code-snippets").hide();
}

function approveRequestedCodeSnippets(){
	$("#explore-code-snippets").hide();
	$("#approve-code-snippets").hide();
	$("#create-code-snippet").hide();
	$("#approve-single-code-snippet").hide();
	$("#approve-requested-code-snippets").show();
	$("#startPage").hide();
	$("#view-my-code-snippets").hide();
}

function myCodeSnippets(){
	$("#explore-code-snippets").hide();
	$("#approve-code-snippets").hide();
	$("#create-code-snippet").hide();
	$("#approve-single-code-snippet").hide();
	$("#approve-requested-code-snippets").hide();
	$("#startPage").hide();
	$("#view-my-code-snippets").show();
}


$(function() {
      App.init();
	  $('[data-toggle="tooltip"]').tooltip();
    //   toastr.options = {
    //     "positionClass": "right newtoast",
    //     "preventDuplicates": true,
    //     "closeButton": true
    //   };
  });