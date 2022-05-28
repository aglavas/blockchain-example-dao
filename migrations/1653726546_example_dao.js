const ExampleDao = artifacts.require("ExampleDao");

module.exports = function(deployer) {
  deployer.deploy(ExampleDao, 2, 50, 2);
};