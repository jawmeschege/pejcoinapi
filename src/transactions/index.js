// const authService = require('../../services/auth.service');
// const bcryptService = require('../../services/bcrypt.service');
const authService = require('../services/auth.service');

const db = require('../../models');
var Sequelize = require('sequelize');

     exports.createTransaction = async(req, res) => {
        const { body, header } = req;
        
        // if (header.secKey === '123645') {
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
                    txt_hash:body.txn_hash,
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

                //record first reward for the stake
                await db.Reward.create({
                    vaultId:create_vault.id,
                    amount: body.duration == 3 ? 1 * body.amount : body.duration == 6 ? 2 * body.amount : 12 * body.amount,
                    status: 0   //status 0 means the reward is unclaimed and still virtual
                });
                
                //record the reward transaction
                await db.Transactions.create({
                    user_id: user_id,
                    amount: body.amount,
                    txt_hash:body.txn_hash,
                    type:2, //Reward creation transaction
                    status:1  //statsu 1 means transaction has been execurtted
                });

                // record the reward balance
                    //check if there exists a balance
                let checkBalance = await db.RewardBalance.findOne({where:{userId:user_id}});
                // console.log(checkBalance);
                if(checkBalance){
                    console.log()
                    var newBal = checkBalance.amount + parseFloat(body.amount);
                    await  db.RewardBalance.update({
                        amount: newBal
                    }, {where:{userId:user_id}});
                }else{
                    await db.RewardBalance.create({
                        userId: user_id,
                        amount: body.amount,
                    });
                }
            
                //record the reward credit
                  await db.RewardCredit.create({
                        userId: user_id,
                        amount: body.amount,
                    });

                return res.status(200).json({ message: 'Transaction record created successfully and registered on the blockchain' });


            } catch (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Internal server error' });
            }
        // }

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

    exports.validateReward = (req, res) => {
        const { token } = req.body;

        authService().verify(token, (err) => {
            if (err) {
                return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
            }

            return res.status(200).json({ isvalid: true });
        });
    };

    exports.fetchTransactions = async(req, res) => {
        try {
            
            let wallet = req.query.wallet;
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            console.log(user);

            const transactions = await db.Transactions.findAll({where:{user_id:user.id}});
            console.log(transactions)

            return res.status(200).json({ transactions });
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
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            // console.log(user);

            const vaults = await db.VaultAccount.sum('amount',{where:{userId:user.id}});
            // console.log(vaults)

            return res.status(200).json({ vaults });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    exports.fetchRewards = async(req, res) => {
        try {
            let wallet = req.query.wallet;
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            // console.log(user);

            const rewards = await db.RewardBalance.findOne({where:{userId:user.id}});
            console.log(rewards)

            return res.status(200).json({ rewards });
        } catch (err) {
            // console.log(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    exports.groupUserVaults = async(req, res) => {
        try {
            let wallet = req.query.wallet;
            let user = await db.User.findOne({where:{wallet_address:wallet}});
            // console.log(user);

            const vaultgroups = await db.VaultAccount.findAll({
                attributes: [
                  'lock_duration',
                  [Sequelize.fn('sum', Sequelize.col('amount')), 'total_amount'],
                ],
                group: ['lock_duration'],
                raw: true
              },{where:{userId:user.id}});

            return res.status(200).json({ vaultgroups });
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


