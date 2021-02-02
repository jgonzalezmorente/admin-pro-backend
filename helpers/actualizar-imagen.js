const fs = require( 'fs' );

const Usuario  = require( '../models/usuario' );
const Medico   = require( '../models/medico' );
const Hospital = require( '../models/hospital' );



const borrarImagen = ( path ) => {    
    if ( fs.existsSync( path ) ) {
        
        // Borrar la imagen anterior
        fs.unlinkSync( path );        
    }        
}


const actualizarImagenTipo = async ( Modelo, tipo, id, nombreArchivo ) => {

    try {                
        const objeto = await Modelo.findById( id );

        const pathViejo = `./uploads/${ tipo }/${ objeto.img }`;
        borrarImagen( pathViejo );
    
        objeto.img = nombreArchivo;
        await objeto.save();
        return true;    
                
    } catch (error) {                
        console.log(`No existe ningún objeto en la colección ${ tipo } con id ${ id }`);
        return false;
    }

    


}



const actualizarImagen = async ( tipo, id, nombreArchivo ) => {
    
    switch( tipo ) {   
        
        case 'medicos':
            return await actualizarImagenTipo( Medico, tipo, id, nombreArchivo )

        case 'hospitales':        
            return await actualizarImagenTipo( Hospital, tipo, id, nombreArchivo )
            
        case 'usuarios':
            return await actualizarImagenTipo( Usuario, tipo, id, nombreArchivo )
                        
        default:
            break;
    }

}



module.exports = {
    actualizarImagen
}