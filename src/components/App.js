import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import REI from '../abis/REI.json'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. Consider trying MetaMask!')
    }

  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkREIData = REI.networks[networkId]
    if (networkREIData){
      const abi = REI.abi
      const address = networkREIData.address
      const REIContract = new web3.eth.Contract(abi, address)
      this.setState({REIContract})
      console.log(REIContract)
      const totalREISupply = await REIContract.methods.totalSupply().call()
      this.setState({totalREISupply})

      for (var i = 0; i<totalREISupply; i++){
        const REILocation = await REIContract.methods.locations(i).call()
        this.setState({
          REILocations: [...this.state.REILocations, REILocation]
        })
      }
      console.log(this.state.REILocations)
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
      REILocations: []
    }
  }

  mint = (location) => {
    this.state.REIContract.methods.mint(location).send( { from: this.state.account }).once('receipt', (receipt) => {
      this.setState({
        REILocations : [...this.state.REILocations, location]
      })
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
            {this.state.REILocations.map((location,key) => {
              return (
              <div key={key} class="col-md-3 mb-3">
                <div><img width="100px" height="100px" src="https://lh3.googleusercontent.com/proxy/ebJ87xvDH837pP0d96ZdqeckPbTv_F7VJR7fTLu2GQsEjBemFcTOLwEegjBv-GUczGX0PjIxL90BGVY9K_Jn3H5PIz7NXRrI0glZg4v3e_nN8cPNWF9Q-ncs8zR54Pp6S5he4Lk1nku_8QgboUwXRlD9WIcNziQ4lNQbQa9j1Aax9HlomvH1E3-ld7o"></img></div>
                <div>{location}</div>
              </div>)
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
