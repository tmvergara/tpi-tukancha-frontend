import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function TermsPage() {
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
          <CardTitle className="text-3xl">Términos y Condiciones</CardTitle>
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
              &quot;Desarrollo de Aplicaciones con Objetos&quot; con fines
              exclusivamente educativos y de evaluación universitaria.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              2. Uso de la Plataforma
            </h2>
            <p className="text-muted-foreground mb-2">
              Al utilizar esta plataforma, usted reconoce y acepta que:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                Este es un proyecto universitario sin fines comerciales ni de
                producción
              </li>
              <li>
                La plataforma puede contener errores, bugs o funcionalidades
                incompletas
              </li>
              <li>
                No hay garantías de disponibilidad, seguridad o continuidad del
                servicio
              </li>
              <li>
                El proyecto puede ser modificado, suspendido o finalizado en
                cualquier momento sin previo aviso
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              3. Limitación de Responsabilidad
            </h2>
            <p className="text-muted-foreground mb-2">
              Los desarrolladores y la institución educativa NO se
              responsabilizan por:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                Pérdida de datos, información o contenido almacenado en la
                plataforma
              </li>
              <li>
                Daños directos, indirectos, incidentales o consecuentes
                derivados del uso o la imposibilidad de uso de la plataforma
              </li>
              <li>
                Errores en transacciones, reservas o cualquier funcionalidad de
                la plataforma
              </li>
              <li>
                Problemas de seguridad, privacidad o acceso no autorizado a la
                información
              </li>
              <li>
                Cualquier decisión tomada en base a la información proporcionada
                por la plataforma
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">4. Datos de Prueba</h2>
            <p className="text-muted-foreground">
              Se recomienda encarecidamente NO utilizar datos reales, sensibles
              o confidenciales en esta plataforma. Utilice únicamente datos de
              prueba o ficticios para evaluar las funcionalidades.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              5. Propiedad Intelectual
            </h2>
            <p className="text-muted-foreground">
              Este proyecto es propiedad de los estudiantes desarrolladores y se
              encuentra protegido por derechos de autor exclusivamente con fines
              académicos.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              6. Uso &quot;Tal Cual&quot;
            </h2>
            <p className="text-muted-foreground">
              La plataforma se proporciona &quot;TAL CUAL&quot; y &quot;SEGÚN
              DISPONIBILIDAD&quot;, sin garantías de ningún tipo, expresas o
              implícitas, incluyendo pero no limitándose a garantías de
              comerciabilidad, idoneidad para un propósito particular o no
              infracción.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">7. Contacto</h2>
            <p className="text-muted-foreground">
              Este es un proyecto académico. Para consultas relacionadas con el
              curso, por favor contacte a través de los canales oficiales de la
              institución educativa.
            </p>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground font-semibold">
              Al continuar utilizando TuKancha, usted acepta estos términos y
              condiciones en su totalidad.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
