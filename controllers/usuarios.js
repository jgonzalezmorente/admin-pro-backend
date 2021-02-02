const { response } = require('express');
const bcrypjs = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');



const getUsuarios = async(req, res) => {

    const desde = Number(req.query.desde) || 0;

    // const usuarios = await Usuario
    //     .find({}, 'nombre email rol google')
    //     .skip( desde )
    //     .limit( 5 );

    // const total = await Usuario.count();

    const [ usuarios, total ] = await Promise.all([
        
        Usuario
            .find({}, 'nombre email rol google img')
            .skip( desde )
            .limit( 5 ),

        Usuario.countDocuments()

    ]);

    res.status(400).json({
        ok: true,
        usuarios,
        total
    });
}



const crearUsuario = async(req, res = response) => {
    
    const { email, password } = req.body;

    try {
        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const usuario = new Usuario( req.body );

        // Encriptar contraseña
        const salt = bcrypjs.genSaltSync();
        usuario.password = bcrypjs.hashSync( password, salt )
        await usuario.save();

        // Generar el TOKEN - JWT
        const token = await generarJWT( usuario.id );
        
        res.status(400).json({
            ok: true,
            usuario,
            token
        });        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs'
        })
        
    }
}



const actualizarUsuario = async (req, res) => {

    // TODO: Validar token y comprobar si es el usuario correcto

    const uid = req.params.id;    

    try {

        const usuarioDB = await Usuario.findById({ _id: uid });
        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe un usuario para ese id'
            });
        }

       // Actualizaciones
       const { password, google, email, ...campos } = req.body;

        if ( usuarioDB.email !== email ) {
            const existeEmail = await Usuario.findOne({ email });
            if ( existeEmail ) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email'
                });
            }
        }

        campos.email = email;
        const usuarioActualizado = await Usuario.findByIdAndUpdate( uid, campos, { new: true } );
        
        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }

};



const borrarUsuario = async ( req, res ) => {

    try {
        const uid = req.params.id;
        const usuarioDB = await Usuario.findById({ _id: uid });
        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe un usuario para ese id'
            });
        }
        
        await Usuario.findByIdAndDelete({ _id: uid });

        return res.json({
            ok: true,
            msg: 'Usuario eliminado'
        });
    
    } catch( error ) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}



module.exports = {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
}

