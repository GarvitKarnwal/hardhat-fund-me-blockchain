// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughFund();
error FundMe__WithdrawFailed();
contract FundMe {
    using PriceConverter for uint256;
    bool private s_enoughFundSent = true  ;
    AggregatorV3Interface private s_priceFeed;
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    uint256 private FundedEthValueInUSD;
    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private /* immutable */ i_owner;
     uint256 public constant MINIMUM_USD = 0.1 * 10 ** 17; // 0.1 dollars
    
    //Function Order:
    //* constructor
    //* receive 
    //* fallback
    //* external
    //* public
    //* internal
    //* private
    //* pure/view 
    
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }    
    
    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    function checkEnoughFundSent() public payable {        
        // FundedEthValueInUSD = msg.value.getConversionRate(s_priceFeed);
        if(msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD){
            s_enoughFundSent = false;
        }
        else {
            s_enoughFundSent = true;
        }

        // return vv >= MINIMUM_USD;
    }

    function fund() public payable {
        // require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        
        if(msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD){
            revert FundMe__NotEnoughFund();
        }
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    // function getVersion() public view returns (uint256){
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    //     return priceFeed.version();
    // }
    
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    function withdraw() payable onlyOwner external {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
       
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        // require(callSuccess, "Call failed");
        if(!callSuccess){
            revert FundMe__WithdrawFailed();
        }
    }

    function cheaperWithdraw() payable onlyOwner external {
        address[] memory funders = s_funders; //s_funders is state variable and stored in storage 
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
       
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        // require(callSuccess, "Call failed");
        if(!callSuccess){
            revert FundMe__WithdrawFailed();
        }
    }

function getOwner() public view returns (address) {
        return i_owner;
    }
    
    function getFunder(uint256 index)public view returns (address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view  returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed()public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }

    function getEnoughFundSent() public view returns(bool){
        return s_enoughFundSent;
    }

    function getFundedEthValueInUSD()public view returns(uint256){
        return FundedEthValueInUSD;
    }
}