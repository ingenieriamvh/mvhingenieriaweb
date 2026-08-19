(function attachMvhLogic(global) {
  const science = Object.freeze({
    persona: {
      label: "Persona",
      question: "¿Qué necesita ver para trabajar, circular o responder?",
      body:
        "Tarea, contraste, distribución, deslumbramiento, color, tiempo y entorno pueden intervenir.",
    },
    producto: {
      label: "Producto",
      question: "¿Qué debe reconocerse, comprobarse o diferenciarse?",
      body:
        "Forma, textura, acabado, color, defectos, velocidad y superficie cambian la condición visual.",
    },
    planta: {
      label: "Planta",
      question: "¿Cómo interviene la luz en el organismo y el proceso?",
      body:
        "Espectro, intensidad, fotoperiodo, etapa de desarrollo, ambiente y objetivo productivo deben relacionarse.",
    },
    animal: {
      label: "Animal",
      question: "¿Qué respuesta visual o biológica debe protegerse?",
      body:
        "Especie, sensibilidad, ritmo, bienestar, conducta, operación y seguridad modifican el análisis.",
    },
    territorio: {
      label: "Territorio",
      question: "¿Qué debe hacerse visible para orientar, usar y cuidar el espacio?",
      body:
        "Usuarios, recorridos, actividad nocturna, entorno, percepción, mantenimiento y contexto social intervienen.",
    },
  });

  function normalizeDigits(value, length) {
    return String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, length);
  }

  function normalizePlace(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase("es-CO");
  }

  function findMunicipality(departmentCode, value, departments) {
    const department = departments.find(
      (item) => item.code === departmentCode,
    );
    const normalized = normalizePlace(value);
    if (!department || !normalized) return null;
    return (
      department.municipalities.find(
        (municipality) =>
          municipality.code === String(value).trim() ||
          normalizePlace(municipality.name) === normalized,
      ) ?? null
    );
  }

  function lookupCiiu(value, catalog) {
    const code = normalizeDigits(value, 4);
    if (code.length !== 4 || !catalog[code]) return null;
    return { code, description: catalog[code] };
  }

  function validateStep(step, values) {
    const errors = [];
    if (step === 1 && !values.need) {
      errors.push("Seleccione la decisión que más se aproxima a su necesidad.");
    }
    if (step === 2) {
      if (!values.organizationType) errors.push("Seleccione el tipo de organización.");
      if (!values.departmentCode) errors.push("Seleccione el departamento.");
      if (!values.municipalityCode) {
        errors.push("Seleccione un municipio válido de la lista oficial.");
      }
    }
    if (step === 3 && String(values.situation ?? "").trim().length < 20) {
      errors.push("Describa brevemente la situación con al menos 20 caracteres.");
    }
    if (step === 4) {
      if (!String(values.name ?? "").trim()) errors.push("Ingrese su nombre.");
      if (!values.email && !values.phone) {
        errors.push("Ingrese un correo o teléfono para continuar.");
      }
      if (!values.privacyConsent) {
        errors.push("Debe autorizar el tratamiento de la información.");
      }
    }
    return errors;
  }

  function whatsappUrl(number, message) {
    if (!number) return null;
    return `https://wa.me/${normalizeDigits(number, 15)}?text=${encodeURIComponent(
      message,
    )}`;
  }

  const api = Object.freeze({
    science,
    findMunicipality,
    lookupCiiu,
    normalizeDigits,
    normalizePlace,
    validateStep,
    whatsappUrl,
  });

  global.MVHLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
