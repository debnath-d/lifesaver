// SPDX-License-Identifier: MIT

pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

contract FundraiserFactory {
    
    struct fundraiser {
        address fundraiserAddress;
        address beneficiary;
        uint minimum;
        string name;
        uint target;
        uint deadline;
    }
    
    fundraiser[] public deployedFundraisers;
    
    /* Sample input
    
    1000000000000000000, "Heart transplant", 20000000000000000000, 1605595020
    
    */

    function createFundraiser(
        uint _minimum,
        string memory _name,
        uint _target,
        uint _deadline
    ) public returns (address newFundraiserAddress) {
        newFundraiserAddress = address(new Fundraiser(
            _minimum,
            _name,
            msg.sender,
            _target,
            _deadline
        ));
        deployedFundraisers.push(fundraiser({
            fundraiserAddress: newFundraiserAddress,
            beneficiary: msg.sender,
            minimum: _minimum,
            name:_name,
            target: _target,
            deadline: _deadline
        }));
    }

    function getDeployedFundraisers() public view returns (fundraiser[] memory) {
        return deployedFundraisers;
    }
}

contract Fundraiser {
    string name;
    address payable public beneficiary;
    uint public minimumContribution;
    address payable[] public contributors;
    mapping(address => uint) public contributionAmount;
    uint public contributorsCount;
    uint public deadline;
    uint public target;
    bool public success;
    
    // Set to true at the end, disallows any change.
    // By default initialized to `false`.
    bool public ended;

    modifier restricted() {
        require(msg.sender == beneficiary);
        _;
    }

    constructor (uint _minimumContribution,
        string memory _name,
        address payable _beneficiary,
        uint _target,
        uint _deadline
    ) {
        minimumContribution = _minimumContribution;
        name = _name;
        beneficiary = _beneficiary;
        target = _target;
        deadline = _deadline;
    }

    function contribute() public payable {
        require(!ended, "Fundraiser has already been completed.");
        require(block.timestamp < deadline, "Fundraiser is past deadline.");
        require(msg.value >= minimumContribution, "You must contribute at least the minimum contribution amount");
        
        if(contributionAmount[msg.sender] == 0) {
            contributors.push(msg.sender);
            contributorsCount++;
        }

        contributionAmount[msg.sender] += msg.value;
    }
    
    function refund(address payable _contributor) private {
        uint amount = contributionAmount[_contributor];
        contributionAmount[_contributor] = 0;

        if (!_contributor.send(amount)) {
            // No need to call throw here, just reset the amount owing
            contributionAmount[_contributor] = amount;
        }
    }

    
    function endFundraiser() public returns(bool) {
        require(!ended, "Fundraiser has already been completed.");
        
        if(address(this).balance >= target && msg.sender == beneficiary){
            beneficiary.transfer(address(this).balance);
            ended = true;
            success = true;
            return true;
        } 
        
        if (block.timestamp >= deadline) {
            ended = true;
            if(address(this).balance >= target) {
                beneficiary.transfer(address(this).balance);
                success = true;
            } else {
                for (uint i = 0; i < contributors.length; i++) {
                    refund(contributors[i]);
                }
            }
            return true;
        }
        
        return false;
        
    }

    function getSummary() public view returns (
      string memory, uint, uint, uint, uint, uint, address, bool, bool
      ) {
        return (
          name,
          minimumContribution,
          address(this).balance,
          contributorsCount,
          target,
          deadline,
          beneficiary,
          ended,
          success
        );
    }
}
