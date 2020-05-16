import React, { Component } from "react";
import Web3 from "web3";
import logo from "../logo.png";
import "./App.css";
// import REI from '../abis/REI.json'
// import DNFT from '../abis/DNFT.json'
import REI from "../abis/DNFT.json";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      // console.log("WINDOW = ETHERIUM");
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      // console.log("WINDOW = WEB3");
    } else {
      window.alert("Non-Ethereum browser detected. Consider trying MetaMask!");
    }
  }

  async loadBlockchainData() {
    // console.log("loading blockchain data");
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // console.log("loaded account");

    const networkId = await web3.eth.net.getId();
    const networkREIData = REI.networks[networkId];

    // console.log("loaded Network data");
    if (networkREIData) {
      const abi = REI.abi;
      const address = networkREIData.address;

      const REIContract = new web3.eth.Contract(abi, address);
      this.setState({ REIContract });

      const totalREISupply = await REIContract.methods.totalSupply().call();
      this.setState({ totalREISupply });

      const ownerShares = await REIContract.methods.allOwnerShares(this.state.account).call();
      const tokenShares = {}
      for(var i = 0; i< ownerShares.tokens.length; i++){
        tokenShares[ownerShares.tokens[i]] = ownerShares.shares[i]
      }

      for (var i = 0; i < totalREISupply; i++) {
        const REILocation = await REIContract.methods.locations(i).call();
        const REIId = await REIContract.methods.tokenIds(i).call();

        // console.log("shares")
        var shares = tokenShares[REIId]
        shares = shares? shares: 0
        // console.log(shares)


        const REIObject = { id: REIId, location: REILocation, shares:shares };

        this.setState({
          REIs: [...this.state.REIs, REIObject],
        });
      }
      const sortFunction = (a,b) => {
        if (a.shares < b.shares){
          return -1
        } else if (b.shares < a.shares){
          return 1
        }
        return 0
      }
      const sortedREIs = this.state.REIs.sort((a,b) => (parseInt(a.shares)>parseInt(b.shares))?-1:1)
      
      this.setState({REIs: sortedREIs})
      // console.log("reis", this.state.REIs);
    } else {
      window.alert("Smart contract not deployed to this network");
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      REIContract: null,
      account: "",
      totalREISupply: 0,
      REIs: [],
    };
  }

  mint = (location) => {
    this.state.REIContract.methods
      .mint(location)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        const id = receipt.events.Transfer.returnValues.tokenId;
        const REIObject = { location: location, id: id };
        this.setState({ REIs: [...this.state.REIs, REIObject] });
        // console.log("mint receipt", receipt);
      });
  };

  burn = (tokenId) => {
    // console.log("burning");
    // console.log(tokenId);
    this.state.REIContract.methods
      .burn(tokenId)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        // const id = receipt.events.Transfer.returnValues.tokenId
        // const REIObject = {location: location, id: id}
        // this.setState({REIs: [...this.state.REIs, REIObject]})
        // console.log("burn receipt", receipt);
        // console.log("burned");
      });
  };
  transfer = (tokenId, toAddress, amount) => {
    // console.log("transferring");
    // console.log(tokenId);
    this.state.REIContract.methods
      .transfer(toAddress, tokenId, amount)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        // const id = receipt.events.Transfer.returnValues.tokenId
        // const REIObject = {location: location, id: id}
        // this.setState({REIs: [...this.state.REIs, REIObject]})
        // console.log("transfer receipt", receipt);
        // console.log("transferred");
      });
  };

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
              <small className="text-white">
                <span id="account">{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const location = this.location.value;
                    this.mint(location);
                  }}
                >
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="e.g. 123 Main St 78705"
                    ref={(input) => {
                      this.location = input;
                    }}
                  ></input>
                  <input
                    type="submit"
                    className="btn btn-block btn-primary"
                    value="MINT"
                  ></input>
                </form>
              </div>
            </main>
          </div>
          <hr></hr>
          <div className="row text-center" style={{ width: "100%" }}>
            {this.state.REIs.map((REIObj, key) => {
              return (
                <div
                  key={key}
                  className="m-3 p-2 card flex mx-auto"
                  style={{
                    width: "80%",
                    "min-width": "200px",
                    "max-width": "800px",
                    borderColor: REIObj.shares? 'green':'black',
                    borderWidth:3
                  }}
                >
                  <div>
                    <img width="100px" height="100px" src="building.jpg"></img>
                  </div>

                  <div class="input-group mb-1 d-flex">
                    <div class="input-group-prepend">
                      <span class="input-group-text">Token Id</span>
                    </div>
                    <div className="flex-fill">
                      <input
                        type="text"
                        className="form-control word-wrap"
                        placeholder={REIObj.id}
                        readonly="true"
                      />
                    </div>
                  </div>

                  <div class="input-group mb-3 d-flex">
                    <div class="input-group-prepend">
                      <span class="input-group-text">Location</span>
                    </div>
                    <div className="flex-fill">
                      <input
                        type="text"
                        className="form-control word-wrap"
                        placeholder={REIObj.location}
                        readonly="true"
                      />
                    </div>
                  </div>
                  { REIObj.shares? (<div>
                  <form
                    onSubmit={(event) => {
                      const toAddress = this.toAddress.value;
                      const amount = this.amount.value;
                      const id = REIObj.id;
                      this.transfer(id, toAddress, amount);
                    }}
                    className="mb-3"
                  >
                    <h4>Transfer up to {REIObj.shares} units</h4>
                    <p>There are 100 units total per token (1 unit = 1%)</p>
                    <div className="input-group m-1">
                      <div className="input-group-prepend">
                        <div
                          className="input-group-text"
                          style={{ width: "110px" }}
                        >
                          To Address
                        </div>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 0xd06609547D66268BD9B11Eb28A0B5b23e973B3D7"
                        required
                        ref={(input) => {
                          this.toAddress = input;
                        }}
                      />
                    </div>
                    <div className="input-group m-1">
                      <div className="input-group-prepend">
                        <div
                          className="input-group-text"
                          style={{ width: "110px" }}
                        >
                          Units
                        </div>
                      </div>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 1"
                        required
                        ref={(input) => {
                          this.amount = input;
                        }}
                      />
                    </div>

                    <input
                      type="submit"
                      className="btn btn-block btn-success"
                      value="Transfer"
                    ></input>
                  </form>
                  {REIObj.shares - 100?null:
                  (<div>
                  <h4>Burn Token</h4>
                  <button
                    className="btn btn-danger w-100"
                    onClick={() => {
                      this.burn(REIObj.id);
                    }}
                  >
                    Burn me
                  </button>
                  </div>)}
                  </div>
                  ):null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
