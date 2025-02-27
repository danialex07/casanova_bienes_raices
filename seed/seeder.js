import {exit} from 'node:process'
import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";
//import Categoria from '../models/Categoria.js';
//import Precio from '../models/Precio.js';
import db from '../config/db.js'
import {Categoria, Precio, Usuario} from '../models/index.js'
import { where } from 'sequelize';
import { truncate } from 'node:fs';

const importarDatos = async () => {
    try{
        //Autenticar
        await db.authenticate()


        //generar las columnas
        await db.sync()


        //Insertamos los datos
        //await Categoria.bulkCreate(categorias)
        //await Precio.bulkCreate(precios)


        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos Importados Correctamente')
        exit()


    } catch(error){
        console.log(error)
        exit(1)



    }
}
const eliminarDatos = async()=>{

    try{
        //await Promise.all([
        //    Categoria.destroy({where: {},truncate:true}),
        //    Precio.destroy({where:{},truncate:true})
        //])
        await db.sync({force: true})
        console.log('datos eliminados correctamente');
        exit()

    }catch(error){
        console.log(error)
        exit(1)

    }
}
if(process.argv[2] == "-i"){
    importarDatos();
}
if(process.argv[2] == "-e"){
    eliminarDatos();
}
