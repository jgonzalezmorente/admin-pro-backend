
const { Schema, model } = require('mongoose');


const HospitalSchema = Schema({

    nombre: {
        required: true,
        type: String
    },
       
    img: {
        type: String,
    },

    usuario: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },

    hospital: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Hospital'
    }

});


HospitalSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();        
    return object;
});


module.exports = model( 'Medico', HospitalSchema );

