const DNFT = artifacts.require("DNFT");

module.exports = function(deployer) {
  deployer.deploy(DNFT);
};