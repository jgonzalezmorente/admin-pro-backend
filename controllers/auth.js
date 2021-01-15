const { response } = require('express');

const Usuario = require('../models/usuario')
const bcrypjs = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');


const login = async( req, res = response ) => {

    try {

        const { email, password } = req.body;

        // Verificar email
        const usuarioDB = await Usuario.findOne( { email } );
        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Email no válido'
            })
        }

        // Verificar contraseña
        const validPassword = bcrypjs.compareSync( password, usuarioDB.password );
        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña no válida'
            });
        }

        // Generar el TOKEN - JWT
        const token = await generarJWT( usuarioDB.id );

        return res.json({
            ok: true,
            token
        } );

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Habla con el administrador'
        });
    }

}



module.exports = {
    login
}
