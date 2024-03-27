import { Resend } from 'resend';
import express from 'express';
import cors from 'cors';
import XlsxPopulate from 'xlsx-populate';
import { kv } from "@vercel/kv"; // Importar la SDK de KV de Vercel
import os from 'os'; // Importar el módulo 'os'
import path from 'path'; // Importar el módulo 'path'

const app = express();
const port = 3000;

let datosArr = [];
let datosCompletos = [];

async function main() {
    const workbook = await XlsxPopulate.fromBlankAsync();
    // Llenar el workbook con los datos necesarios

    // Convertir el workbook a un buffer
    const buffer = await workbook.outputAsync();

    // Guardar el buffer en KV con el nombre 'salida.xlsx'
    await kv.put("salida.xlsx", buffer);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ type: "*/*" }));
app.use(cors({
    origin: ['https://inscripciones-club-ciclon.netlify.app', 'https://inscripciones-club-ciclon.netlify.app/home']
}));

app.get('/', (req, res) => {
    res.send('Funciona correctamente');
});

app.post('/datos', async (req, res) => {
    let datos = req.body;
    datosArr = [datos];
    datosCompletos.push(datos)
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
                    href: `${process.env.VERCEL_URL}/_src/.vercel/kv/salida.xlsx`, // Cambiar 'VERCEL_URL' por la variable de entorno adecuada
                },
            ],
        });

        if (error) {
            console.error({ error });
            res.status(500).send('Error al enviar el correo electrónico.');
        } else {
            console.log('Correo electrónico enviado correctamente:', data);
            res.send(); // Envía una respuesta vacía
        }
    } catch (err) {
        console.error('Error al enviar el correo electrónico:', err);
        res.status(500).send('Error al enviar el correo electrónico.');
    }
});

app.listen(port, () => {
    console.log(`Estoy ejecutándome en http://localhost:${port}`);
});
