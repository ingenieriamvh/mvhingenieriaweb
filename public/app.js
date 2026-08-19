(function startMvhPublicPrototype() {
  "use strict";

  const config = window.MVH_CONFIG ?? {};
  const logic = window.MVHLogic;
  const catalogs = window.MVH_CATALOGS ?? { departments: [], ciiuCatalog: {} };
  let toastTimer;

  function showToast(message) {
    const toast = document.querySelector("[data-toast]");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4200);
  }

  function configureContactChannels() {
    const pageName = window.location.pathname.split("/").pop() || "index.html";
    const contactContextByPage = {
      "laboral.html": "iluminación laboral",
      "territorial.html": "alumbrado público y territorial",
      "agroproductiva.html": "iluminación agroproductiva y rural",
      "emergencia.html": "iluminación de emergencia",
      "diseno-verificacion.html": "diseño, revisión y verificación",
      "conocimiento.html": "una consulta técnica o contenido sobre iluminación",
      "laboratorio-luz.html": "datos ambientales, fuentes de luz o luminarias",
    };
    const contactContext = contactContextByPage[pageName] ?? "";
    const genericMessage = contactContext
      ? `Hola, quiero solicitar orientación de Ingeniería MVH sobre ${contactContext}.`
      : "Hola, quiero solicitar orientación sobre un servicio de iluminación con Ingeniería MVH.";
    const whatsappHref = logic.whatsappUrl(
      config.whatsappNumber,
      genericMessage,
    );

    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      if (whatsappHref) {
        link.href = whatsappHref;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute(
          "aria-label",
          `Contactar a Ingeniería MVH por WhatsApp al ${config.whatsappDisplay}`,
        );
      } else {
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("El canal de WhatsApp está pendiente de configuración.");
        });
      }
    });

    document.querySelectorAll("[data-whatsapp-display]").forEach((node) => {
      node.textContent = config.whatsappDisplay ?? "Canal por confirmar";
    });

    document.querySelectorAll("[data-email-link]").forEach((link) => {
      if (config.email) {
        const subject = encodeURIComponent(
          contactContext
            ? `Solicitud de orientación — ${contactContext} — Ingeniería MVH`
            : "Solicitud de orientación — Ingeniería MVH",
        );
        link.href = `mailto:${config.email}?subject=${subject}`;
        link.setAttribute(
          "aria-label",
          `Escribir a Ingeniería MVH al correo ${config.email}`,
        );
      } else {
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("El correo está pendiente de configuración.");
        });
      }
    });

    document.querySelectorAll("[data-email-display]").forEach((node) => {
      node.textContent = config.email ?? "Correo por confirmar";
    });

    document.querySelectorAll("[data-digital-link]").forEach((control) => {
      if (config.digitalUrl) {
        control.addEventListener("click", () => {
          window.location.assign(config.digitalUrl);
        });
        return;
      }
      control.setAttribute("aria-disabled", "true");
      control.title = "Enlace oficial pendiente de configuración";
      control.addEventListener("click", () => {
        showToast(
          "El acceso público a MVH Digital permanece desactivado hasta definir su URL oficial.",
        );
      });
    });
  }

  function configureMobileNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("#main-navigation");
    if (!toggle || !navigation) return;

    const setOpen = (open) => {
      navigation.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function configureScienceExplorer() {
    const tabs = Array.from(document.querySelectorAll("[data-science]"));
    const label = document.querySelector("[data-science-label]");
    const question = document.querySelector("[data-science-question]");
    const body = document.querySelector("[data-science-body]");
    if (!tabs.length || !label || !question || !body) return;

    const selectTab = (tab, moveFocus = false) => {
      const content = logic.science[tab.dataset.science];
      if (!content) return;

      tabs.forEach((candidate) => {
        const selected = candidate === tab;
        candidate.setAttribute("aria-selected", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      });
      label.textContent = content.label;
      question.textContent = content.question;
      body.textContent = content.body;
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (event) => {
        let targetIndex = index;
        if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") targetIndex = 0;
        else if (event.key === "End") targetIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        selectTab(tabs[targetIndex], true);
      });
    });

    selectTab(
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ??
        tabs[0],
    );
  }

  function configureKnowledgeLibrary() {
    const filters = Array.from(
      document.querySelectorAll("[data-knowledge-filter]"),
    );
    const cards = Array.from(
      document.querySelectorAll("[data-knowledge-card]"),
    );
    const shortcuts = Array.from(
      document.querySelectorAll("[data-knowledge-shortcut]"),
    );
    const status = document.querySelector("[data-knowledge-status]");
    if (!filters.length || !cards.length) return;

    const categoryLabels = {
      all: "todos los contenidos",
      normativa: "normativa y criterios",
      consultas: "consultas resueltas",
      curiosidades: "curiosidades de la luz",
      aprendizaje: "aprendizaje práctico",
    };

    const selectFilter = (category, moveFocus = false) => {
      const selected =
        filters.find(
          (filter) => filter.dataset.knowledgeFilter === category,
        ) ?? filters[0];
      const activeCategory = selected.dataset.knowledgeFilter;
      let visible = 0;

      filters.forEach((filter) => {
        const active = filter === selected;
        filter.setAttribute("aria-pressed", String(active));
      });

      cards.forEach((card) => {
        const matches =
          activeCategory === "all" ||
          card.dataset.knowledgeCard === activeCategory;
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      if (status) {
        status.textContent = `Mostrando ${visible} ${
          visible === 1 ? "contenido" : "contenidos"
        } de ${categoryLabels[activeCategory]}.`;
      }
      if (moveFocus) selected.focus();
    };

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        selectFilter(filter.dataset.knowledgeFilter);
      });
    });

    shortcuts.forEach((shortcut) => {
      shortcut.addEventListener("click", () => {
        selectFilter(shortcut.dataset.knowledgeShortcut);
      });
    });

    selectFilter("all");
  }

  function configureLearningGames() {
    const selectors = Array.from(
      document.querySelectorAll("[data-learning-game]"),
    );
    const stage = document.querySelector("[data-game-stage]");
    if (!selectors.length || !stage) return;

    const gameTitle = stage.querySelector("[data-game-title]");
    const gameDescription = stage.querySelector("[data-game-description]");
    const gameKicker = stage.querySelector("[data-game-kicker]");
    const scoreLabel = stage.querySelector("[data-game-score]");
    const progressText = stage.querySelector("[data-game-progress-text]");
    const progressBar = stage.querySelector("[data-game-progressbar]");
    const progressFill = stage.querySelector("[data-game-progress-fill]");
    const questionWrap = stage.querySelector("[data-game-question-wrap]");
    const question = stage.querySelector("[data-game-question]");
    const options = stage.querySelector("[data-game-options]");
    const feedback = stage.querySelector("[data-game-feedback]");
    const next = stage.querySelector("[data-game-next]");
    const reset = stage.querySelector("[data-game-reset]");

    const games = {
      detective: {
        kicker: "Reconocimiento visual",
        title: "Detective de la luz",
        description:
          "Lea la situación e identifique la condición que conviene investigar.",
        questions: [
          {
            prompt:
              "Una persona gira la pantalla para poder leer porque una ventana brillante se refleja sobre ella.",
            options: [
              "Deslumbramiento o reflejos",
              "Falta de mantenimiento documental",
              "Temperatura del ambiente",
            ],
            answer: 0,
            explanation:
              "El reflejo visible puede reducir el contraste y generar molestia. Conviene revisar posición, luminancias, orientación y control de la luz natural.",
          },
          {
            prompt:
              "En un pasillo se alternan zonas muy claras y muy oscuras, aunque el promedio de iluminancia parece suficiente.",
            options: [
              "Distribución y uniformidad",
              "Reproducción cromática",
              "Autonomía de emergencia",
            ],
            answer: 0,
            explanation:
              "Un promedio no muestra por sí solo cómo se distribuye la luz. Las transiciones marcadas pueden afectar visibilidad, adaptación y seguridad.",
          },
          {
            prompt:
              "Una pieza giratoria parece detenerse o cambiar de velocidad bajo determinada iluminación.",
            options: [
              "Parpadeo o efecto estroboscópico",
              "Exceso de luz natural",
              "Color de las paredes",
            ],
            answer: 0,
            explanation:
              "La apariencia engañosa del movimiento puede estar asociada al parpadeo. Un luxómetro convencional no caracteriza por sí solo este fenómeno.",
          },
          {
            prompt:
              "En una tarea de selección por color hay suficiente luz aparente, pero cuesta diferenciar tonos muy próximos.",
            options: [
              "Calidad espectral y reproducción del color",
              "Cantidad de puntos de la malla",
              "Altura de la persona",
            ],
            answer: 0,
            explanation:
              "La cantidad de luz no explica toda la percepción del color. Deben revisarse la fuente, la tarea, los materiales y los criterios de calidad pertinentes.",
          },
        ],
      },
      mitos: {
        kicker: "Pensamiento crítico",
        title: "Mito o criterio",
        description:
          "Decida si la afirmación es técnicamente razonable y descubra por qué.",
        questions: [
          {
            prompt: "Más lux siempre significa mejor iluminación.",
            options: ["Mito", "Criterio técnico"],
            answer: 0,
            explanation:
              "La iluminancia es importante, pero también cuentan la tarea, la uniformidad, el deslumbramiento, las sombras, el color y la operación real.",
          },
          {
            prompt:
              "El plano de medición debe corresponder a la superficie y a la tarea visual evaluada.",
            options: ["Mito", "Criterio técnico"],
            answer: 1,
            explanation:
              "La posición de medición debe representar dónde se realiza la tarea. Medir en una superficie distinta puede conducir a una interpretación equivocada.",
          },
          {
            prompt:
              "Un luxómetro convencional permite medir directamente UGR, reproducción cromática y parpadeo.",
            options: ["Mito", "Criterio técnico"],
            answer: 0,
            explanation:
              "Un luxómetro mide iluminancia dentro de su alcance. Otros fenómenos requieren métodos, datos o instrumentos específicos.",
          },
          {
            prompt:
              "Una luminaria de emergencia instalada todavía requiere verificación funcional y, cuando corresponda, de duración e iluminancia.",
            options: ["Mito", "Criterio técnico"],
            answer: 1,
            explanation:
              "La presencia física no demuestra desempeño. La verificación debe responder al sistema, al escenario y al alcance autorizado.",
          },
        ],
      },
      fuentes: {
        kicker: "Jerarquía y aplicación",
        title: "Ubique la referencia",
        description:
          "Seleccione la función general de cada documento antes de aplicarlo a un caso.",
        questions: [
          {
            prompt: "RETILAP vigente en Colombia",
            options: [
              "Reglamento técnico colombiano",
              "Guía de identificación de peligros",
              "Referencia internacional complementaria",
            ],
            answer: 0,
            explanation:
              "Es un reglamento técnico colombiano. Su aplicación concreta depende del objeto, el alcance, la versión vigente y las condiciones del proyecto.",
          },
          {
            prompt: "GTC 45",
            options: [
              "Reglamento de producto",
              "Guía técnica para peligros y valoración de riesgos",
              "Certificación automática del SG-SST",
            ],
            answer: 1,
            explanation:
              "Es una guía técnica que puede apoyar la identificación de peligros y la valoración de riesgos; no reemplaza el juicio profesional ni crea una certificación automática.",
          },
          {
            prompt: "Decreto 1072 de 2015 en materia de SG-SST",
            options: [
              "Marco normativo colombiano",
              "Manual de un fabricante",
              "Recomendación comercial",
            ],
            answer: 0,
            explanation:
              "Integra el marco regulatorio del SG-SST en Colombia. La relación con iluminación debe justificarse dentro de la gestión del peligro y el alcance del servicio.",
          },
          {
            prompt: "ISO/CIE 8995-1",
            options: [
              "Obligación colombiana automática",
              "Referencia técnica internacional complementaria o contractual",
              "Licencia profesional",
            ],
            answer: 1,
            explanation:
              "Es una referencia técnica internacional. No se convierte automáticamente en obligación colombiana: su pertinencia, incorporación o condición contractual debe verificarse.",
          },
        ],
      },
    };

    let activeGame = "detective";
    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    const renderQuestion = () => {
      const game = games[activeGame];
      const item = game.questions[currentQuestion];
      answered = false;
      gameKicker.textContent = game.kicker;
      gameTitle.textContent = game.title;
      gameDescription.textContent = game.description;
      scoreLabel.textContent = `Puntaje: ${score}`;
      progressText.textContent = `Situación ${currentQuestion + 1} de ${game.questions.length}`;
      progressBar.setAttribute("aria-valuemax", String(game.questions.length));
      progressBar.setAttribute("aria-valuenow", String(currentQuestion + 1));
      progressFill.style.width = `${((currentQuestion + 1) / game.questions.length) * 100}%`;
      question.textContent = item.prompt;
      questionWrap.hidden = false;
      feedback.hidden = true;
      feedback.className = "game-feedback";
      feedback.replaceChildren();
      next.hidden = true;
      next.textContent = "Siguiente reto";
      options.replaceChildren();

      item.options.forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "game-option";
        button.textContent = option;
        button.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const correct = optionIndex === item.answer;
          if (correct) score += 1;
          scoreLabel.textContent = `Puntaje: ${score}`;

          Array.from(options.children).forEach((candidate, index) => {
            candidate.disabled = true;
            if (index === item.answer) candidate.dataset.answer = "correct";
            else if (candidate === button) candidate.dataset.answer = "incorrect";
          });

          const result = document.createElement("strong");
          result.textContent = correct
            ? "Bien observado."
            : "Vale la pena revisar el criterio.";
          const explanation = document.createElement("p");
          explanation.textContent = item.explanation;
          feedback.append(result, explanation);
          feedback.dataset.result = correct ? "correct" : "review";
          feedback.hidden = false;
          feedback.focus();
          next.textContent =
            currentQuestion === game.questions.length - 1
              ? "Ver resultado"
              : "Siguiente reto";
          next.hidden = false;
        });
        options.append(button);
      });
    };

    const renderResult = () => {
      const game = games[activeGame];
      const total = game.questions.length;
      const resultTitle = document.createElement("strong");
      const resultBody = document.createElement("p");
      resultTitle.textContent = `Resultado: ${score} de ${total}`;
      resultBody.textContent =
        score === total
          ? "Excelente lectura inicial. En un proyecto real, el siguiente paso es validar la observación con información, medición y criterio profesional."
          : score >= Math.ceil(total / 2)
            ? "Buen comienzo. Revise las explicaciones y vuelva a intentarlo para afinar el criterio."
            : "Cada situación tiene más de una capa. Repita el reto y observe cómo cambian las decisiones cuando se considera la tarea y el contexto.";
      questionWrap.hidden = true;
      progressText.textContent = "Reto completado";
      progressBar.setAttribute("aria-valuenow", String(total));
      progressFill.style.width = "100%";
      feedback.replaceChildren(resultTitle, resultBody);
      feedback.dataset.result = "complete";
      feedback.hidden = false;
      feedback.focus();
      next.textContent = "Jugar de nuevo";
      next.hidden = false;
    };

    const startGame = (gameCode, moveFocus = false) => {
      activeGame = games[gameCode] ? gameCode : "detective";
      currentQuestion = 0;
      score = 0;
      selectors.forEach((selector) => {
        selector.setAttribute(
          "aria-pressed",
          String(selector.dataset.learningGame === activeGame),
        );
      });
      renderQuestion();
      if (moveFocus) gameTitle.focus?.();
    };

    selectors.forEach((selector) => {
      selector.addEventListener("click", () => {
        startGame(selector.dataset.learningGame);
      });
    });

    next.addEventListener("click", () => {
      const total = games[activeGame].questions.length;
      if (!answered && currentQuestion < total) return;
      if (currentQuestion === total - 1 && answered) {
        renderResult();
        answered = false;
        currentQuestion = total;
        return;
      }
      if (currentQuestion >= total) {
        startGame(activeGame);
        return;
      }
      currentQuestion += 1;
      renderQuestion();
    });

    reset.addEventListener("click", () => startGame(activeGame));
    startGame(activeGame);
  }

  function configureOrientationForm() {
    const form = document.querySelector("#orientation-form");
    if (!form) return;

    const steps = Array.from(form.querySelectorAll("[data-form-step]"));
    const progress = Array.from(document.querySelectorAll("[data-progress-step]"));
    const message = form.querySelector("[data-form-message]");
    const review = form.querySelector("[data-review]");
    const whatsapp = form.querySelector("[data-form-whatsapp]");
    const prototypeResult = form.querySelector("[data-prototype-result]");
    const department = form.querySelector("[data-department]");
    const municipality = form.querySelector("[data-municipality]");
    const municipalityList = form.querySelector("[data-municipality-list]");
    const municipalityCode = form.querySelector("[data-municipality-code]");
    const municipalityStatus = form.querySelector(
      "[data-municipality-status]",
    );
    const ciiu = form.querySelector("[data-ciiu]");
    const ciiuStatus = form.querySelector("[data-ciiu-status]");
    const economicActivity = form.querySelector("[data-economic-activity]");
    const situation = form.querySelector("[data-situation]");
    const characterCount = form.querySelector("[data-character-count]");
    const requestedLineBanner = document.querySelector(
      "[data-requested-line-banner]",
    );
    const query = new URLSearchParams(window.location.search);
    const requestedLineCode = query.get("linea");
    const lineLabels = {
      laboral: "Iluminación laboral",
      "publica-territorial": "Alumbrado público y territorial",
      "agroproductiva-rural": "Iluminación agroproductiva y rural",
      emergencia: "Iluminación de emergencia",
      "diseno-verificacion": "Diseño, revisión y verificación",
    };
    const requestedLine = lineLabels[requestedLineCode] ?? "";
    let currentStep = 1;
    let currentMunicipalities = [];

    const clearMessage = () => {
      message.hidden = true;
      message.textContent = "";
    };

    const showMessage = (errors) => {
      message.textContent = errors.join(" ");
      message.hidden = false;
      message.tabIndex = -1;
      message.focus();
    };

    const collectValues = () => {
      const data = new FormData(form);
      return {
        need: String(data.get("need") ?? ""),
        organizationType: String(data.get("organizationType") ?? ""),
        departmentCode: String(data.get("departmentCode") ?? ""),
        department:
          department.options[department.selectedIndex]?.textContent ?? "",
        municipality: String(data.get("municipality") ?? ""),
        municipalityCode: String(data.get("municipalityCode") ?? ""),
        ciiu: String(data.get("ciiu") ?? ""),
        economicActivity: String(data.get("economicActivity") ?? ""),
        environment: String(data.get("environment") ?? ""),
        operation: String(data.get("operation") ?? ""),
        situation: String(data.get("situation") ?? "").trim(),
        conditions: data.getAll("conditions").map(String),
        name: String(data.get("name") ?? "").trim(),
        organization: String(data.get("organization") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        preferredChannel: String(data.get("preferredChannel") ?? ""),
        privacyConsent: data.has("privacyConsent"),
        marketingConsent: data.has("marketingConsent"),
        requestedLine,
      };
    };

    const showStep = (stepNumber) => {
      currentStep = Math.min(Math.max(stepNumber, 1), steps.length);
      steps.forEach((step) => {
        const active = Number(step.dataset.formStep) === currentStep;
        step.hidden = !active;
        step.classList.toggle("active", active);
      });
      progress.forEach((item) => {
        const number = Number(item.dataset.progressStep);
        item.classList.toggle("active", number === currentStep);
        item.classList.toggle("complete", number < currentStep);
        if (number === currentStep) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      clearMessage();
      prototypeResult.hidden = true;
      document
        .querySelector(".orientation-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      steps
        .find((step) => Number(step.dataset.formStep) === currentStep)
        ?.querySelector("h2")
        ?.setAttribute("tabindex", "-1");
    };

    const populateDepartments = () => {
      catalogs.departments.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.code;
        option.textContent = item.name;
        department.append(option);
      });
    };

    const populateMunicipalities = () => {
      const selectedDepartment = catalogs.departments.find(
        (item) => item.code === department.value,
      );
      currentMunicipalities = selectedDepartment?.municipalities ?? [];
      municipalityList.replaceChildren();
      currentMunicipalities.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.dataset.code = item.code;
        municipalityList.append(option);
      });
      municipality.value = "";
      municipalityCode.value = "";
      municipality.disabled = currentMunicipalities.length === 0;
      municipality.placeholder = currentMunicipalities.length
        ? "Escriba o seleccione de la lista"
        : "Seleccione primero el departamento";
      municipalityStatus.textContent = currentMunicipalities.length
        ? `${currentMunicipalities.length} opciones oficiales disponibles.`
        : "0 opciones disponibles.";
      municipality.classList.remove("field-valid", "field-invalid");
    };

    const validateMunicipality = () => {
      const found = logic.findMunicipality(
        department.value,
        municipality.value,
        catalogs.departments,
      );
      municipalityCode.value = found?.code ?? "";
      municipality.classList.toggle("field-valid", Boolean(found));
      municipality.classList.toggle(
        "field-invalid",
        Boolean(municipality.value) && !found,
      );
      if (found) {
        municipality.value = found.name;
        municipalityStatus.textContent = `${found.name} · DIVIPOLA ${found.code}`;
      } else if (municipality.value) {
        municipalityStatus.textContent =
          "Seleccione una coincidencia válida de la lista.";
      } else {
        municipalityStatus.textContent = currentMunicipalities.length
          ? `${currentMunicipalities.length} opciones oficiales disponibles.`
          : "0 opciones disponibles.";
      }
      return Boolean(found);
    };

    const validateCiiu = () => {
      ciiu.value = logic.normalizeDigits(ciiu.value, 4);
      const found = logic.lookupCiiu(ciiu.value, catalogs.ciiuCatalog);
      economicActivity.value = found?.description ?? "";
      ciiu.classList.toggle("field-valid", Boolean(found));
      ciiu.classList.toggle(
        "field-invalid",
        ciiu.value.length === 4 && !found,
      );
      if (!ciiu.value) {
        ciiuStatus.textContent =
          "Dato opcional. Se valida con catálogo DANE.";
      } else if (found) {
        ciiuStatus.textContent = `Actividad identificada para CIIU ${found.code}. Verifique que coincida con el RUT.`;
      } else if (ciiu.value.length < 4) {
        ciiuStatus.textContent = "Ingrese los cuatro dígitos del código CIIU.";
      } else {
        ciiuStatus.textContent =
          "Código no encontrado en el catálogo CIIU cargado.";
      }
    };

    const appendReviewItem = (term, description) => {
      const group = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = description || "No informado";
      group.append(dt, dd);
      review.append(group);
    };

    const buildReview = (values) => {
      review.replaceChildren();
      appendReviewItem("Necesidad", values.need);
      appendReviewItem("Tipo de organización", values.organizationType);
      appendReviewItem(
        "Ubicación",
        `${values.municipality}, ${values.department}`,
      );
      appendReviewItem(
        "Actividad económica",
        values.ciiu
          ? `${values.ciiu} · ${values.economicActivity || "Por verificar"}`
          : "No informada",
      );
      appendReviewItem(
        "Condición de operación",
        `${values.environment} · ${values.operation}`,
      );
      appendReviewItem("Situación", values.situation);
      appendReviewItem(
        "Condiciones relacionadas",
        values.conditions.join("; ") || "No informadas",
      );
      appendReviewItem(
        "Contacto",
        [
          values.name,
          values.organization,
          values.email,
          values.phone,
          `Preferencia: ${values.preferredChannel}`,
        ]
          .filter(Boolean)
          .join(" · "),
      );
      if (values.requestedLine) {
        appendReviewItem("Línea consultada", values.requestedLine);
      }

      const compactSituation =
        values.situation.length > 320
          ? `${values.situation.slice(0, 317)}…`
          : values.situation;
      const whatsappMessage = [
        "Hola, quiero solicitar orientación de Ingeniería MVH.",
        `Necesidad: ${values.need}.`,
        values.requestedLine
          ? `Línea consultada: ${values.requestedLine}.`
          : "",
        values.organization
          ? `Organización: ${values.organization}.`
          : `Tipo de organización: ${values.organizationType}.`,
        `Ubicación: ${values.municipality}, ${values.department}.`,
        values.ciiu
          ? `CIIU informado: ${values.ciiu} — ${values.economicActivity || "por verificar"}.`
          : "",
        `Situación: ${compactSituation}`,
        `Contacto: ${values.name}${values.email ? ` · ${values.email}` : ""}${
          values.phone ? ` · ${values.phone}` : ""
        }.`,
      ]
        .filter(Boolean)
        .join("\n");

      const href = logic.whatsappUrl(
        config.whatsappNumber,
        whatsappMessage,
      );
      if (href) {
        whatsapp.href = href;
        whatsapp.target = "_blank";
        whatsapp.rel = "noopener noreferrer";
        whatsapp.removeAttribute("aria-disabled");
      } else {
        whatsapp.href = "#";
        whatsapp.setAttribute("aria-disabled", "true");
      }
    };

    const validateCurrentStep = () => {
      if (currentStep === 2) validateMunicipality();
      const values = collectValues();
      const errors = logic.validateStep(currentStep, values);

      if (currentStep === 4) {
        const email = form.elements.email;
        if (values.email && !email.validity.valid) {
          errors.push("Revise el formato del correo electrónico.");
        }
        if (values.phone && logic.normalizeDigits(values.phone, 15).length < 7) {
          errors.push("Revise el número de teléfono o WhatsApp.");
        }
      }

      if (errors.length) {
        showMessage(errors);
        return null;
      }
      return values;
    };

    const applyQueryContext = () => {
      const context = query.get("contexto");
      const needByContext = {
        trabajo: "Conocer las condiciones actuales",
        territorio: "Diseñar o revisar un proyecto",
        produccion: "Preparar una inversión",
        proyecto: "Diseñar o revisar un proyecto",
        "no-se": "No estoy seguro",
      };
      const needByLine = {
        laboral: "Conocer las condiciones actuales",
        "publica-territorial": "Diseñar o revisar un proyecto",
        "agroproductiva-rural": "Preparar una inversión",
        emergencia: "Resolver un problema",
        "diseno-verificacion": "Diseñar o revisar un proyecto",
      };
      const value =
        needByContext[context] ?? needByLine[requestedLineCode] ?? "";
      if (!value) return;
      const input = Array.from(form.elements.need).find(
        (candidate) => candidate.value === value,
      );
      if (input) input.checked = true;
    };

    populateDepartments();
    applyQueryContext();
    populateMunicipalities();
    if (requestedLine && requestedLineBanner) {
      requestedLineBanner.textContent = `Línea consultada: ${requestedLine}`;
      requestedLineBanner.hidden = false;
    }

    department.addEventListener("change", populateMunicipalities);
    municipality.addEventListener("input", validateMunicipality);
    municipality.addEventListener("change", validateMunicipality);
    municipality.addEventListener("blur", validateMunicipality);
    ciiu.addEventListener("input", validateCiiu);
    ciiu.addEventListener("blur", validateCiiu);
    situation.addEventListener("input", () => {
      characterCount.textContent = String(situation.value.length);
    });

    const conditionInputs = Array.from(
      form.querySelectorAll('input[name="conditions"]'),
    );
    const notApplicable = conditionInputs.find(
      (input) => input.value === "No aplica por ahora",
    );
    conditionInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input === notApplicable && input.checked) {
          conditionInputs
            .filter((candidate) => candidate !== notApplicable)
            .forEach((candidate) => {
              candidate.checked = false;
            });
        } else if (input.checked && notApplicable) {
          notApplicable.checked = false;
        }
      });
    });

    form.querySelectorAll("[data-next]").forEach((button) => {
      button.addEventListener("click", () => {
        const values = validateCurrentStep();
        if (!values) return;
        if (currentStep === 4) buildReview(values);
        showStep(currentStep + 1);
      });
    });

    form.querySelectorAll("[data-back]").forEach((button) => {
      button.addEventListener("click", () => showStep(currentStep - 1));
    });

    form
      .querySelector("[data-prototype-submit]")
      .addEventListener("click", () => {
        prototypeResult.textContent =
          "Prueba completada. Esta preproducción privada no almacenó ni transmitió la información. Puede usar “Continuar por WhatsApp” para iniciar voluntariamente la conversación.";
        prototypeResult.hidden = false;
        prototypeResult.focus?.();
      });

    whatsapp.addEventListener("click", (event) => {
      if (whatsapp.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        showToast("El canal de WhatsApp no está configurado.");
      }
    });

    form.addEventListener("submit", (event) => event.preventDefault());
    showStep(1);
  }

  document.addEventListener("DOMContentLoaded", () => {
    configureContactChannels();
    configureMobileNavigation();
    configureScienceExplorer();
    configureKnowledgeLibrary();
    configureLearningGames();
    configureOrientationForm();
  });
})();
