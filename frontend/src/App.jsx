import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, Home, Siren, Map, Users, ContactRound, History, Settings,
  Sun, Moon, Bell, ChevronRight, Flame, CarFront, HeartPulse, ShieldAlert,
  MapPin, Plus, CheckCircle2, CircleHelp, Menu, X, Clock3, Activity,
  UserRound, HandHeart, Info, LogOut, Search, SlidersHorizontal
} from 'lucide-react';

const navItems = [
  { id: 'Inicio', icon: Home }, { id: 'Alertas', icon: Siren }, { id: 'Mapa', icon: Map },
  { id: 'Comunidad', icon: Users }, { id: 'Contactos', icon: ContactRound },
  { id: 'Historial', icon: History }, { id: 'Administración', icon: Settings }
];
const initialAlerts = [
  { id: 1, type: 'Incendio', title: 'Incendio en zona norte', zone: 'Zona Norte', time: 'Hace 12 min', status: 'Activa', icon: Flame, color: 'red' },
  { id: 2, type: 'Seguridad', title: 'Sospecha de actividad extraña', zone: 'Barrio Los Robles', time: 'Hace 45 min', status: 'Activa', icon: ShieldAlert, color: 'blue' },
  { id: 3, type: 'Accidente', title: 'Accidente de tránsito', zone: 'Zona Centro', time: 'Hace 2 h', status: 'En seguimiento', icon: CarFront, color: 'orange' },
  { id: 4, type: 'Emergencia médica', title: 'Emergencia médica', zone: 'Barrio Los Robles', time: 'Hace 3 h', status: 'Cerrada', icon: HeartPulse, color: 'pink' }
];
const alertTypes = [
  { name: 'Seguridad', icon: ShieldAlert, color: 'blue' },
  { name: 'Incendio', icon: Flame, color: 'red' },
  { name: 'Accidente', icon: CarFront, color: 'orange' },
  { name: 'Emergencia médica', icon: HeartPulse, color: 'green' },
  { name: 'Pánico', icon: Siren, color: 'purple' }
];

function App() {
  const [active, setActive] = useState('Inicio');
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
const [apiError, setApiError] = useState('');

async function loadAlerts() {
  try {
    setLoadingAlerts(true);
    setApiError('');

    const response = await fetch('http://localhost:4000/api/alerts');

    if (!response.ok) {
      throw new Error('No se pudieron consultar las alertas.');
    }

    const data = await response.json();
    setAlerts(data);
  } catch (error) {
    console.error('Error al cargar las alertas:', error);
    setApiError('No se pudieron cargar las alertas desde el servidor.');
  } finally {
    setLoadingAlerts(false);
  }
}

useEffect(() => {
  loadAlerts();
}, []);
  const [showComposer, setShowComposer] = useState(false);
  const [chosenType, setChosenType] = useState('Seguridad');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const activeAlerts = alerts.filter(a => a.status !== 'Cerrada');
  const filteredAlerts = useMemo(() => alerts.filter(a =>
    (filter === 'Todas' || a.status === filter) &&
    `${a.title} ${a.zone} ${a.type}`.toLowerCase().includes(search.toLowerCase())
  ), [alerts, filter, search]);

  async function createAlert() {
  const alertData = {
    type: chosenType,
    title: description.trim()
      ? `${chosenType}: ${description.trim().slice(0, 140)}`
      : `${chosenType}: alerta vecinal`,
    description: description.trim(),
    zone: 'Ubicación por confirmar'
  };

  try {
    setApiError('');

    const response = await fetch('http://localhost:4000/api/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alertData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo registrar la alerta.');
    }

    const newAlert = {
      ...data,
      time: 'Ahora',
      icon: alertTypes.find(t => t.name === data.type)?.icon || Siren,
      color: alertTypes.find(t => t.name === data.type)?.color || 'blue'
    };

    setAlerts(prev => [newAlert, ...prev]);
    setShowComposer(false);
    setDescription('');
    setActive('Alertas');

    setNotice('Alerta guardada correctamente en PostgreSQL. No se enviaron notificaciones reales.');

    window.setTimeout(() => setNotice(''), 6000);
  } catch (error) {
    console.error('Error al registrar la alerta:', error);

    setApiError(
      error.message || 'No se pudo conectar con el servidor.'
    );
  }
}
  function closeAlert(id) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Cerrada' } : a));
  }

  return <div className={`app ${dark ? 'dark' : ''}`}>
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={25}/></div><div><b>SOS-VEC</b><small>Sistema Integral de Seguridad Vecinal</small></div><button className="close-menu" onClick={() => setMobileMenu(false)}><X size={18}/></button></div>
      <div className="community-select"><span className="online-dot"/> Comunidad Los Robles <ChevronRight size={15}/></div>
      <nav>{navItems.map(({id, icon: Icon}) => <button key={id} className={`nav-item ${active === id ? 'selected' : ''}`} onClick={() => {setActive(id); setMobileMenu(false);}}><Icon size={18}/><span>{id}</span>{id === 'Alertas' && activeAlerts.length > 0 && <em>{activeAlerts.length}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={18}/><span>Ayuda y soporte</span></button><button className="theme-toggle" onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}<span>{dark ? 'Modo claro' : 'Modo oscuro'}</span></button><div className="sidebar-foot">Una comunidad más segura, siempre.</div></div>
    </aside>

    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileMenu(true)}><Menu/></button><div className="breadcrumb">Comunidad <ChevronRight size={14}/> <b>{active}</b></div><div className="top-actions"><span className="service-status"><span className="online-dot"/> Servicio activo</span><button className="icon-button" aria-label="Notificaciones"><Bell size={19}/><i/></button><div className="avatar">VG</div></div></header>
      <div className="page">
        {apiError && (
  <div className="notice" role="alert">
    <Info size={18} />
    <span>{apiError}</span>
    <button onClick={() => setApiError('')}>
      <X size={16} />
    </button>
  </div>
)}
        {notice && <div className="notice"><Info size={18}/>{notice}<button onClick={() => setNotice('')}><X size={16}/></button></div>}
        {active === 'Inicio' && <Dashboard alerts={alerts} activeAlerts={activeAlerts} onCreate={() => setShowComposer(true)} onNavigate={setActive}/>}
        {active === 'Alertas' && <AlertList alerts={filteredAlerts} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} onCreate={() => setShowComposer(true)} onClose={closeAlert}/>}
        {active === 'Mapa' && <MapPage alerts={activeAlerts}/>}
        {active === 'Comunidad' && <CommunityPage/>}
        {active === 'Contactos' && <ContactsPage/>}
        {active === 'Historial' && <HistoryPage alerts={alerts}/>}
        {active === 'Administración' && <AdminPage/>}
        <footer className="page-footer"><ShieldCheck size={17}/> <b>SOS-VEC</b><span>•</span> Sistema Integral de Seguridad Vecinal <span>•</span> Una comunidad más segura, siempre.</footer>
      </div>
    </main>

    {showComposer && <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && setShowComposer(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><span className="eyebrow">NUEVO INCIDENTE</span><h2 id="modal-title">Crear alerta vecinal</h2></div><button className="icon-button" onClick={() => setShowComposer(false)}><X/></button></div><p className="muted">Seleccioná el tipo de incidente y describí brevemente qué sucede.</p><div className="type-grid">{alertTypes.map(t => <button key={t.name} className={`type-option ${chosenType === t.name ? 'chosen' : ''}`} onClick={() => setChosenType(t.name)}><span className={`type-icon ${t.color}`}><t.icon size={22}/></span><b>{t.name}</b></button>)}</div><label className="field-label" htmlFor="description">Descripción (opcional)</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Contá brevemente qué está ocurriendo…" rows="3" maxLength="300"/><div className="privacy-note"><Info size={17}/><span>Esta versión registra la alerta localmente en la demostración. Aún no contacta a vecinos ni a servicios de emergencia.</span></div><div className="modal-actions"><button className="btn secondary" onClick={() => setShowComposer(false)}>Cancelar</button><button className="btn danger" onClick={createAlert}><Siren size={17}/> Registrar alerta</button></div></section></div>}
  </div>;
}

function PageTitle({eyebrow, title, subtitle, action}) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}
function Dashboard({alerts, activeAlerts, onCreate, onNavigate}) {
  const recent = alerts.slice(0,3);
  return <>
    <PageTitle eyebrow="PANEL DE CONTROL" title="¡Hola, Valeria!" subtitle="Tu seguridad y la de tu comunidad también son nuestra prioridad." action={<span className="pill success"><span className="online-dot"/> Comunidad activa</span>}/>
    <section className="hero-grid">
      <div className="sos-card"><div className="sos-halo"><button className="sos-button" onClick={onCreate} aria-label="Crear alerta SOS">SOS</button></div><b>¿Necesitás ayuda?</b><p>Creá una alerta para tu comunidad</p><button className="text-button" onClick={onCreate}>Crear alerta <ChevronRight size={16}/></button><span className="sos-caption">Usá el botón solo ante una situación real.</span></div>
      <div className="quick-card"><div className="section-heading"><div><h2>Accesos rápidos</h2><p>Todo lo que necesitás, a mano.</p></div></div><div className="quick-grid"><Quick icon={Siren} title="Nueva alerta" onClick={onCreate}/><Quick icon={MapPin} title="Mapa vecinal" onClick={() => onNavigate('Mapa')}/><Quick icon={ContactRound} title="Contactos" onClick={() => onNavigate('Contactos')}/><Quick icon={Users} title="Mi comunidad" onClick={() => onNavigate('Comunidad')}/></div><div className="community-mini"><div className="community-art"><ShieldCheck size={34}/><span>LOS ROBLES</span></div><div><b>Comunidad Los Robles</b><p>128 miembros · 3 administradores</p><button className="text-button" onClick={() => onNavigate('Comunidad')}>Ver comunidad <ChevronRight size={15}/></button></div></div></div>
    </section>
    <section className="stats-grid"><Stat icon={Activity} label="Alertas activas" value={activeAlerts.length} note="En seguimiento" color="red"/><Stat icon={Users} label="Miembros" value="128" note="Comunidad Los Robles" color="blue"/><Stat icon={CheckCircle2} label="Respuestas de ayuda" value="06" note="En los últimos 7 días" color="green"/></section>
    <section className="content-grid"><div className="panel"><div className="panel-heading"><div><h2>Alertas activas</h2><p>Incidentes recientes de tu comunidad</p></div><button className="text-button" onClick={() => onNavigate('Alertas')}>Ver todas <ChevronRight size={15}/></button></div><div className="alert-items">{activeAlerts.slice(0,3).map(a => <AlertRow key={a.id} alert={a} onClick={() => onNavigate('Alertas')}/>)}{activeAlerts.length === 0 && <Empty text="No hay alertas activas."/>}</div></div>
      <div className="panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos</p></div><Clock3 size={18} className="muted-icon"/></div><div className="activity-list"><ActivityRow color="blue" title="Comunidad en línea" desc="Sistema disponible" time="Ahora"/><ActivityRow color="green" title="Miembros verificados" desc="Acceso de comunidad" time="Hoy"/><ActivityRow color="orange" title="Revisá tus contactos" desc="Mantené actualizada tu lista" time="Sugerencia"/></div></div></section>
    <div className="safety-banner"><Info size={19}/><div><b>Recordatorio de seguridad</b><p>SOS-VEC es una herramienta complementaria. Ante una emergencia, contactá a los servicios oficiales (911 en Argentina).</p></div></div>
  </>;
}
function Quick({icon: Icon, title, onClick}) { return <button className="quick-item" onClick={onClick}><span><Icon size={21}/></span><b>{title}</b></button>; }
function Stat({icon: Icon, label, value, note, color}) { return <div className="stat-card"><span className={`stat-icon ${color}`}><Icon size={20}/></span><div><p>{label}</p><strong>{value}</strong><small>{note}</small></div></div>; }
function AlertRow({alert, onClick, onClose}) { const Icon = alert.icon || Siren; return <div className="alert-row"><span className={`alert-icon ${alert.color}`}><Icon size={20}/></span><button className="alert-row-main" onClick={onClick}><b>{alert.title}</b><span><MapPin size={12}/> {alert.zone} <span className="dot-separator">·</span> {alert.time}</span></button><span className={`status ${alert.status === 'Activa' ? 'status-active' : alert.status === 'Cerrada' ? 'status-closed' : 'status-progress'}`}>{alert.status}</span>{onClose && alert.status !== 'Cerrada' && <button className="small-action" onClick={() => onClose(alert.id)}>Cerrar</button>}</div>; }
function ActivityRow({color,title,desc,time}) { return <div className="activity-row"><span className={`activity-dot ${color}`}/><div><b>{title}</b><p>{desc}</p></div><small>{time}</small></div>; }
function AlertList({alerts,filter,setFilter,search,setSearch,onCreate,onClose}) {
  return <><PageTitle eyebrow="CENTRO DE INCIDENTES" title="Alertas vecinales" subtitle="Consultá y gestioná los incidentes registrados." action={<button className="btn primary" onClick={onCreate}><Plus size={17}/> Nueva alerta</button>}/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por tipo, zona o descripción…"/></div><div className="filter-box"><SlidersHorizontal size={17}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Todas</option><option>Activa</option><option>En seguimiento</option><option>Cerrada</option></select></div></div><div className="panel list-panel"><div className="panel-heading"><div><h2>Listado de alertas</h2><p>{alerts.length} resultados</p></div></div>{alerts.map(a=><AlertRow key={a.id} alert={a} onClick={()=>{}} onClose={onClose}/>)}{alerts.length===0&&<Empty text="No encontramos alertas con esos filtros."/>}</div></>;
}
function MapPage({alerts}) {
  return <><PageTitle eyebrow="UBICACIÓN Y COBERTURA" title="Mapa vecinal" subtitle="Vista de referencia para explorar alertas de la comunidad."/><div className="map-layout"><div className="map-canvas"><div className="map-grid-lines"/><div className="map-road road-a"/><div className="map-road road-b"/><div className="map-road road-c"/><div className="map-block block-a"/><div className="map-block block-b"/><div className="map-block block-c"/><div className="map-block block-d"/><div className="map-label label-a">PLAZA CENTRAL</div><div className="map-label label-b">LOS ROBLES</div><span className="map-pin user-pin"><UserRound size={19}/></span><span className="map-pin pin-one"><Flame size={17}/></span><span className="map-pin pin-two"><ShieldAlert size={17}/></span><span className="map-pin pin-three"><CarFront size={17}/></span><div className="map-legend"><span><i className="legend-blue"/> Tu ubicación (demostración)</span><span><i className="legend-red"/> Alertas</span></div><div className="map-disclaimer">Mapa ilustrativo: no representa ubicaciones reales.</div></div><div className="panel map-side"><div className="panel-heading"><div><h2>Incidentes cercanos</h2><p>Alertas activas de la comunidad</p></div></div>{alerts.map(a=><AlertRow key={a.id} alert={a}/>)}{alerts.length===0&&<Empty text="No hay alertas activas."/>}<div className="privacy-note"><Info size={17}/><span>La ubicación real se incorporará con permisos y controles de privacidad.</span></div></div></div></>;
}
function CommunityPage() { return <><PageTitle eyebrow="RED DE APOYO" title="Comunidad Los Robles" subtitle="Información y miembros de tu comunidad." action={<span className="pill success"><span className="online-dot"/> Comunidad activa</span>}/><div className="community-banner"><div className="community-shield"><ShieldCheck size={42}/></div><div><span className="eyebrow">COMUNIDAD VERIFICADA · DEMOSTRACIÓN</span><h2>Los Robles</h2><p>Vecinos conectados para colaborar y cuidar el barrio.</p></div><div className="community-count"><b>128</b><span>miembros</span></div></div><div className="stats-grid"><Stat icon={Users} label="Miembros registrados" value="128" note="Datos de ejemplo" color="blue"/><Stat icon={ShieldCheck} label="Administradores" value="3" note="Roles de ejemplo" color="green"/><Stat icon={HandHeart} label="Colaboradores" value="24" note="Últimos 30 días · ejemplo" color="orange"/></div><div className="panel"><div className="panel-heading"><div><h2>Acuerdos de convivencia</h2><p>Recomendaciones para el uso responsable de SOS-VEC.</p></div></div><div className="guidelines"><ActivityRow color="blue" title="Usá las alertas responsablemente" desc="Registrá incidentes reales y evitá información no verificada." time="01"/><ActivityRow color="green" title="Respetá la privacidad" desc="No compartas datos personales de otros vecinos sin autorización." time="02"/><ActivityRow color="orange" title="Coordiná sin exponerte" desc="No te pongas en riesgo para asistir a una situación." time="03"/></div></div></>; }
function ContactsPage() { const contacts=[['MG','María González','Familiar · Verificado'],['CP','Carlos Pérez','Amigo · Verificado'],['LF','Lucía Fernández','Familiar'],['JS','Jorge Silva','Vecino']]; return <><PageTitle eyebrow="RED DE CONFIANZA" title="Contactos" subtitle="Personas de confianza para tener a mano." action={<button className="btn primary" onClick={()=>alert('La gestión de contactos personales se conectará en una próxima etapa.')}><Plus size={17}/> Agregar contacto</button>}/><div className="privacy-note wide"><Info size={18}/><span>Los contactos que ves son ejemplos visuales. Todavía no están guardados en una cuenta real.</span></div><div className="contact-grid">{contacts.map(([initials,name,desc])=><div className="contact-card" key={name}><div className="contact-avatar">{initials}</div><div className="contact-info"><b>{name}</b><p>{desc}</p></div><button className="icon-button" title="Opciones"><ChevronRight size={18}/></button></div>)}</div></>; }
function HistoryPage({alerts}) { return <><PageTitle eyebrow="REGISTRO DE ACTIVIDAD" title="Historial de incidentes" subtitle="Consultá las alertas registradas durante esta sesión."/><div className="toolbar"><div className="history-note"><History size={17}/> Los datos se reinician al recargar la página.</div></div><div className="panel list-panel"><div className="panel-heading"><div><h2>Todos los incidentes</h2><p>{alerts.length} registros de demostración</p></div></div>{alerts.map(a=><AlertRow key={a.id} alert={a}/>)}</div></>; }
function AdminPage() { const items=[['Gestionar miembros','Administrar roles y membresías',Users],['Solicitudes de ingreso','Revisar nuevas solicitudes',CheckCircle2],['Configuración de comunidad','Datos y preferencias',Settings],['Categorías de alertas','Configurar tipos de incidentes',Siren],['Reportes y estadísticas','Resumen de actividad',Activity],['Auditoría','Registro de acciones administrativas',History]]; return <><PageTitle eyebrow="GESTIÓN DE LA COMUNIDAD" title="Administración" subtitle="Herramientas de gestión para administradores." action={<span className="pill warning">Vista de demostración</span>}/><div className="admin-grid">{items.map(([title,desc,Icon],i)=><button className="admin-card" key={title} onClick={()=>alert('Este módulo se implementará al conectar usuarios, roles y base de datos.')}><span className="admin-icon"><Icon size={21}/></span><div><b>{title}</b><p>{desc}</p></div><ChevronRight size={18}/>{i===1&&<em>!</em>}</button>)}</div><div className="safety-banner"><Info size={19}/><div><b>Acceso restringido</b><p>En la versión final, estas acciones requerirán una sesión válida con rol de administrador verificado por el servidor.</p></div></div></>; }
function Empty({text}) { return <div className="empty-state"><ShieldCheck size={26}/><p>{text}</p></div>; }

export default App;
