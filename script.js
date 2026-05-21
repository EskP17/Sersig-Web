/* ============================================================
   SAFEGUARD INDUSTRIAL - script.js
   ============================================================ */

// ---- Init AOS ----
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });

  initNavbar();
  initMobileMenu();
  initCounters();
  initRiskButtons();
  initCalculator();
  initHeroBg();
});

// ============================================================
// NAVBAR – scroll effect
// ============================================================
function initNavbar() {
  const navbar = document.getElementById('navbar');

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('menu-icon');
  const links = menu.querySelectorAll('.mobile-nav-link, a[href^="https"]');

  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    icon.className = isOpen ? 'fas fa-bars text-xl' : 'fas fa-xmark text-xl';
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      icon.className = 'fas fa-bars text-xl';
    });
  });
}

// ============================================================
// HERO BG – subtle scale on load
// ============================================================
function initHeroBg() {
  const bg = document.querySelector('.hero-bg');
  if (bg) {
    setTimeout(() => bg.classList.add('loaded'), 100);
  }
}

// ============================================================
// ANIMATED COUNTERS
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1800;
  const steps = 60;
  const stepValue = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(Math.round(easeOutCubic(step / steps) * target), target);
    el.textContent = current >= 1000 ? (current / 1000).toFixed(1) + 'K+' : current + (step >= steps ? '+' : '');

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = target >= 1000 ? (target / 1000).toFixed(0) + 'K+' : target + '+';
    }
  }, duration / steps);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ============================================================
// RISK RADIO BUTTONS – visual selection
// ============================================================
function initRiskButtons() {
  const options = document.querySelectorAll('.risk-option');

  options.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active state from all
      options.forEach(o => {
        const radio = o.querySelector('input[type="radio"]');
        radio.checked = false;
      });
      // Set this one
      const radio = option.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });
}

// ============================================================
// CALCULATOR
// ============================================================
function initCalculator() {
  const btn = document.getElementById('calc-btn');
  btn.addEventListener('click', runCalculator);

  // WA button (set after calc runs)
  document.getElementById('calc-wa-btn').addEventListener('click', sendWhatsApp);
}

// Global result store for WA message
let calcResultData = null;

function runCalculator() {
  // ---- Gather inputs ----
  const tipo    = document.getElementById('calc-tipo').value;
  const area    = parseFloat(document.getElementById('calc-area').value) || 0;
  const pisos   = parseInt(document.getElementById('calc-pisos').value) || 1;
  const areas   = parseInt(document.getElementById('calc-areas').value) || 1;
  const cocina  = document.getElementById('calc-cocina').checked;
  const inflamable = document.getElementById('calc-inflamable').checked;
  const electrico  = document.getElementById('calc-electrico').checked;
  const quimicos   = document.getElementById('calc-quimicos').checked;
  const riesgoEl   = document.querySelector('input[name="riesgo"]:checked');
  const riesgo     = riesgoEl ? riesgoEl.value : 'medio';

  // ---- Validation ----
  if (!tipo) {
    shakeBtn();
    showToast('⚠️ Selecciona el tipo de establecimiento');
    return;
  }
  if (area <= 0) {
    shakeBtn();
    showToast('⚠️ Ingresa los metros cuadrados');
    return;
  }

  // ---- Logic ----
  const result = computeRecommendation({ tipo, area, pisos, areas, cocina, inflamable, electrico, quimicos, riesgo });

  // Store for WA
  calcResultData = { tipo, area, pisos, areas, riesgo, ...result };

  // ---- Render ----
  renderResult(result, { tipo, area, pisos, areas, riesgo });

  // Scroll to result on mobile
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      document.getElementById('calc-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

function computeRecommendation({ tipo, area, pisos, areas, cocina, inflamable, electrico, quimicos, riesgo }) {
  const riesgosDetectados = [];
  const clasesIncendio = new Set();
  const extintores = [];

  // ---- Risk multiplier ----
  const multiplier = { bajo: 0.8, medio: 1.0, alto: 1.3 }[riesgo] || 1.0;

  // Base: 1 extintor ABC por cada 200m² (NFPA 10)
  const baseCount = Math.max(1, Math.ceil((area / 200) * multiplier));

  // ---- Clase A – siempre para materiales sólidos ----
  clasesIncendio.add('A');

  // ---- Tipo de establecimiento ----
  const tipoConfig = {
    restaurante: {
      riesgos: ['Cocinas con aceites y grasas (Clase K)', 'Riesgo eléctrico en equipos de cocina'],
      clases: ['K', 'C'],
      extra: [
        { tipo: 'Tipo K', capacidad: '6 lt', razon: 'Extinción de aceites y grasas (cocina)' },
        { tipo: 'CO₂', capacidad: '5 lb', razon: 'Equipos eléctricos de cocina' },
      ]
    },
    cocina: {
      riesgos: ['Aceites y grasas a alta temperatura (Clase K)', 'Equipos eléctricos de alta potencia'],
      clases: ['K', 'C'],
      extra: [
        { tipo: 'Tipo K', capacidad: '6 lt', razon: 'Extinción obligatoria en cocinas industriales NFPA' },
        { tipo: 'CO₂', capacidad: '10 lb', razon: 'Tableros eléctricos y equipos de cocción' },
      ]
    },
    oficina: {
      riesgos: ['Equipos eléctricos y electrónicos', 'Papel y materiales de oficina'],
      clases: ['C'],
      extra: [
        { tipo: 'CO₂', capacidad: '5 lb', razon: 'Computadores, servidores y equipos eléctricos' },
      ]
    },
    bodega: {
      riesgos: ['Gran carga combustible (Clase A)', 'Alto volumen de materiales almacenados'],
      clases: [],
      extra: [
        { tipo: 'ABC', capacidad: '20 kg', razon: 'Mayor capacidad por alta carga combustible' },
      ]
    },
    taller: {
      riesgos: ['Líquidos inflamables (aceites, solventes)', 'Equipos eléctricos y maquinaria'],
      clases: ['B', 'C'],
      extra: [
        { tipo: 'ABC', capacidad: '10 kg', razon: 'Cobertura general del taller' },
        { tipo: 'CO₂', capacidad: '5 lb', razon: 'Tableros eléctricos y máquinas' },
      ]
    },
    industria: {
      riesgos: ['Maquinaria industrial', 'Riesgo eléctrico de alta tensión', 'Posibles líquidos inflamables'],
      clases: ['B', 'C'],
      extra: [
        { tipo: 'ABC', capacidad: '20 kg', razon: 'Zonas de producción de alto riesgo' },
        { tipo: 'CO₂', capacidad: '10 lb', razon: 'Tableros de control y subestaciones' },
      ]
    },
    local: {
      riesgos: ['Afluencia de público', 'Materiales combustibles varios'],
      clases: [],
      extra: []
    },
    conjunto: {
      riesgos: ['Zonas comunes y parqueadero'],
      clases: [],
      extra: [
        { tipo: 'ABC', capacidad: '5 kg', razon: 'Pasillos, cuartos técnicos y parqueadero' },
      ]
    },
    drogueria: {
      riesgos: ['Reactivos y sustancias farmacéuticas', 'Equipos eléctricos de refrigeración'],
      clases: ['B', 'C'],
      extra: [
        { tipo: 'CO₂', capacidad: '5 lb', razon: 'Equipos de refrigeración y electrónicos' },
      ]
    },
    ferreteria: {
      riesgos: ['Productos inflamables (solventes, pinturas)', 'Almacenamiento denso'],
      clases: ['B'],
      extra: [
        { tipo: 'ABC', capacidad: '10 kg', razon: 'Área de ventas y bodega de inflamables' },
      ]
    },
  };

  const config = tipoConfig[tipo] || { riesgos: [], clases: [], extra: [] };
  config.riesgos.forEach(r => riesgosDetectados.push(r));
  config.clases.forEach(c => clasesIncendio.add(c));

  // ---- Special conditions ----
  if (cocina || tipo === 'restaurante' || tipo === 'cocina') {
    clasesIncendio.add('K');
    if (!riesgosDetectados.find(r => r.includes('Clase K'))) {
      riesgosDetectados.push('Presencia de cocina con aceites y grasas (Clase K)');
    }
    if (!extintores.find(e => e.tipo === 'Tipo K')) {
      extintores.push({ tipo: 'Tipo K', cantidad: 1, capacidad: '6 lt', razon: 'Extintor obligatorio en área de cocina (NFPA 17A)' });
    }
  }

  if (inflamable) {
    clasesIncendio.add('B');
    riesgosDetectados.push('Almacenamiento / uso de líquidos inflamables (Clase B)');
    extintores.push({ tipo: 'ABC / CO₂', cantidad: Math.max(1, Math.ceil(area / 150 * multiplier)), capacidad: '10 kg', razon: 'Cobertura de líquidos inflamables Clase B' });
  }

  if (electrico) {
    clasesIncendio.add('C');
    riesgosDetectados.push('Presencia de equipos eléctricos (Clase C)');
    if (!extintores.find(e => e.tipo === 'CO₂')) {
      extintores.push({ tipo: 'CO₂', cantidad: Math.max(1, Math.ceil(pisos * 1)), capacidad: '5 lb', razon: 'Equipos eléctricos, tableros y UPS' });
    }
  }

  if (quimicos) {
    riesgosDetectados.push('Almacenamiento de sustancias químicas – requiere evaluación especial');
    extintores.push({ tipo: 'Polvo especial / ABC', cantidad: Math.max(1, Math.ceil(areas * 0.5)), capacidad: '10 kg', razon: 'Zona de almacenamiento de químicos (evaluación específica recomendada)' });
  }

  // ---- Build main extinguisher list ----
  // Base ABC
  const mainABC = { tipo: 'ABC (polvo seco)', cantidad: Math.max(1, baseCount), capacidad: riesgo === 'alto' ? '10 kg' : '5 kg', razon: `Cobertura general – 1 cada 200m² (NFPA 10)` };
  extintores.unshift(mainABC);

  // Add extras from tipo config
  config.extra.forEach(e => {
    if (!extintores.find(ex => ex.tipo === e.tipo)) {
      extintores.push({ tipo: e.tipo, cantidad: Math.max(1, pisos), capacidad: e.capacidad, razon: e.razon });
    }
  });

  // ---- Summary text ----
  const resumen = buildResumen(tipo, area, pisos, riesgo, Array.from(clasesIncendio));

  // ---- Location by floor ----
  const ubicaciones = buildUbicaciones(extintores, pisos, tipo);

  return {
    riesgosDetectados,
    clasesIncendio: Array.from(clasesIncendio),
    extintores,
    resumen,
    ubicaciones,
  };
}

function buildResumen(tipo, area, pisos, riesgo, clases) {
  const tipoNombres = {
    restaurante: 'restaurante', cocina: 'cocina industrial', oficina: 'oficina',
    bodega: 'bodega/almacén', taller: 'taller', industria: 'industria/planta',
    local: 'local comercial', conjunto: 'conjunto residencial',
    drogueria: 'droguería/farmacia', ferreteria: 'ferretería'
  };
  const nombre = tipoNombres[tipo] || tipo;
  const clasesStr = clases.map(c => `Clase ${c}`).join(', ');
  return `Para tu ${nombre} de ${area} m² con ${pisos} piso(s) y nivel de riesgo ${riesgo}, se identificaron fuegos tipo: ${clasesStr}. La siguiente recomendación técnica cumple con NFPA 10 y NTC 2885.`;
}

function buildUbicaciones(extintores, pisos, tipo) {
  const result = [];
  const totalExt = extintores.reduce((s, e) => s + e.cantidad, 0);
  const perPiso = Math.max(1, Math.ceil(totalExt / pisos));

  const locationHints = {
    abc: 'Pasillo principal, entrada y zonas de mayor tránsito',
    'co₂': 'Tablero eléctrico, sala de servidores/equipos',
    'tipo k': 'Inmediato a la cocina, a no más de 10m del punto de cocción',
    agua: 'Escalera, sala de archivo y áreas de materiales sólidos',
    solkaflam: 'Sala de cómputo y cuartos de UPS',
    quimicos: 'Almacén de químicos con señalización de emergencia',
  };

  for (let p = 1; p <= pisos; p++) {
    const items = [];
    extintores.forEach(ext => {
      const key = ext.tipo.toLowerCase().split(' ')[0];
      const hint = Object.entries(locationHints).find(([k]) => key.includes(k.replace(/[₂]/g, '')))?.[1]
        || 'Zona de mayor riesgo, accesible y señalizado';
      items.push(`${ext.tipo} (${ext.capacidad}) – ${hint}`);
    });
    result.push({ piso: p, items });
  }
  return result;
}

// ============================================================
// RENDER RESULT
// ============================================================
function renderResult(result, inputs) {
  const placeholder = document.getElementById('calc-placeholder');
  const resultDiv = document.getElementById('calc-result');

  placeholder.classList.add('hidden');
  resultDiv.classList.remove('hidden');

  // Risk badge
  const badge = document.getElementById('result-riesgo-badge');
  const riesgoClass = { bajo: 'risk-tag-bajo', medio: 'risk-tag-medio', alto: 'risk-tag-alto' }[inputs.riesgo];
  badge.className = `result-risk-tag ${riesgoClass}`;
  badge.textContent = `Riesgo ${inputs.riesgo}`;

  // Resumen
  document.getElementById('result-resumen').textContent = result.resumen;

  // Riesgos
  const riesgosEl = document.getElementById('result-riesgos');
  riesgosEl.innerHTML = result.riesgosDetectados.length
    ? result.riesgosDetectados.map(r => `<span class="riesgo-badge">${r}</span>`).join('')
    : '<span class="riesgo-badge">Sin riesgos especiales identificados</span>';

  // Fire classes
  const clasesEl = document.getElementById('result-clases');
  clasesEl.innerHTML = result.clasesIncendio.map(c =>
    `<div class="fire-class-badge class-${c}" title="Fuego Clase ${c}">
      <span>${c}</span>
    </div>`
  ).join('') + '<span class="text-white/40 text-xs self-center ml-2">Tipos de fuego a controlar</span>';

  // Extintores
  const extEl = document.getElementById('result-extintores');
  extEl.innerHTML = result.extintores.map(e =>
    `<div class="extintor-item">
      <div class="extintor-icon"><i class="fas fa-fire-extinguisher"></i></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-white font-600 text-sm">${e.tipo}</span>
          <span class="text-flame font-display font-800 text-lg">${e.cantidad}</span>
        </div>
        <div class="flex items-center gap-3 mt-0.5">
          <span class="text-white/40 text-xs">${e.capacidad}</span>
          <span class="text-white/30 text-xs">·</span>
          <span class="text-white/50 text-xs truncate">${e.razon}</span>
        </div>
      </div>
    </div>`
  ).join('');

  // Ubicaciones
  const ubiEl = document.getElementById('result-ubicacion');
  ubiEl.innerHTML = result.ubicaciones.map(u =>
    `<div class="ubicacion-item">
      <div class="ubicacion-piso">Piso ${u.piso}</div>
      <div class="ubicacion-desc">${u.items.join(' · ')}</div>
    </div>`
  ).join('');
}

// ============================================================
// WHATSAPP INTEGRATION
// ============================================================
function sendWhatsApp() {
  if (!calcResultData) return;

  const d = calcResultData;
  const tipoNombres = {
    restaurante: 'Restaurante', cocina: 'Cocina Industrial', oficina: 'Oficina',
    bodega: 'Bodega/Almacén', taller: 'Taller Mecánico', industria: 'Industria/Planta',
    local: 'Local Comercial', conjunto: 'Conjunto Residencial',
    drogueria: 'Droguería/Farmacia', ferreteria: 'Ferretería'
  };

  const tipoNombre = tipoNombres[d.tipo] || d.tipo;

  const extList = d.extintores.map(e =>
    `   • ${e.tipo} – ${e.cantidad} und. (${e.capacidad})`
  ).join('\n');

  const riesgosList = d.riesgosDetectados.length
    ? d.riesgosDetectados.map(r => `   ⚠️ ${r}`).join('\n')
    : '   ✅ Sin riesgos especiales';

  const clasesList = d.clasesIncendio.map(c => `Clase ${c}`).join(', ');

  const msg = `🔥 *SOLICITUD DE COTIZACIÓN - SafeGuard Industrial*

📋 *Datos del establecimiento:*
   • Tipo: ${tipoNombre}
   • Área: ${d.area} m²
   • Pisos: ${d.pisos}
   • Nivel de riesgo: ${d.riesgo.toUpperCase()}

⚠️ *Riesgos detectados:*
${riesgosList}

🔥 *Clases de fuego:* ${clasesList}

🧯 *Extintores recomendados (NFPA 10 / NTC 2885):*
${extList}

📞 Quedo atento/a a su asesoría técnica. ¡Gracias!`;

  const url = `https://wa.me/573000000000?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ============================================================
// HELPERS
// ============================================================
function shakeBtn() {
  const btn = document.getElementById('calc-btn');
  btn.style.animation = 'none';
  btn.offsetHeight; // reflow
  btn.classList.add('shake');
  setTimeout(() => btn.classList.remove('shake'), 600);
}

function showToast(msg) {
  // Remove existing toast
  const existing = document.getElementById('sg-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'sg-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 6rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #2C2C2C;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    border: 1px solid rgba(230,57,70,0.4);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    z-index: 9999;
    opacity: 0;
    transition: all 0.3s ease;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Shake animation via JS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .shake { animation: shake 0.5s ease !important; }
`;
document.head.appendChild(shakeStyle);

// ============================================================
// SMOOTH SCROLL for all internal links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
