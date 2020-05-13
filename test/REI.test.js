const REI = artifacts.require('./REI.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('REI', (accounts) => {
    let contract

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            contract = await REI.deployed()
            const address = contract.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await contract.name()
            assert.equal(name,'REI Token')
        })

        it('has a symbol', async () => {
            const symbol = await contract.symbol()
            assert.equal(symbol,'REIADDRESS')
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

            let location
            let result = []
            for(var i = 1; i <= totalSupply; i++) {
                location = await contract.locations(i-1)
                result.push(location)
            }

            let expected = ['123 Main St., Austin, Tx, 78705','121 Main St., Austin, Tx, 78705','122 Main St., Austin, Tx, 78705','124 Main St., Austin, Tx, 78705']
            assert.equal(result.join(','),expected.join(','),'4 unique tokens minted')
        })
    })

    describe('transfering', async () => {
        it('transfers a token', async () => {
            //console.log("Transferring.......")
            //console.log(accounts)
            let toAddress = accounts[1]
            //console.log(toAddress)
            let tokenId = "37469746472611036771321737221860966457933893121606967751051525161688519460473"
            //console.log(tokenId)
            await contract.transfer(toAddress,tokenId)
            let newOwner = await contract.ownerOf(tokenId)
            console.log(newOwner)
            assert.equal(newOwner,toAddress,"transfer complete")
        })
    })

    describe('burning', async () => {
        it('burns a token', async () => {
            const totalSupply = await contract.totalSupply()

            let tokenId = "37469746472611036771321737221860966457933893121606967751051525161688519460473"
            let oldOwner = await contract.ownerOf(tokenId)
            console.log("OLD OWNER")
            console.log(oldOwner)
            
            /*let result = []
            let tmp1
            for(var i = 1; i <= totalSupply; i++) {
                tmp1 = await contract._idExists(i-1)
                result.push(tmp1)
            }
            console.log(result)*/

            
            contract.burn(tokenId)

            let idExist = await contract._idExists(tokenId)
            
            //console.log(idExist)
            assert.equal(idExist,false)
        })
        
    })
})