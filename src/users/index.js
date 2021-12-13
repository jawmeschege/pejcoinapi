const authService = require('../services/auth.service');
// const bcryptService = require('../services/bcrypt.service');

const db = require('../../models');

     exports.createUser = async(req, res) => {

        const { body } = req;
        
                try {
                    const user = await db.User.create({
                        wallet_address: body.wallet_address,
                        password: body.wallet_address,
                    });
                    const token = authService().issue({ id: user.id });

                    return res.status(200).json({ token, user });
                } catch (err) {
                    console.log(err);
                    return res.status(500).json({ msg: 'Internal server error' });
                }
            

        };

    
   


