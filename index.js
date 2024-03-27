import { Resend } from 'resend';
import express from 'express';
import cors from 'cors';
import XlsxPopulate from 'xlsx-populate';
import fs from 'fs';
import path from 'path'; // Importa el módulo 'path'
import os from 'os'; // Importa el módulo 'os'
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;
const app = express();
const port = 3000;
// Configurar la conexión a la base de datos utilizando las variables de entorno
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false // Deshabilitar la verificación del certificado SSL
    }
});

// Función para insertar datos en la base de datos
async function insertarDatos(datos) {
    try {
        // Consulta SQL para insertar datos en la tabla 'usuarios'
        const query = 'INSERT INTO usuarios (nombre, apellido, sexo, "fecha de nacimiento", documento, ciudad, domicilio, edad, "tipo de carrera", telefono, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
        
        // Parámetros para la consulta SQL
        const values = [
            datos.nombre,
            datos.apellido,
            datos.sexo,
            datos.fecha_nacimiento,
            datos.documento,
            datos.ciudad,
            datos.domicilio,
            datos.edad,
            datos.carrera,
            datos.telefono,
            datos.email
        ];

        // Ejecutar la consulta SQL utilizando el cliente PostgreSQL
        const result = await pool.query(query, values);

        // Imprimir el resultado de la consulta
        console.log('Datos insertados correctamente:', result.rowCount);
    } catch (error) {
        // Capturar cualquier error que ocurra durante la ejecución de la consulta
        console.error('Error al insertar datos:', error);
    }
}

// Llamar a la función para insertar datos
insertarDatos('Pepe', 'Peposo', 20);
let datosArr = [];
const directorioAlmacenamiento = './excels';
const salidaXLSXPath = `${os.tmpdir()}/salida.xlsx`; // Usa el directorio temporal del sistema
if (!fs.existsSync(os.tmpdir())) {
    fs.mkdirSync(os.tmpdir());
}
let datosCompletos = [];
let salidaXLSXContent;

async function main() {
    const workbook = await XlsxPopulate.fromBlankAsync();
    workbook.sheet(0).cell('A1').value('NOMBRE');
    workbook.sheet(0).cell('B1').value('APELLIDO');
    workbook.sheet(0).cell('C1').value('SEXO');
    workbook.sheet(0).cell('D1').value('FECHA DE NACIMIENTO');
    workbook.sheet(0).cell('E1').value('DOCUMENTO');
    workbook.sheet(0).cell('F1').value('CIUDAD');
    workbook.sheet(0).cell('G1').value('DOMICILIO');
    workbook.sheet(0).cell('H1').value('EDAD');
    workbook.sheet(0).cell('I1').value('TIPO DE CARRERA');
    workbook.sheet(0).cell('J1').value('TELEFONO');
    workbook.sheet(0).cell('K1').value('EMAIL');
    workbook.sheet(0).cell('L1').value('PAGO');

    datosCompletos.forEach((datos, index) => {
        const rowIndex = index + 2;
        workbook.sheet(0).cell(`A${rowIndex}`).value(datos.nombre);
        workbook.sheet(0).cell(`B${rowIndex}`).value(datos.apellido);
        workbook.sheet(0).cell(`C${rowIndex}`).value(datos.sexo);
        workbook.sheet(0).cell(`D${rowIndex}`).value(datos.fecha_nacimiento);
        workbook.sheet(0).cell(`E${rowIndex}`).value(datos.documento);
        workbook.sheet(0).cell(`F${rowIndex}`).value(datos.ciudad);
        workbook.sheet(0).cell(`G${rowIndex}`).value(datos.domicilio);
        workbook.sheet(0).cell(`H${rowIndex}`).value(datos.edad);
        workbook.sheet(0).cell(`I${rowIndex}`).value(datos.carrera);
        workbook.sheet(0).cell(`J${rowIndex}`).value(datos.telefono);
        workbook.sheet(0).cell(`K${rowIndex}`).value(datos.email);
    });

    await workbook.toFileAsync(salidaXLSXPath);
    salidaXLSXContent = fs.readFileSync(salidaXLSXPath);
}

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json({
    type: "*/*"
}))

app.use(cors({
    origin: ['https://inscripciones-club-ciclon.netlify.app', 'https://inscripciones-club-ciclon.netlify.app/home']
}));

app.get('/', (req, res) => {
    res.send('funciona correctamente');
})
app.get('/exportar-datos', async (req, res) => {
    try {
        // Consulta SQL para seleccionar todos los datos de la tabla 'usuarios'
        const query = 'SELECT * FROM usuarios';
        
        // Ejecutar la consulta SQL utilizando el cliente PostgreSQL
        const result = await pool.query(query);

        // Convertir los resultados de la consulta a un formato de hoja de cálculo
        let workbook = await XlsxPopulate.fromBlankAsync();
        let sheet = workbook.sheet(0);
        sheet.cell('A1').value('Nombre');
        sheet.cell('B1').value('Apellido');
        sheet.cell('C1').value('Edad');

        // Iterar sobre los resultados y escribirlos en la hoja de cálculo
        result.rows.forEach((row, index) => {
            const rowIndex = index + 2;
            sheet.cell(`A${rowIndex}`).value(row.nombre);
            sheet.cell(`B${rowIndex}`).value(row.apellido);
            sheet.cell(`C${rowIndex}`).value(row.edad);
        });

        // Guardar el archivo Excel temporalmente
        const outputPath = path.join(os.tmpdir(), 'usuarios.xlsx');

        await workbook.toFileAsync(outputPath);

        // Leer el contenido del archivo Excel
        const excelContent = fs.readFileSync(outputPath);

        // Enviar el correo electrónico con el archivo adjunto
        const { data, error } = await resend.emails.send({
            from: 'Tu Nombre <tu_correo@gmail.com>',
            to: ['destinatario@gmail.com'],
            subject: 'Datos de usuarios en Excel',
            html: 'Adjunto encontrarás los datos de usuarios en formato Excel.',
            attachments: [
                {
                    filename: 'usuarios.xlsx',
                    content: excelContent,
                },
            ],
        });

        if (error) {
            console.error({ error });
            res.status(500).send('Error al enviar el correo electrónico.');
        } else {
            console.log('Correo electrónico enviado correctamente:', data);
            res.send('Correo electrónico enviado correctamente');
        }
    } catch (error) {
        console.error('Error al exportar datos:', error);
        res.status(500).send('Error al exportar datos.');
    }
});

app.post('/datos', async (req, res) => {
    let datos = req.body;
    datosArr = [datos];
    datosCompletos.push(datos)
    await insertarDatos(datos);
    await main();
    const resend = new Resend('re_BESoasix_834sJRhhpnnofMrFQ1WqVWHR');

    try {
        const { data, error } = await resend.emails.send({
            from: 'Pre-Inscripciones Club Ciclon<onboarding@resend.dev>',
            to: ['agusalt2004@hotmail.com'],
            subject: `${datosArr[0].nombre} NUEVA PRE-INSCRIPCION`,
            html: `<p>
            <strong>NOMBRE:</strong> ${datosArr[0].nombre}<br><br>
            <strong>APELLIDO:</strong> ${datosArr[0].apellido}<br><br>
            <strong>SEXO:</strong> ${datosArr[0].sexo}<br><br>
            <strong>FECHA DE NACIMIENTO:</strong> ${datosArr[0].fecha_nacimiento}<br><br>
            <strong>DOCUMENTO:</strong> ${datosArr[0].documento}<br><br>
            <strong>CIUDAD:</strong> ${datosArr[0].ciudad}<br><br>
            <strong>DOMICILIO:</strong> ${datosArr[0].domicilio}<br><br>
            <strong>EDAD:</strong> ${datosArr[0].edad}<br><br>
            <strong>TIPO DE CARRERA:</strong> ${datosArr[0].carrera}<br><br>
            <strong>TELEFONO:</strong> ${datosArr[0].telefono}<br><br>
            <strong>EMAIL:</strong> ${datosArr[0].email}<br><br>
            </p>`,
            attachments: [
                {
                    filename: 'pre-inscripciones-Club-Ciclon.xlsx',
                    content: salidaXLSXContent,
                },
            ],
        });

        if (error) {
            console.error({ error });
            res.status(500).send('Error  al enviar el correo electrónico.');
        } else {
            await main();
            console.log('Correo electrónico enviado correctamente:', data);
            res.send(); // Envía una respuesta vacía
        }
    } catch (err) {
        console.error('Error al enviar el correo electrónico:', err);
        res.status(500).send('Error al enviar el correo electrónico.');
    }
});

app.listen(port, () => {
    console.log(`estoy ejecutandome en http://localhost:${port}`)
})
