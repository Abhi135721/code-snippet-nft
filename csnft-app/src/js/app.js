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
        return App.initContract();
    },

    initContract: function(){
        $.getJSON('CodeSnippetNFT.json', function(data) {      
            App.contracts.Payment = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});
			//console.log(App.contracts.Payment);
            //populating contract's balance
            App.web3.eth.getBalance(App.contracts.Payment._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");})   
          }) 
		  App.checkOwner();
          return App.bindEvents();
    },
	checkOwner: function(){
		App.web3.eth.getCoinbase(function(err, account) {
			App.custodian = App.contracts.Payment.methods.getCustodianAddress();
			console.log(App.custodian);
			console.log(account);
		});
	},

	bindEvents: function(){
		$(document).on('click', '#btn-create-code-snippet', function(){
			console.log(App.contracts.Payment);
			//App.populateAddress();
			App.web3.eth.getCoinbase(function(err, account) {
				if (err === null) {
					
					console.log("Your Account: " + account);
					var codeSnippetName = $("#codeSnippetName").val();
					var codeSnippetPrice = $("#codeSnippetPrice").val();
					var codeSnippetLanguage = $("#codeSnippetLanguage").val();
					var codeSnippet = btoa(($("#codeSnippet").val()));

					var weiamount=App.web3.utils.toWei(codeSnippetPrice,'ether')
					var amount=App.web3.utils.toHex(weiamount)

					console.log(codeSnippetName);
					console.log(amount);
					console.log(codeSnippetLanguage);
					console.log(codeSnippet);
					var option={from:account}
					App.contracts.Payment.methods.createCodeSnippet(codeSnippetName, codeSnippetLanguage, codeSnippet, amount).send(option);

				}
			});

			
			//App.handleSignedMessage(jQuery('#receiver').val(),jQuery('#amount').val());
		 });
	},

	populateAddress : async function(){  
        // getting sender and their balances      
		var acc = "";
		App.web3.eth.getCoinbase(function(err, account) {
			if (err === null) {
				acc = account;
				console.log("Your Account: " + account);
			}
		}); 
		return acc;  
    }
    
}

function showStartPage(){
	$("#explore-code-snippets").hide();
	$("#create-code-snippet").hide();
}

function showCreateCodeSnippet(){
	$("#explore-code-snippets").hide();
	$("#create-code-snippet").show();
}

function exploreCodeSnippets(){
	$("#explore-code-snippets").show();
	$("#create-code-snippet").hide();
}


$(function() {
    // $(window).load(function() {
      App.init();
    //   toastr.options = {
    //     "positionClass": "right newtoast",
    //     "preventDuplicates": true,
    //     "closeButton": true
    //   };
    // });
  });