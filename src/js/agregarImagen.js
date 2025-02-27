import {Dropzone} from 'dropzone'
//import { header } from 'express-validator'

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')


Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube tus imagenes aqui',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallepUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Borrar Archivo',
    dictMaxFilesExceeded: 'El limite es 1 Archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function(){
        const dropzone =  this
        const btnPublicar = document.querySelector('#publicar')

        btnPublicar.addEventListener('click',function(){
            dropzone.processQueue()

        })

        dropzone.on('queuecomplete',function(){
            if(dropzone.getActiveFiles().length == 0){
                window.location.href = '/mis-propiedades'
            }


        })

    }


}
