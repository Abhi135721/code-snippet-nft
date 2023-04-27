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
            //populating contract's balance
            App.web3.eth.getBalance(App.contracts.Payment._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");})   
          }) 
               
          return App.bindEvents();
    },

    
}

function showStartPage(){

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
    $(window).load(function() {
      App.init();

      showStartPage();

    //   toastr.options = {
    //     "positionClass": "right newtoast",
    //     "preventDuplicates": true,
    //     "closeButton": true
    //   };
    });
  });