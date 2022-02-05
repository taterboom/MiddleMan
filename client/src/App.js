import React, { useState, useEffect } from "react"
import MiddleManContract from "./contracts/MiddleMan.json"
import getWeb3 from "./getWeb3"

import "./App.css"

const Form = ({ onSumbit }) => {
  const [receiver, setReceiver] = useState("")
  const [remark, setRemark] = useState("")
  const [amount, setAmount] = useState(0)

  return (
    <>
      <h3>create a order</h3>
      <label>
        receiver address:{" "}
        <input value={receiver} onChange={(e) => setReceiver(e.target.value)}></input>
      </label>
      <br />
      <label>
        amount:
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}></input>
        Wei
      </label>
      <br />
      <label>
        remark:
        <input value={remark} onChange={(e) => setRemark(e.target.value)}></input>
      </label>
      <br />
      <button onClick={() => onSumbit({ receiver, amount, remark })}>submit</button>
    </>
  )
}

const App = () => {
  const [web3, setWeb3] = useState()
  const [accounts, setAccounts] = useState([])
  const [contract, setContract] = useState()
  const [myOrders, setMyOrders] = useState([])

  const runExample = () => {
    //
  }

  const createOrder = async ({ receiver, amount, remark }) => {
    console.log(receiver, amount, remark)
    const receipt = await contract.methods.createOrder(receiver, remark).send({
      from: accounts[0],
      value: amount,
    })
    console.log(receipt)
  }

  const executeOrder = async (id) => {
    const receipt = await contract.methods.executeOrder(id).send({
      from: accounts[0],
    })
    console.log(receipt)
  }

  const getMyOrders = async () => {
    const res = await contract.methods.getSenderOrderList(accounts[0]).call()
    setMyOrders(res)
  }

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts()
        const instance = new web3.eth.Contract(
          MiddleManContract.abi,
          "0xf7dd59BB39fF519538e1A3A1D5b1b52496C8AAa0"
        )

        setWeb3(web3)
        setAccounts(accounts)
        setContract(instance)
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(`Failed to load web3, accounts, or contract. Check console for details.`)
        console.error(error)
      }
    }
    init()
  })

  useEffect(() => {
    if (contract) {
      getMyOrders()
    }
  }, [contract])

  return (
    <div>
      <h2>current address: {accounts[0]}</h2>
      <hr />
      <Form onSumbit={(data) => createOrder(data)}></Form>
      <hr />
      <h3>my orders</h3>
      <button onClick={() => getMyOrders()}>sync</button>
      <ul>
        {myOrders.map((o) => (
          <li key={o.id}>
            <i>id: {o.id}</i>|<i>remark: {o.remark}</i>|<i>receiver: {o.receiver}</i>|
            <i>amount: {o.amount}</i>|<i>finished: {o.finished + ""}</i>|
            <i>created_at: {o.created_at}</i>|<i>finished_at: {o.finished_at}</i>|
            <button disabled={o.finished} onClick={() => executeOrder(o.id)}>
              confirm
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
