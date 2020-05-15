import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
// import REI from '../abis/REI.json' 
// import DNFT from '../abis/DNFT.json'
import REI from '../abis/DNFT.json'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log("WINDOW = ETHERIUM");
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      console.log("WINDOW = WEB3")
    } else {
      window.alert('Non-Ethereum browser detected. Consider trying MetaMask!')
    }

  }

  async loadBlockchainData() {
    console.log('loading blockchain data')
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log('loaded account')

    const networkId = await web3.eth.net.getId()
    const networkREIData = REI.networks[networkId]

    console.log('loaded Network data')
    if (networkREIData){
      const abi = REI.abi
      const address = networkREIData.address
      const REIContract = new web3.eth.Contract(abi, address)
      console.log('loaded contract')
      this.setState({REIContract})
      console.log(REIContract)
      const totalREISupply = await REIContract.methods.totalSupply().call()
      this.setState({totalREISupply})
      console.log('total supply', totalREISupply)

      for (var i = 0; i<totalREISupply; i++){
        console.log('a')
        //ERROR. HOW DO I CALL ? if i do .locations(i) it breaks. if I do .allLocations().call()[i]
        const REILocation = await REIContract.methods.locations(i).call()
        //const REILocation = 15
        console.log('b', REILocation)
        const REIId = await REIContract.methods.tokenIds(i).call()
        //const REIId = 12
        console.log('c')
        const REIObject = {id:REIId, location:REILocation}
        console.log('rei',REIObject)
        this.setState({
          REIs: [...this.state.REIs, REIObject]
        })
        
      }
      console.log(this.state.REIs)
    } else{
      window.alert('Smart contract not deployed to this network')
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      REIContract: null,
      account: '',
      totalREISupply: 0,
      REIs: []
    }
  }

  mint = (location) => {
    this.state.REIContract.methods.mint(location).send( { from: this.state.account }).once('receipt', (receipt) => {
      const id = receipt.events.Transfer.returnValues.tokenId
      const REIObject = {location: location, id: id}
      this.setState({REIs: [...this.state.REIs, REIObject]})
      console.log('receipt',receipt)
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Real Estate Investment Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
    <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const location = this.location.value
                  this.mint(location)
                }}>
                  <input type="text" className="form-control mb-1" placeholder="e.g. 123 Main St 78705" ref={(input) =>{
                    this.location = input
                  }}></input>
                  <input type="submit" className="btn btn-block btn-primary" value="MINT"></input>
                </form>
              </div>
            </main>
          </div>
          <hr></hr>
          <div className="row text-center">
            {this.state.REIs.map((REIObj,key) => {
              return (
              <div key={key} className="col-md-3 mb-3">
                <div><img width="100px" height="100px" src="building.jpg"></img></div>
                <div>{REIObj.location}</div>
                <div>{REIObj.id}</div>
              </div>)
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
