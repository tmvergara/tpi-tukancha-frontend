import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <Card>
        <CardHeader>
          <div className="flex mb-5 align-middle items-center">
            <a href="https://www.frc.utn.edu.ar/">
              <img
                src="https://www.frc.utn.edu.ar/secretarias/riyrsu/pub/image/FRC.png"
                className="h-12"
                alt=""
              />
            </a>
            <a href="/">
              <img src="./Logo1.png" alt="" className="h-14 ml-2" />
            </a>
          </div>
          <CardTitle className="text-3xl">Política de Privacidad</CardTitle>
          <p className="text-sm text-muted-foreground">
            Última actualización: Noviembre 2025
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              1. Naturaleza del Proyecto
            </h2>
            <p className="text-muted-foreground">
              TuKancha es un proyecto académico desarrollado para la materia
              &quot;Desarrollo de Aplicaciones con Objetos&quot; con propósitos
              exclusivamente educativos. Esta política de privacidad describe
              cómo se maneja la información en el contexto de este proyecto
              universitario.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              2. Recopilación de Información
            </h2>
            <p className="text-muted-foreground mb-2">
              Como parte de las funcionalidades del proyecto, la plataforma
              puede recopilar:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Información de registro (nombre, email, teléfono)</li>
              <li>Datos del club deportivo (nombre, dirección, horarios)</li>
              <li>Información de reservas y transacciones de prueba</li>
              <li>
                Datos de uso y navegación para fines de desarrollo y testing
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              3. Uso de la Información
            </h2>
            <p className="text-muted-foreground mb-2">
              La información recopilada se utiliza únicamente para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Demostrar las funcionalidades del proyecto académico</li>
              <li>Realizar pruebas y evaluaciones del sistema</li>
              <li>Cumplir con los requisitos de la materia universitaria</li>
              <li>Identificar y corregir errores durante el desarrollo</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              4. Advertencia Importante
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-muted-foreground font-semibold mb-2">
                ⚠️ NO utilice datos reales o sensibles
              </p>
              <p className="text-muted-foreground text-sm">
                Este es un proyecto académico sin las medidas de seguridad
                requeridas para un entorno de producción. NO ingrese información
                personal real, datos bancarios, contraseñas que utilice en otros
                servicios, o cualquier información sensible o confidencial.
              </p>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              5. Seguridad de los Datos
            </h2>
            <p className="text-muted-foreground">
              Si bien se implementan medidas básicas de seguridad, este proyecto
              NO cuenta con los estándares de seguridad requeridos para proteger
              información real o sensible. Los datos pueden estar expuestos a
              riesgos de seguridad propios de un ambiente de desarrollo y
              pruebas.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              6. Retención de Datos
            </h2>
            <p className="text-muted-foreground">
              Los datos almacenados en la plataforma pueden ser:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>
                Eliminados sin previo aviso al finalizar el período académico
              </li>
              <li>Modificados o borrados durante pruebas y desarrollo</li>
              <li>
                Perdidos en caso de fallos técnicos o finalización del proyecto
              </li>
              <li>No respaldados de forma regular ni permanente</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              7. Compartir Información
            </h2>
            <p className="text-muted-foreground">
              La información del proyecto puede ser compartida únicamente con:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Profesores y evaluadores de la materia</li>
              <li>Compañeros de equipo del proyecto</li>
              <li>Personal académico autorizado de la institución educativa</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              8. Sin Fines Comerciales
            </h2>
            <p className="text-muted-foreground">
              Este proyecto NO tiene fines comerciales. Los datos NO serán
              vendidos, alquilados ni compartidos con terceros para propósitos
              comerciales o de marketing.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">9. Cookies</h2>
            <p className="text-muted-foreground">
              La plataforma puede utilizar cookies básicas para mantener
              sesiones de usuario y mejorar la experiencia de navegación durante
              las pruebas del proyecto.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              10. Derechos del Usuario
            </h2>
            <p className="text-muted-foreground">
              Dado que este es un proyecto académico de prueba, no se garantizan
              derechos formales de acceso, rectificación o eliminación de datos
              bajo normativas como GDPR o similares. Sin embargo, puede
              solicitar la eliminación de sus datos de prueba contactando a los
              desarrolladores.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">11. Menores de Edad</h2>
            <p className="text-muted-foreground">
              Este proyecto no está dirigido a menores de 18 años. No se
              recopila intencionalmente información de menores.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              12. Cambios a esta Política
            </h2>
            <p className="text-muted-foreground">
              Esta política puede ser modificada en cualquier momento durante el
              desarrollo del proyecto sin previo aviso.
            </p>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground font-semibold">
              Al utilizar TuKancha, usted acepta esta política de privacidad y
              reconoce que se trata de un proyecto académico sin las garantías
              de seguridad de una aplicación en producción.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
