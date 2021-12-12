// const authService = require('../../services/auth.service');
// const bcryptService = require('../../services/bcrypt.service');
const db = require('../../models');


     exports.createTransaction = async(req, res) => {
        const { body } = req;

        if (body.secKey === '123645') {
            try {
                var user = await User.findOne({where:{wallet_address:body.address}})
                //record the deposit transaction
                const transaction = await Transaction.create({
                    userId: user_id,
                    amount: body.amount,
                    txt_hash:body.hash,
                    txt_hash:body.hash,
                    lock_duration:body.duration,
                    status:1  //statsu 1 means transaction has been execurtted
                });

                // record reward category for the transaction
                // const reward_class = await RewardClass.create({
                //     category_id: body.category,
                //     userId: user_id,
                //     txn_id: body.txn

                // });
                //record first reward for the stake
                const reward = await Rewards.create({
                    classId:reward_class.id,
                    amount: reward_class.category_id === 1 ? reward_class.category_id= 2 : 3,
                    status: 1
                });

                   // record the reward balance
                    //check if there exists a balance
                let checkBalance = RewardBalance.findOne({where:{userId:id}});

                if(checkBalance){
                    RewardBalance.update({
                        balance: checkBalance.amount + body.amount,
                        where:{userId:user_id}
                    });
                }else{
                    RewardBalance.create({
                        userId: user_id,
                        amount: body.amount,
                    });
                }

                //record the reward credit
                RewardBalance.create({
                    userId: user_id,
                    amount: body.amount,
                });

                return res.status(200).json({ message: 'Transaction record created successfully and registered on the blockchain' });


            } catch (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Internal server error' });
            }
        }

        return res.status(400).json({ msg: 'Bad Request: Passwords don\'t match' });
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
            const users = await User.findAll();

            return res.status(200).json({ users });
        } catch (err) {
            console.log(err);
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


