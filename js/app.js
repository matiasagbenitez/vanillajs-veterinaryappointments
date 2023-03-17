// VARIABLES SELECTORES
let DB;

const formulario        = document.querySelector('#nueva-cita');

const mascotaInput      = document.querySelector('#mascota');
const propietarioInput  = document.querySelector('#propietario');
const telefonoInput     = document.querySelector('#telefono');
const fechaInput        = document.querySelector('#fecha');
const horaInput         = document.querySelector('#hora');
const sintomasInput     = document.querySelector('#sintomas');

const contenedorCitas   = document.querySelector('#citas');

let editando;

const citaObj = { mascota: '', propietario: '', telefono: '', fecha: '', hora: '', sintomas: '' }

window.onload = () => {
    iniciarApp();
    crearDB();

}

// EVENTOS DE LOS INPUTS
function iniciarApp() {
    mascotaInput        .addEventListener('change', datosCita);
    propietarioInput    .addEventListener('change', datosCita);
    telefonoInput       .addEventListener('change', datosCita);
    fechaInput          .addEventListener('change', datosCita);
    horaInput           .addEventListener('change', datosCita);
    sintomasInput       .addEventListener('change', datosCita);
    formulario          .addEventListener('submit', nuevaCita);
}

// CLASES
class Citas {
    constructor() {
        this.citas = [];
    }

    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }

    eliminarCita(id) {
        this.citas = this.citas.filter(cita => cita.id !== id);
    }

    editarCita(citaActualizada) {
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita);
    }
}

class UI {

    imprimirAlerta(mensaje, tipo) {
        const divMensaje = document.createElement('div');
        divMensaje.textContent = mensaje;
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');
        if(tipo === 'error') {
            divMensaje.classList.add('danger');
            divMensaje.style.backgroundColor = 'red';
        } else {
            divMensaje.classList.add('success');
            divMensaje.style.backgroundColor = 'green';
        }

        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    imprimirCitas() {
        ui.limpiarHTML();
        // Leer el contenido de la BD
        const objectStore = DB.transaction('citas').objectStore('citas');
        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
                // Destructuring
                const { mascota, propietario, telefono, hora, fecha, sintomas, id } = cursor.value;
    
                // Scripting para cada input
                const div = document.createElement('div');
                div.classList.add('cita', 'p-3');
                div.dataset.id = id;
    
                const mascotaParrafo = document.createElement('h2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.textContent = mascota;
    
                const propietarioParrafo = document.createElement('p');
                propietarioParrafo.innerHTML = `<span class="font-weight-bolder">Propietario:</span> ${propietario}`;
    
                const telefonoParrafo = document.createElement('p');
                telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Teléfono:</span> ${telefono}`;
    
                const fechaParrafo = document.createElement('p');
                fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha:</span> ${fecha}`;
    
                const horaParrafo = document.createElement('p');
                horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora:</span> ${hora}`;
    
                const sintomasParrafo = document.createElement('p');
                sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas:</span> ${sintomas}`;
    
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = `Eliminar 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> 
                </svg>`;
                btnEliminar.onclick = () => eliminarCita(id);
    
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-info', 'mr-2');
                btnEditar.innerHTML = `Editar 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>`;
                const cita = cursor.value;
                btnEditar.onclick = () => editarCita(cita);
    
                // Insertamos los párrafos en el div
                div.appendChild(mascotaParrafo);
                div.appendChild(propietarioParrafo);
                div.appendChild(telefonoParrafo);
                div.appendChild(fechaParrafo);
                div.appendChild(horaParrafo);
                div.appendChild(sintomasParrafo);
                div.appendChild(btnEliminar);
                div.appendChild(btnEditar);
                
                // Insertamos el div en el contenedor
                contenedorCitas.appendChild(div);

                // Ve al siguiente elemento
                cursor.continue();
            }

        }
    }

    limpiarHTML() {
        while(contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
}

const citas = new Citas();
const ui = new UI();

// FUNCIONES
function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
}

function nuevaCita(e) {
    
    e.preventDefault();

    const { mascota, propietario, telefono, hora, fecha, sintomas } = citaObj;
    if (mascota === '' || propietario === '' || telefono === '' || hora === '' || fecha === '' || sintomas === '') {
        ui.imprimirAlerta('¡Todos los campos son obligatorios!', 'error');
        return;
    }

    if (editando) {
        citas.editarCita({...citaObj});

        // BD
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.put(citaObj);
        transaction.oncomplete = function () {
            formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';
            ui.imprimirAlerta('Se editó correctamente.');
            editando = false;
        }
        transaction.onerror = function () {
            console.log('Hubo un error');
        }

    } else {
        citaObj.id = Date.now();                                    // Generar id único para cada cita
        citas.agregarCita({...citaObj});                            // Agregamos la cita
        
        // BD
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.add(citaObj);
        transaction.oncomplete = function() {
            console.log('Cita agregada');
            ui.imprimirAlerta('Se agregó correctamente.');
        }
    }
    
    // Reiniciamos el objeto (posee los datos anteriores)
    reiniciarObjeto();

    // Reiniciamos el formulario
    formulario.reset();

    // Mostrar el HTML de las citas
    ui.imprimirCitas();
}

function reiniciarObjeto() {
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}

function eliminarCita(id) {
    // Eliminar la cita
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);
    
    transaction.oncomplete = function () {
        ui.imprimirAlerta('¡Cita borrada correctamente!');          // Mostrar mensaje
        ui.imprimirCitas();                                         // Refrescar citas
    }
    transaction.onerror = function () {
        console.log('Hubo un error');
    }
}

function editarCita(cita) {
    const { mascota, propietario, telefono, hora, fecha, sintomas, id } = cita;

    // Llena los inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';
    editando = true;
}

// Creación BD
function crearDB() {
    const crearDB = window.indexedDB.open('citas', 1);

    crearDB.onerror = () => {
        console.log('Hubo un error.');
    }

    crearDB.onsuccess = () => {
        console.log('BD creada.');
        DB = crearDB.result;
        ui.imprimirCitas();
    }

    // Definir el schema
    crearDB.onupgradeneeded = function(e) {
        const db = e.target.result;
        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });

        // Definir las columnas
        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('propietario', 'propietario', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});

        console.log('DB creada y lista.');
    }
    
}