Instructions


1. Log in to the VM using RDP file 
    Username: martinmartin
    Password: martinmartin2020!

2. Run Ganache (using Windows Start menu) and select the network named ‘final-DNFT’ (it should open a list of 10 accounts and their balances)

3. Open Visual Studio Code (VSC) and load project code (should open directly to the project folder, but if not, select Open Folder and open to file path: C:/users/martinmartin/Documents/Etherium/REI)

4. Run following commands in VSC terminal to compile, migrate, and test the smart contract: (NOTE: The first time you open VSC, the terminal may appear blank, just click into the terminal box at the bottom and start typing, it will appear)
    >‘truffle compile’
    >‘truffle migrate --reset’
    >‘truffle test’
        (NOTE: you can view what the test is doing by looking at the ‘REI.test.js’ ’file located in the ‘test’ folder)
    >‘npm start’ (to start the server for client app)

5. Open Google Chrome and go to http://localhost:3000 

6. Authenticate Metamask with password martinmartin2020!

7. Connect Metamask to local Ethereum network running on Ganache (should be done automatically)
    To add a new account, choose import account by private key and select any private key from Ganache accounts interface

8. Choose an account from available accounts listed in Metamask then refresh page http://localhost:3000

9. Enter a new address in the text box and click Mint to create a new ERC721 (divisible) Non-Fungible Token  (Refresh the page to see the token displayed in the UI)
    NOTE: The same address cannot be entered twice. If you try, MetaMask will show you an error

10. Choose any token with a Green border and transfer any amount to any address in the network (can be found in Ganache), then refresh after the confirmation notification

11. Burn a token for which you have 100 units (cannot burn a token for which you have transferred any number of shares, you may want to mint a new token and then try to burn it to see this functionality)
