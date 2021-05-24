const { response } = require('express');

const Usuario = require('../models/usuario')
const bcrypjs = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google-verify');
const { getMenuFrontEnd } = require('../helpers/menu-frontend');


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
            token,
            menu: getMenuFrontEnd( usuarioDB.role )
        } );

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Habla con el administrador'
        });
    }

}


const googleSignIn = async ( req, res = response ) => {

    const googleToken = req.body.token;

    
    try {
        const { name, email, picture } = await googleVerify( googleToken );

        const usuarioDB = await Usuario.findOne( { email } );

        let usuario;
        if ( !usuarioDB ) {

            usuario = new Usuario( {
                nombre: name,
                email,
                password: '@@@',
                img: picture,
                google: true
            } );

        } else {

            usuario = usuarioDB;
            usuario.google = true;            

        }

        await usuario.save();

        // Generar el TOKEN - JWT
        const token = await generarJWT( usuario.id );        
        
        res.json({
    
            ok: true,
            token,
            menu: getMenuFrontEnd( usuario.role )
    
        });
        
    } catch (error) {

        res.status(401).json({
    
            ok: false,
            msg: 'Token no es correcto'
    
        });        
        
    }
}


const renewToken = async ( req, res = response ) => {

    const uid = req.uid;
    
    try {
        // Generar el TOKEN - JWT
        const token = await generarJWT( uid );
        
        // Obtener el usuario por UID
        const usuario = await Usuario.findById( uid );

        res.json({
            ok: true,
            token,
            usuario,
            menu: getMenuFrontEnd( usuario.role )

        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Habla con el administrador'
        });
    }
    
}



module.exports = {
    login,
    googleSignIn,
    renewToken
}
