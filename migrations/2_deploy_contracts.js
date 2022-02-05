var MiddleMan = artifacts.require("./MiddleMan.sol")

module.exports = async function (deployer, _, accounts) {
  await deployer.deploy(MiddleMan)
  await web3.eth.sendTransaction({
    from: accounts[0],
    to: "0xf45F09F28Ce48Ffe20Aa6D79B0F937b91D39eD22",
    value: web3.utils.toWei("1"),
  })
}
