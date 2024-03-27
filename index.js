import { Resend } from 'resend';
import express from 'express';
import cors from 'cors';
import XlsxPopulate from 'xlsx-populate';

const app = express();
const port = 3000;

async function main(datos) {
    try {
        const workbook = await XlsxPopulate.fromBlankAsync();
        const sheet = workbook.sheet(0);

        // Agrega el contenido al libro de Excel
        // (código para agregar datos omitido para mayor brevedad)

        // Convierte el libro de Excel a un buffer
        const buffer = await workbook.outputAsync();

        return buffer;
    } catch (error) {
        throw new Error(`Error en la función main(): ${error.message}`);
    }
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

    try {
        const excelBuffer = await main(datos);
        const resend = new Resend('re_BESoasix_834sJRhhpnnofMrFQ1WqVWHR');

        const { data, error } = await resend.emails.send({
            from: 'Pre-Inscripciones Club Ciclon<onboarding@resend.dev>',
            to: ['agusalt2004@hotmail.com'],
            subject: `${datos.nombre} NUEVA PRE-INSCRIPCION`,
            html: `<p>
                <strong>NOMBRE:</strong> ${datos.nombre}<br><br>
                <strong>APELLIDO:</strong> ${datos.apellido}<br><br>
                <strong>SEXO:</strong> ${datos.sexo}<br><br>
                <strong>FECHA DE NACIMIENTO:</strong> ${datos.fecha_nacimiento}<br><br>
                <strong>DOCUMENTO:</strong> ${datos.documento}<br><br>
                <strong>CIUDAD:</strong> ${datos.ciudad}<br><br>
                <strong>DOMICILIO:</strong> ${datos.domicilio}<br><br>
                <strong>EDAD:</strong> ${datos.edad}<br><br>
                <strong>TIPO DE CARRERA:</strong> ${datos.carrera}<br><br>
                <strong>TELEFONO:</strong> ${datos.telefono}<br><br>
                <strong>EMAIL:</strong> ${datos.email}<br><br>
            </p>`,
            attachments: [
                {
                    filename: 'pre-inscripciones-Club-Ciclon.xlsx',
                    content: excelBuffer,
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
