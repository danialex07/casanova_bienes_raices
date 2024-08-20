import nodemailer from 'nodemailer'


const emailRegistro = async (datos) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });
    const {email,nombre,token} = datos

    //Enviar el  email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en bienes raices',
        text: 'Confirma tu cuenta en bienes raices',
        html: `
            <p>Hola ${nombre},comprueba tu  cuenta en bienes raices</p>
            <p>Tu cuenta,solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token} ">Confirmar Cuenta</a></p>
            <p>si tu lo creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })

}

const emailOlvidePassword = async (datos) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });
    const {email,nombre,token} = datos

    //Enviar el  email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Reestablece tu password en bienes raices',
        text: 'Reestablece tu Password en  bienes raices',
        html: `
            <p>Hola ${nombre},Has solicitado restablecer tu password en bienes raices</p>
            <p>Sigue el siguiente enlace para generar un password nuevo :
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token} ">Restablecer Password</a></p>
            <p>si tu solicitaste le cambio de password, puedes ignorar el mensaje</p>
        `
    })

}


export{
    emailRegistro,
    emailOlvidePassword

}