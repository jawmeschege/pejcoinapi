// const authService = require('../../services/auth.service');
// const bcryptService = require('../../services/bcrypt.service');
const authService = require('../services/auth.service');
const Web3 = require('web3');

web3 = new Web3('https://bsc-dataseed.binance.org');

const db = require('../../models');
var Sequelize = require('sequelize');

     exports.createTransaction = async(req, res) => {
        const { body, header } = req;

        //first confirm the transaction has been recorded on the blockchain
        let validator =  await validateReward(String(body.txn_hash), body.address)
            
          if(validator){
            try {
                var user_id;
                var user = await db.User.findOne({where:{wallet_address:body.address}});
                // console.log(user.id);
                //record the deposit transaction
                if(!user){
                    let usr = await db.User.create({
                        wallet_address: body.address,
                        password: body.address,
                    });

                        // const token = authService().issue({ id: user.id });
                    user_id = usr.id;
                    
                }else{
                    user_id = user.id;
                }
                const transaction = await db.Transactions.create({
                    user_id: user_id,
                    amount: body.amount,
                    txn_hash:body.txn_hash,
                    type:1, //vault creation transaction
                    status:1  //statsu 1 means transaction has been execurtted
                });

                // record reward category for the transaction
                const create_vault = await db.VaultAccount.create({
                    userId: user_id,
                    txn_id: transaction.id,
                    wallet:body.address,
                    amount: body.amount,
                    lock_duration: parseFloat(body.lock_duration),
                    status:1
                });
                
                // console.log(create_vault.lock_duration == 3 ? 1 * create_vault.amount : create_vault.lock_duration == 6 ? 2 * create_vault.amount : 3 * create_vault.amount)
                //record first reward for the stake
                let create_reward = await db.Reward.create({
                        vaultId:create_vault.id,
                        amount: create_vault.lock_duration == 3 ? 1 * create_vault.amount : create_vault.lock_duration == 6 ? 2 * create_vault.amount : 3 * create_vault.amount,
                        status: 0   //status 0 means the reward is unclaimed and still virtual
                    });

                    await db.Transactions.create({
                    user_id: user_id,
                    amount: body.amount,
                    txn_hash:body.txn_hash,
                    type:2, //Reward creation transaction
                    status:1  //statsu 1 means transaction has been execurtted
                });

                //check if there exists a balance
                let checkBalance = await db.RewardBalance.findOne({where:{userId:user_id}});
                // console.log(checkBalance);
                if(checkBalance){
                    // console.log()
                    var newBal = checkBalance.amount + parseFloat(create_vault.lock_duration == 3 ? 1 * create_vault.amount : create_vault.lock_duration == 6 ? 2 * create_vault.amount : 3 * create_vault.amount);
                    await  db.RewardBalance.update({
                        amount: newBal
                    }, {where:{userId:user_id}});
                }else{
                    await db.RewardBalance.create({
                        userId: user_id,
                        amount: create_vault.lock_duration == 3 ? 1 * create_vault.amount : create_vault.lock_duration == 6 ? 2 * create_vault.amount : 3 * create_vault.amount,
                    });
                }

                //record the reward credit
                  await db.RewardCredit.create({
                        userId: user_id,
                        amount: create_vault.lock_duration == 3 ? 1 * create_vault.amount : create_vault.lock_duration == 6 ? 2 * create_vault.amount : 3 * create_vault.amount,
                    });

                return res.status(200).json({ message: 'Transaction record created successfully and registered on the blockchain' });


            } catch (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Internal server error' });
            }
        }else{
            return res.status(403).json({ msg: 'Wrong transaction' });
        }

    };
    
    exports.rewardTransaction = async(req, res) => {
        const { email, password } = req.body;

        if (email && password) {
            try {
                const user = await db.user
                    .findOne({
                        where: {
                            email,
                        },
                    });

                if (!user) {
                    return res.status(400).json({ msg: 'Bad Request: User not found' });
                }

                if (bcryptService().comparePassword(password, user.password)) {
                    const token = authService().issue({ id: user.id });

                    return res.status(200).json({ token, user });
                }

                return res.status(401).json({ msg: 'Unauthorized' });
            } catch (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Internal server error' });
            }
        }

        return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
    };

    const validateReward = async (txn_hash, address) => {
        let if_exists = await web3.eth.getTransactionReceipt(String(txn_hash));

        if(if_exists &&  if_exists.from.toLowerCase() == address.toLowerCase()){
           return true;

        }else{
            return false;
        }
        
    };



    exports.fetchTransactions = async(req, res) => {
        try {
            
            let wallet = req.query.wallet;
            if(wallet !== ''){
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            // console.log(user);
            if(user){
                const transactions = await db.Transactions.findAll({where:{user_id:user.id}});
                // console.log(transactions)
                return res.status(200).json({ transactions });
    
            }else{
                let transactions = [];
                return res.status(200).json({ transactions });

            }
            }else{
                let transactions = [];
                return res.status(200).json({ transactions });

            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    exports.fetchVaults = async(req, res) => {
        try {
            let wallet = req.query.wallet;
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            // console.log(user);

            const vaults = await db.VaultAccount.findAll({where:{userid:user.id}});
            // console.log(vaults)

            return res.status(200).json({ vaults });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    exports.sumUserVaults = async(req, res) => {
        try {
            let wallet = req.query.wallet;
            if(wallet !== ''){
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            // console.log(user);
            if(user){
                const vaults = await db.VaultAccount.sum('amount',{where:{userId:user.id}});
                // console.log(vaults)
    
                return res.status(200).json({ vaults });
            }else{
                const vaults = [];
                return res.status(200).json({ vaults });
            }
            }else{
                const vaults = [];
                return res.status(200).json({ vaults });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    exports.fetchRewards = async(req, res) => {
        try {
            let wallet = req.query.wallet;
            if(wallet !== ''){
            
                let user = await db.User.findOne({where:{wallet_address:wallet}});

            // console.log(user);
         if(user){
            let user_vaults = await db.VaultAccount.findAll({where:{userId:user.id}});
            let user_rewards = 0;

              for (const element of user_vaults) {
                 
                    let reward = await db.Reward.findOne({where:{vaultId:element.id}});
                    var today = new Date();
                    var curr_reward = (dateDifference(today, new Date(reward.createdAt))+1) * reward.amount;
                    user_rewards += curr_reward;
                   }

                   const rewards = {amount:user_rewards}
            // console.log(rewards)
            return res.status(200).json({ rewards });

         }else{
            let rewards = [];
            return res.status(200).json({ rewards });
         }
            }else{
                let rewards = [];
                return res.status(200).json({ rewards });
            }
        } catch (err) {
            // console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    function dateDifference(date2, date1) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    exports.groupUserVaults = async(req, res) => {
        try {
            let wallet = req.query.wallet;
            if(wallet !== ''){
                let user = await db.User.findOne({where:{wallet_address:wallet}});
                // console.log(user);
                if(user){
                    const vaultgroups = await db.VaultAccount.findAll({
                        where:{userId:user.id},
                        attributes: [
                          'lock_duration',
                          [Sequelize.fn('sum', Sequelize.col('amount')), 'total_amount'],
                        ],
                        group: ['lock_duration'],
                        raw: true
                      });
                      return res.status(200).json({ vaultgroups });
                }else{
                   let vaultgroups = [];
                    return res.status(200).json({ vaultgroups });
                }
                
            }else{
                let vaultgroups = [];
                return res.status(200).json({ vaultgroups });
            }
            
        } catch (err) {
            console.log(err)
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    exports.fetchBalances = async(req, res) => {
        try {
            const users = await User.findAll();

            return res.status(200).json({ users });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };


