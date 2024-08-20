import {check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import  jwt from 'jsonwebtoken'
import Usuario from "../models/Usuario.js"
import {generarJWT,generarId} from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/emails.js'
//import {where} from 'sequelize'
//import db from '../config/db.js'
const formularioLogin = (req, res) => {
    res.render('auth/login',{
        pagina:'Iniciar Sesion',
        csrfToken: req.csrfToken()
       
    })


}

const autenticar = async (req,res) => {
    //validacion
    await check('email').isEmail().withMessage('el email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('el password es obligatorio').run(req)


    let resultado =  validationResult(req)

    
    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/login',{
            pagina: 'Iniciar sesion',
            csrfToken : req.csrfToken(),
            errores: resultado.array(),
            
        })

    }
    const {email, password}= req.body

    //Comprobar si el usuario existe

    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/login',{
            pagina: 'Iniciar sesion',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'el usuario No existe'}]
            
        })

    }
    //Comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina: 'Iniciar sesion',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
            
        })
    }
    //revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar sesion',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
            
        })

    }
    //Autenticar al usuario
    const token =  generarJWT({id:usuario.id, nombre:usuario.nombre})
    console.log(token)
    //almacenar en un cockies

    return res.cookie('_token',token,{
        httpOnly: true,
        //secure: true

    }).redirect('/mis-propiedades')
    



}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}


const formularioRegistro = (req, res) => {
    
    res.render('auth/registro',{
        pagina:'Crear cuenta',
        csrfToken : req.csrfToken()
        
    })


}
const registrar = async(req, res) => {
    //validacion 
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('ese no parece un email').run(req)
    await check('password').isLength({min: 6}).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('los password no son iguales').run(req)

    let resultado =  validationResult(req)

    
    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken : req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })

    }

    //extraer los datos
    const {nombre,email,password} = req.body

    //verificar  que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where : {email}})
    if(existeUsuario){
        
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'el usuario ya esta registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })

    }

    //Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia email de confirmacion

    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token

    })

    // Mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'hemos Enviado un Email de Confirmacion, presiona en el enlace'
    })


}
//Funcion  que comprueba una cuenta
const confirmar = async (req, res) => {
    const{token} = req.params;
    
    //verificar  si el token es valido 
    const usuario = await Usuario.findOne({where:{token}}) 
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta ,intenta de nuevo',
            error: true

        })
    }


    //confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmo Correctamente'

    })

    
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password',{
        pagina:'Recupera tu acceso a Bienes Raices',
        csrfToken : req.csrfToken(),
        
    })



}
const resetPassword = async (req, res) => {

    //validacion 
    await check('email').isEmail().withMessage('ese no parece un email').run(req)
    
    let resultado =  validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/olvide-password',{
            pagina:'Recupera tu acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
            
        })

    }

    // Buscar  el usuario

    const {email} = req.body
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/olvide-password',{
            pagina:'Recupera tu acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores: [{msg:'el email no pertenece a ningun usuariio'}]
            
        })

    }
    //generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();


    //Enviar un Email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })



    //mostrar el mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
        
    })

}
const comprobarToken = async (req, res,) =>{
    const {token} = req.params;

    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Restablece tu password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true

        })

    }

    //console.log(usuario)
    //mostrar formulario para modificar el password
    res.render('auth/reset-password',{
        pagina: 'Restablece Tu Password',
        csrfToken: req.csrfToken()
    })
    

}
const nuevoPassword = async (req, res) =>{
    //validar el password
    await check('password').isLength({min: 6}).withMessage('El password debe ser de al menos 6 caracteres').run(req)

    let resultado = validationResult(req)

    //verificar que el resultado este vacio

    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/reset-password',{
            pagina:'Reestablece tu password',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
            
        })

    }

    const {token} = req.params
    const{password} = req.body

    //identificar el nuevo password
    const usuario = await Usuario.findOne({where: {token}})



    //hashear el password

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(usuario.password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina: 'Password Reestablece',
        mensaje: 'el password se guardp correctamente'
    })
    
}




export{
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword

}