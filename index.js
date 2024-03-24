import { Resend } from 'resend';
import express from 'express';
import cors from 'cors';

const app=express()
const port = 3000

let datosArr = [];


// #region




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

app.post('/datos', (req, res)=>{
    let datos= req.body
     datosArr = [datos]
    res.send(JSON.stringify('guardada bb'))
    console.log(datosArr)
    
    const resend = new Resend('re_BESoasix_834sJRhhpnnofMrFQ1WqVWHR');

(async function () {
  const { data, error } = await resend.emails.send({
    from: 'Pre-Inscripciones Club Ciclon<onboarding@resend.dev>',
    to: ['agusalt2004@hotmail.com'],
    subject: 'NUEVA PRE-INSCRIPCION',
    html: `  <p>
    <strong>NOMBRE:</strong> ${datosArr[0].nombre}<br><br>
    <strong>APELLIDO:</strong> ${datosArr[0].apellido}<br><br>
    <strong>SEXO:</strong> ${datosArr[0].sexo}<br><br>
    <strong>EDAD:</strong> ${datosArr[0].edad}<br><br>
    <strong>TIPO DE CARRERA:</strong> ${datosArr[0].carrera}<br><br>
    <strong>TELEFONO:</strong> ${datosArr[0].telefono}<br><br>
    <strong>EMAIL:</strong> ${datosArr[0].email}<br><br>
  </p>
    `,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();

})

app.listen(port, ()=>{
    console.log(`estoy ejecutandome en http://localhost:${port}`)
})




