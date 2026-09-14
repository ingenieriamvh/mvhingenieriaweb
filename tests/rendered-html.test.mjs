import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

async function renderRoot() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
      redirect: "manual",
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("la raíz dirige a la portada estática controlada", async () => {
  const response = await renderRoot();
  assert.ok([307, 308].includes(response.status));
  assert.equal(
    new URL(response.headers.get("location"), "http://localhost").pathname,
    "/index.html",
  );
});

test("la portada mantiene marca, límites y navegación comercial", async () => {
  const html = await readFile(
    new URL("../public/index.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /Ingeniería MVH/);
  assert.match(html, /Ingeniería para hacer visible lo que importa/);
  assert.match(html, /content="noindex, nofollow"/);
  assert.match(html, /href="\.\/soluciones\.html"/);
  assert.match(html, /href="\.\/orientacion\.html"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("el paquete público contiene las dieciséis páginas controladas", async () => {
  const files = await readdir(new URL("../public/", import.meta.url));
  const htmlFiles = files.filter((file) => file.endsWith(".html")).sort();
  assert.equal(htmlFiles.length, 16);
  assert.deepEqual(htmlFiles, [
    "acceso-mvh-digital.html",
    "agroproductiva.html",
    "ciencia.html",
    "conocimiento.html",
    "contacto.html",
    "diseno-verificacion.html",
    "emergencia.html",
    "index.html",
    "laboral.html",
    "laboratorio-luz.html",
    "metodo.html",
    "nosotros.html",
    "orientacion.html",
    "sectores.html",
    "soluciones.html",
    "territorial.html",
  ]);
});

test("el Laboratorio MVH diferencia datos actualizados, fuentes y luminarias", async () => {
  const [html, script, design, science] = await Promise.all([
    readFile(new URL("../public/laboratorio-luz.html", import.meta.url), "utf8"),
    readFile(new URL("../public/laboratorio-luz.js", import.meta.url), "utf8"),
    readFile(new URL("../public/diseno-verificacion.html", import.meta.url), "utf8"),
    readFile(new URL("../public/ciencia.html", import.meta.url), "utf8"),
  ]);

  assert.match(html, /Observatorio lumínico y ambiental/);
  assert.match(html, /Brillo solar estimado/);
  assert.match(html, /No son mediciones realizadas por MVH/);
  assert.match(html, /Fuentes de luz/);
  assert.match(html, /La luminaria controla, protege y distribuye la luz/);
  assert.equal([...html.matchAll(/data-lab-tab=/g)].length, 3);
  assert.equal([...html.matchAll(/data-weather-value=/g)].length, 8);
  assert.match(script, /api\.open-meteo\.com/);
  assert.match(script, /15 \* 60 \* 1000/);
  assert.doesNotMatch(script, /localStorage/);
  assert.match(design, /Capacidades de diseño/);
  assert.equal([...design.matchAll(/class="design-scope-grid"/g)].length, 1);
  assert.match(design, /componentes eléctricos, estructurales, civiles o sectoriales/);
  assert.match(science, /Abrir laboratorio|Ver ambiente actualizado/);
});

test("MVH Digital permanece desactivado y el candidato no es público", async () => {
  const [config, status, robots] = await Promise.all([
    readFile(new URL("../public/mvh-site-settings.js", import.meta.url), "utf8"),
    readFile(new URL("../public/RELEASE_STATUS.json", import.meta.url), "utf8"),
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  ]);
  assert.match(config, /digitalUrl:\s*null/);
  assert.equal(JSON.parse(status).public, false);
  assert.match(robots, /Disallow:\s*\//);
});

test("el banco visual aprobado se distribuye completo, optimizado y sin repeticiones", async () => {
  const publicUrl = new URL("../public/", import.meta.url);
  const htmlFiles = (await readdir(publicUrl)).filter((file) =>
    file.endsWith(".html"),
  );
  const [styles, manifest, ...pages] = await Promise.all([
    readFile(new URL("styles.css", publicUrl), "utf8"),
    readFile(new URL("assets/visuals/manifest.json", publicUrl), "utf8").then(
      JSON.parse,
    ),
    ...htmlFiles.map((file) => readFile(new URL(file, publicUrl), "utf8")),
  ]);
  const source = [styles, ...pages].join("\n");
  const uses = [
    ...source.matchAll(/assets\/visuals\/([a-z0-9_]+\.webp)/g),
  ].map((match) => match[1]);
  const usageByFile = new Map(
    uses.map((file) => [file, uses.filter((value) => value === file).length]),
  );

  assert.equal(manifest.length, 17);
  assert.equal(new Set(uses).size, 17);

  for (const asset of manifest) {
    assert.equal(
      usageByFile.get(asset.file),
      1,
      `${asset.file} debe aparecer exactamente una vez en la experiencia pública`,
    );
    const assetStat = await stat(new URL(`assets/visuals/${asset.file}`, publicUrl));
    assert.ok(assetStat.size > 0);
    assert.ok(
      assetStat.size < 200_000,
      `${asset.file} debe conservar un peso apto para navegación móvil`,
    );
  }
});

test("cada línea de servicio conserva su contexto al solicitar orientación", async () => {
  const serviceRoutes = {
    "laboral.html": "laboral",
    "territorial.html": "publica-territorial",
    "agroproductiva.html": "agroproductiva-rural",
    "emergencia.html": "emergencia",
    "diseno-verificacion.html": "diseno-verificacion",
  };

  for (const [file, line] of Object.entries(serviceRoutes)) {
    const html = await readFile(
      new URL(`../public/${file}`, import.meta.url),
      "utf8",
    );
    const contextualLinks = [
      ...html.matchAll(
        new RegExp(
          `href="\\.\\/orientacion\\.html\\?linea=${line}"`,
          "g",
        ),
      ),
    ];
    assert.equal(
      contextualLinks.length,
      3,
      `${file} debe conservar la línea en cabecera, hero y cierre`,
    );
  }
});

test("la solicitud prioriza el contacto voluntario y descarta líneas desconocidas", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("../public/orientacion.html", import.meta.url), "utf8"),
    readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  ]);

  assert.match(html, /data-requested-line-banner/);
  assert.match(
    html,
    /class="button button-primary" href="#" data-form-whatsapp/,
  );
  assert.match(html, />\s*Continuar por WhatsApp\s*</);
  assert.match(html, />\s*Probar sin enviar\s*</);
  assert.match(app, /const requestedLine = lineLabels\[requestedLineCode\] \?\? ""/);
  assert.match(app, /contactContextByPage/);
  assert.match(app, /no almacenó ni transmitió la información/);
});

test("el centro de conocimiento ofrece rutas útiles con control editorial", async () => {
  const [html, app, home] = await Promise.all([
    readFile(new URL("../public/conocimiento.html", import.meta.url), "utf8"),
    readFile(new URL("../public/app.js", import.meta.url), "utf8"),
    readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  ]);

  assert.match(html, /Centro de conocimiento MVH/);
  assert.equal(
    [...html.matchAll(/data-knowledge-card="/g)].length,
    8,
  );
  for (const category of [
    "normativa",
    "consultas",
    "curiosidades",
    "aprendizaje",
  ]) {
    assert.match(
      html,
      new RegExp(`data-knowledge-filter="${category}"`),
    );
    assert.match(
      html,
      new RegExp(`data-knowledge-card="${category}"`),
    );
  }
  assert.match(html, /No constituye diseño,/);
  assert.match(html, /RETILAP vigente en Colombia/);
  assert.match(html, /Resolución 40286 del/);
  assert.match(html, /https:\/\/www\.minenergia\.gov\.co\/es\/misional\//);
  assert.match(html, /Fuente consultada · 31\/07\/2026/);
  assert.equal(
    [...html.matchAll(/data-standard-entry/g)].length,
    10,
  );
  assert.match(html, /ISO\/CIE 8995-1:2025/);
  assert.match(html, /ISO 30061:2007/);
  assert.match(html, /GTC 45/);
  assert.match(html, /Una referencia internacional no se presenta como obligación/);
  assert.match(app, /configureKnowledgeLibrary/);
  assert.match(html, /Laboratorio de luz/);
  assert.equal(
    [...html.matchAll(/data-learning-game="/g)].length,
    3,
  );
  for (const game of ["detective", "mitos", "fuentes"]) {
    assert.match(html, new RegExp(`data-learning-game="${game}"`));
  }
  assert.match(html, /data-game-options/);
  assert.match(html, /Resultado educativo\. No constituye diagnóstico/);
  assert.match(app, /configureLearningGames/);
  assert.match(app, /Un luxómetro convencional no caracteriza/);
  assert.doesNotMatch(app, /localStorage/);
  assert.match(home, /Información útil para comprender y decidir/);
});
