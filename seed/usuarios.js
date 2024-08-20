import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'juan',
        email: 'juan@juan.com',
        confirmado: 1,
        password: bcrypt.hashSync('password',10) 
    }
]
export default usuarios