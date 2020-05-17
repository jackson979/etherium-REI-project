const DNFT = artifacts.require('./DNFT.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('DNFT', (accounts) => {
    let contract

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            contract = await DNFT.deployed()
            const address = contract.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        it('has a name', async () => {
            const name = await contract.name()
            assert.equal(name,'DNFT Token')
        })

        it('has a symbol', async () => {
            const symbol = await contract.symbol()
            assert.equal(symbol,'SYMBOL')
        })
    })

    describe('minting', async() => {
        it('creates a new token', async () => {
            
            const result = await contract.mint('123 Main St., Austin, Tx, 78705')
            const totalSupply = await contract.totalSupply()
            let TokenId = 37469746472611036771321737221860966457933893121606967751051525161688519460473
            //SUCCESS
            assert.equal(totalSupply,1)
            //console.log(result)
            const event = result.logs[0].args
            //console.log(event)
            //console.log(contract._locationMap)
            assert.equal(event.tokenId,TokenId,'id is correct')
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
            assert.equal(event.to, accounts[0],'to is correct')

            //FAILURE
            await contract.mint('123 Main St., Austin, Tx, 78705').should.be.rejected;
        })
    })

    describe('indexing', async () => {
        it('lists addresses', async () => {
            //Mint 3 MORE Tokens
            await contract.mint('121 Main St., Austin, Tx, 78705')
            await contract.mint('122 Main St., Austin, Tx, 78705')
            await contract.mint('124 Main St., Austin, Tx, 78705')
            const totalSupply = await contract.totalSupply()
            assert.equal(totalSupply,4,'4 tokens minted')

            let location
            let result = []
            for(var i = 1; i <= totalSupply; i++) {
                location = await contract.locations(i-1)
                result.push(location)
            }
            //console.log(await contract.locations(0))

            let expected = ['123 Main St., Austin, Tx, 78705','121 Main St., Austin, Tx, 78705','122 Main St., Austin, Tx, 78705','124 Main St., Austin, Tx, 78705']
            assert.equal(result.join(','),expected.join(','),'4 unique tokens minted')
        })
        it('lists ids', async () => {
            let id
            const totalSupply = await contract.totalSupply()
            //let result = []
            for(var i = 1; i <= totalSupply; i++) {
                id = await contract.tokenIds(i-1)
                //result.push(id)
                //console.log(id.toString())
            }

        })
    })

    describe('helper functions', async () => {
        it('returns all locations', async () => {
            let locs
            locs = await contract.allLocations()
            //console.log(locs[0])
        })
        it('returns all token IDs', async () => {
            let ids
            ids = await contract.allTokenIds()
            //console.log(ids[0])
        })
        it('returns majority owner', async () => {
            let majority
            majority = await contract.majorityOwner(accounts[0],"37469746472611036771321737221860966457933893121606967751051525161688519460473")
            //console.log(majority)
            assert.equal(majority,true)
        })
        it('gets shares of address', async () => {
            let shares
            shares = await contract.ownerSharesforToken(accounts[0],"37469746472611036771321737221860966457933893121606967751051525161688519460473")
            //console.log(shares)
            assert.equal(shares,100)
        })
    })

    describe('transfering', async () => {
        it('transfers a token', async () => {
            //console.log("Transferring.......")
            //console.log(accounts)
            let toAddress = accounts[1]
            let fromAddress = accounts[0]
            //console.log(toAddress)
            let tokenId = "37469746472611036771321737221860966457933893121606967751051525161688519460473"
            //console.log(tokenId)

            await contract.transfer(toAddress,tokenId,40)
            tmpOwner = await contract.ownerOf(tokenId)
            assert.equal(tmpOwner,fromAddress,"token has not changed ownership")

            await contract.transfer(toAddress,tokenId,20)
            let newOwner = await contract.ownerOf(tokenId)
            //console.log(newOwner)
            assert.equal(newOwner,toAddress,"token has new owner")
        })
        it('gets shares of address', async () => {
            let shares
            shares = await contract.ownerSharesforToken(accounts[0],"37469746472611036771321737221860966457933893121606967751051525161688519460473")
            //console.log(shares)
            assert.equal(shares,40)
        })
    })

    describe('burning', async () => {
        it('attempts to burn token w/o all units', async () => {
            let tokenId = "37469746472611036771321737221860966457933893121606967751051525161688519460473"
            await contract.burn(tokenId).should.be.rejected;
        })
        it('burns a token', async () => {
            //let toAddress = accounts[1]
            let tokenId = "90634424011424456223642745264536225242414218275456761356731043401208726823481"
            //await contract.transfer(toAddress,tokenId,40)
            await contract.burn(tokenId)
            await contract.ownerOf(tokenId).should.be.rejected;
        })
        it('gets shares of address', async () => {
            let shares
            shares = await contract.ownerSharesforToken(accounts[0],"90634424011424456223642745264536225242414218275456761356731043401208726823481")
            //console.log(shares)
            assert.equal(shares,0)
        })
    })
})



// const REI = artifacts.require('./REI.sol')
// const RFT = artifacts.require('./RFT.sol')

// require('chai')
//     .use(require('chai-as-promised'))
//     .should()

// contract('REI', (accounts) => {
//     let contract
//     let contract2

//     describe('deployment', async() => {
//         it('deploys successfully', async() => {
//             contract = await REI.deployed()
//             const address = contract.address
//             assert.notEqual(address, 0x0)
//             assert.notEqual(address, '')
//             assert.notEqual(address, null)
//             assert.notEqual(address, undefined)
//         })

//         it('has a name', async () => {
//             const name = await contract.name()
//             assert.equal(name,'REI Token')
//         })

//         it('has a symbol', async () => {
//             const symbol = await contract.symbol()
//             assert.equal(symbol,'REIADDRESS')
//         })
//     })

//     describe('minting', async() => {
//         it('creates a new token', async () => {
            
//             const result = await contract.mint('123 Main St., Austin, Tx, 78705')
//             const totalSupply = await contract.totalSupply()
//             let TokenId = 37469746472611036771321737221860966457933893121606967751051525161688519460473
//             //SUCCESS
//             assert.equal(totalSupply,1)
//             //console.log(result)
//             const event = result.logs[0].args
//             //console.log(event)
//             //console.log(contract._locationMap)
//             assert.equal(event.tokenId,TokenId,'id is correct')
//             assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
//             assert.equal(event.to, accounts[0],'to is correct')
            
//             contract2 = await RFT.deployed()
//             const rftSupply = await contract2.totalSupply()
//             console.log(rftSupply)
//             console.log(totalSupply)

//             //console.log(contract)
//             //console.log(contract2)
//             assert.equal(rftSupply,100)

//             //FAILURE
//             await contract.mint('123 Main St., Austin, Tx, 78705').should.be.rejected;
//         })
//     })

//     describe('indexing', async () => {
//         it('lists addresses', async () => {
//             //Mint 3 MORE Tokens
//             await contract.mint('121 Main St., Austin, Tx, 78705')
//             await contract.mint('122 Main St., Austin, Tx, 78705')
//             await contract.mint('124 Main St., Austin, Tx, 78705')
//             const totalSupply = await contract.totalSupply()

//             let location
//             let result = []
//             for(var i = 1; i <= totalSupply; i++) {
//                 location = await contract.locations(i-1)
//                 result.push(location)
//             }

//             let expected = ['123 Main St., Austin, Tx, 78705','121 Main St., Austin, Tx, 78705','122 Main St., Austin, Tx, 78705','124 Main St., Austin, Tx, 78705']
//             assert.equal(result.join(','),expected.join(','),'4 unique tokens minted')
//         })
//     })

//     describe('transfering', async () => {
//         it('transfers a token', async () => {
//             //console.log("Transferring.......")
//             //console.log(accounts)
//             let toAddress = accounts[1]
//             //console.log(toAddress)
//             let tokenId = "37469746472611036771321737221860966457933893121606967751051525161688519460473"
//             //console.log(tokenId)
//             await contract.transfer(toAddress,tokenId)
//             let newOwner = await contract.ownerOf(tokenId)
//             console.log(newOwner)
//             assert.equal(newOwner,toAddress,"transfer complete")
//         })
//     })

//     describe('burning', async () => {
//         it('burns a token', async () => {
//             const totalSupply = await contract.totalSupply()

//             let tokenId = "37469746472611036771321737221860966457933893121606967751051525161688519460473"
//             let oldOwner = await contract.ownerOf(tokenId)
//             console.log("OLD OWNER")
//             console.log(oldOwner)
            
//             /*let result = []
//             let tmp1
//             for(var i = 1; i <= totalSupply; i++) {
//                 tmp1 = await contract._idExists(i-1)
//                 result.push(tmp1)
//             }
//             console.log(result)*/

            
//             contract.burn(tokenId)

//             let idExist = await contract._idExists(tokenId)
            
//             //console.log(idExist)
//             assert.equal(idExist,false)
//         })
        
//     })
// })