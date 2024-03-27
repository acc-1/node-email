import { Resend } from 'resend';
import express from 'express';
import cors from 'cors';
import XlsxPopulate from 'xlsx-populate';
import fs from 'fs';
const app=express()
const port = 3000

let datosArr = [];
const salidaXLSXPath = './salida.xlsx';
let datosCompletos = [];
let salidaXLSXContent;
// #region
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
        extended:true
    })
)

app.use(express.json({
    type: "*/*"
}))

app.use(cors({
  origin: ['https://inscripciones-club-ciclon.netlify.app', 'https://inscripciones-club-ciclon.netlify.app/home']
}));
// #endregion




app.get('/', (req, res)=>{
    res.send('funciona correctamente');
})

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

app.listen(port, ()=>{
    console.log(`estoy ejecutandome en http://localhost:${port}`)
})




