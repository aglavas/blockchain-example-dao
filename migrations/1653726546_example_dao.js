const ExampleDao = artifacts.require("ExampleDao");

module.exports = function(deployer) {
  deployer.deploy(ExampleDao, 555, 50, 555);
};