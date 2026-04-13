import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc,
  setDoc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  Shield, 
  Plane, 
  Search, 
  Anchor, 
  Flame, 
  Stethoscope, 
  Radio, 
  Biohazard,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  User,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// --- CONFIGURACIÓN E INICIALIZACIÓN ---
const firebaseConfig = {
  apiKey: "AIzaSyBjvokaJaOjwLkZ1BAbFYtn6T1VUF0Iz1A",
  authDomain: "safd-uniformidad.firebaseapp.com",
  projectId: "safd-uniformidad",
  storageBucket: "safd-uniformidad.firebasestorage.app",
  messagingSenderId: "429691809293",
  appId: "1:429691809293:web:0a02fe8fe5ea2b854c2f44",
  measurementId: "G-6EY004XWGN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'safd-logistics-v3';

const LOGO_URL = "https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/imagen_2026-04-13_191540450.png";

const HERO_IMAGES = [
  "https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/imagen_2026-04-13_222621960.png", 
  "https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/imagen_2026-04-13_224238602.png", 
  "https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/imagen_2026-04-13_224256139.png"
];

// --- COMPONENTES AUXILIARES ---

const UniformCarousel = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-full group/carousel">
      <img src={images[idx]} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Vista Uniforme" />
      {images.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover/carousel:opacity-100 z-20"><ChevronLeft size={20}/></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover/carousel:opacity-100 z-20"><ChevronRight size={20}/></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all ${i === idx ? 'w-6 bg-red-600' : 'w-2 bg-white/20'}`}></div>)}
          </div>
        </>
      )}
    </div>
  );
};

const UniformCard = ({ uniform, isAdmin, onDelete, onSelect, onEdit }) => (
  <div onClick={() => onSelect(uniform)} className="group relative bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-red-600/50 transition-all duration-500 shadow-xl">
    <div className="aspect-square overflow-hidden">
      <img src={uniform.portada || (uniform.imageUrls ? uniform.imageUrls[0] : '')} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000 opacity-80 group-hover:opacity-100" alt={uniform.name} />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent text-left p-8 flex flex-col justify-end">
      <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-[0.3em]">{uniform.category}</span>
      <div className="flex justify-between items-end">
        <h4 className="text-2xl font-black italic uppercase leading-none mt-1 text-white">{uniform.name}</h4>
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full group-hover:bg-red-600 group-hover:scale-110 transition duration-300 text-white"><ChevronRight size={18} /></div>
      </div>
    </div>
    {isAdmin && (
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(uniform); }} className="bg-blue-600/90 p-2.5 rounded-xl hover:bg-blue-500 transition-all hover:scale-110 text-white"><Edit2 size={18} /></button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(uniform.id); }} className="bg-red-900/90 p-2.5 rounded-xl hover:bg-red-600 transition-all hover:scale-110 text-white"><Trash2 size={18} /></button>
      </div>
    )}
  </div>
);

const DepartmentCard = ({ icon: Icon, title, desc, onClick, color = "bg-red-600" }) => (
  <div onClick={onClick} className="group bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] hover:border-red-600/30 transition-all duration-500 hover:translate-y-[-5px] cursor-pointer text-left">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-900/20 group-hover:scale-110 transition duration-500`}><Icon size={28} className="text-white" /></div>
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-black mb-3 italic uppercase tracking-tight">{title}</h3>
      <ChevronRight size={18} className="text-zinc-700 group-hover:text-red-500 transition" />
    </div>
    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const UniformDetail = ({ uniform, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 text-left">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose}></div>
    <div className="relative bg-[#0a0a0a] w-full max-w-6xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row h-full lg:h-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
      <div className="w-full lg:w-1/2 relative bg-zinc-950 min-h-[40vh] lg:min-h-0">
        <UniformCarousel images={uniform.imageUrls || [uniform.imageUrl]} />
        <button onClick={onClose} className="absolute top-8 left-8 bg-black/60 p-4 rounded-full hover:bg-red-600 transition-all z-30"><X/></button>
      </div>
      <div className="w-full lg:w-1/2 p-8 lg:p-14 overflow-y-auto relative">
        <div className="relative z-10">
          <div className="mb-12">
            <span className="bg-red-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest italic">{uniform.category}</span>
            <h2 className="text-5xl lg:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter mt-6">{uniform.name}</h2>
            <p className="mt-6 text-zinc-500 font-medium text-base leading-relaxed">{uniform.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Hombre', 'Mujer'].map(gender => (
              <div key={gender} className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5">
                <h3 className={`font-black italic uppercase tracking-widest mb-6 pb-4 border-b border-white/10 ${gender === 'Hombre' ? 'text-blue-400' : 'text-pink-400'}`}>{gender.toUpperCase()}</h3>
                <div className="space-y-3">
                  {Object.entries(gender === 'Hombre' ? (uniform.maleIds || {}) : (uniform.femaleIds || {}))
                    .filter(([_, v]) => v && v !== '' && v !== '0')
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center"><span className="text-[9px] text-zinc-500 uppercase font-black">{k}</span><span className="text-xs font-mono font-bold bg-white/5 px-3 py-1 rounded-lg">{v}</span></div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LoginModal = ({ onLogin, onClose }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (pass === "SAFD2026") { onLogin(); onClose(); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative bg-[#111] w-full max-w-md p-10 rounded-3xl border ${error ? 'border-red-600' : 'border-[#d4af37]/30'} shadow-2xl`}>
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 bg-zinc-900 border ${error ? 'border-red-600' : 'border-[#d4af37]/30'}`}><Lock className={error ? 'text-red-600' : 'text-[#d4af37]'} size={32} /></div>
          <h2 className="text-[#d4af37] text-xl font-black italic uppercase tracking-widest">SISTEMA UNIFORMIDAD</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" autoFocus className="w-full bg-[#1c1c1c] p-5 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none text-white text-center text-2xl" value={pass} onChange={e => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-[#b91c1c] py-5 rounded-xl font-black uppercase text-white hover:bg-red-600 transition shadow-xl shadow-red-900/10">AUTORIZAR ACCESO</button>
        </form>
      </div>
    </div>
  );
};

// --- MODALES GESTIÓN ---

const AddUniformModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '', category: 'Reglamentario', dept: 'General', description: '', imageUrls: '', portada: '',
    male: { helmet: '', jacket: '', shirt: '', bag: '', arms: '', legs: '', shoes: '', decal: '', chain: '', vest: '', mask: '' },
    female: { helmet: '', jacket: '', shirt: '', bag: '', arms: '', legs: '', shoes: '', decal: '', chain: '', vest: '', mask: '' }
  });
  const handleMaleChange = (f, v) => setFormData(p => ({...p, male: {...p.male, [f]: v}}));
  const handleFemaleChange = (f, v) => setFormData(p => ({...p, female: {...p.female, [f]: v}}));
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 text-white">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#0d0d0d] w-full max-w-5xl p-10 rounded-[2.5rem] border border-[#d4af37]/40 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
          <h2 className="text-[#d4af37] text-2xl font-black italic uppercase tracking-widest text-left">REGISTRAR NUEVA UNIFORMIDAD</h2>
          <X onClick={onClose} className="text-zinc-600 hover:text-white cursor-pointer transition-all" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <input placeholder="Nombre de Uniforme" className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Portada URL (1080x1080)" className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold" onChange={e => setFormData({...formData, portada: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-[#161616] p-4 rounded-xl border border-white/5 text-white" onChange={e => setFormData({...formData, category: e.target.value})}><option>Reglamentario</option><option>Departamento</option><option>Actualizado</option></select>
              <select className="bg-[#161616] p-4 rounded-xl border border-white/5 text-white" onChange={e => setFormData({...formData, dept: e.target.value})}><option>General</option><option>AIR OPS</option><option>FIRE MARSHAL</option><option>R.T.D.</option><option>MARINE</option><option>WILDLAND</option><option>PARAMEDIC</option><option>HAZMAT</option><option>VOLUNTEER</option></select>
            </div>
            <textarea placeholder="Descripción técnica..." className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 text-white h-24" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            <textarea placeholder="URLs Galería (separadas por comas)" className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 text-white h-24 text-[10px]" onChange={e => setFormData({...formData, imageUrls: e.target.value})}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {['male', 'female'].map(g => (
              <div key={g} className="space-y-2">
                <p className={`text-[10px] font-black uppercase mb-3 ${g === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>{g === 'male' ? 'HOMBRE' : 'MUJER'}</p>
                {['jacket', 'shirt', 'bag', 'arms', 'legs', 'shoes', 'decal', 'chain', 'vest', 'mask'].map(f => (
                  <input key={f} placeholder={f} className="w-full bg-black/40 p-2 rounded border border-white/5 text-[10px] text-white" onChange={e => g === 'male' ? handleMaleChange(f, e.target.value) : handleFemaleChange(f, e.target.value)} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-12">
          <button onClick={() => onSave(formData)} className="flex-1 bg-red-700 py-5 rounded-2xl font-black uppercase text-white hover:bg-red-600 transition shadow-xl">ARCHIVAR EN UNIFORMIDAD</button>
          <button onClick={onClose} className="px-10 bg-zinc-900 py-5 rounded-2xl font-black uppercase text-white hover:bg-zinc-800 transition">CANCELAR</button>
        </div>
      </div>
    </div>
  );
};

const EditUniformModal = ({ uniform, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: uniform.id, name: uniform.name, category: uniform.category, dept: uniform.dept || 'General', description: uniform.description || '', portada: uniform.portada || '',
    imageUrls: Array.isArray(uniform.imageUrls) ? uniform.imageUrls.join(', ') : '',
    male: uniform.maleIds || {}, female: uniform.femaleIds || {}
  });
  const handleMaleChange = (f, v) => setFormData(p => ({...p, male: {...p.male, [f]: v}}));
  const handleFemaleChange = (f, v) => setFormData(p => ({...p, female: {...p.female, [f]: v}}));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 text-white text-left">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#0d0d0d] w-full max-w-5xl p-10 rounded-[2.5rem] border border-red-600/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-red-600 text-2xl font-black italic uppercase mb-10 pb-6 border-b border-white/5">MODIFICAR UNIFORMIDAD</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <input value={formData.name} className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 text-white" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input value={formData.portada} className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 text-white" onChange={e => setFormData({...formData, portada: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select value={formData.category} className="bg-[#161616] p-4 rounded-xl border border-white/5 text-white" onChange={e => setFormData({...formData, category: e.target.value})}><option>Reglamentario</option><option>Departamento</option><option>Actualizado</option></select>
              <select value={formData.dept} className="bg-[#161616] p-4 rounded-xl border border-white/5 text-white" onChange={e => setFormData({...formData, dept: e.target.value})}><option>General</option><option>AIR OPS</option><option>FIRE MARSHAL</option><option>R.T.D.</option><option>MARINE</option><option>WILDLAND</option><option>PARAMEDIC</option><option>HAZMAT</option><option>VOLUNTEER</option></select>
            </div>
            <textarea value={formData.description} className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 text-white h-24" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            <textarea value={formData.imageUrls} className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 text-white h-24 text-[10px]" onChange={e => setFormData({...formData, imageUrls: e.target.value})}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {['male', 'female'].map(g => (
              <div key={g} className="space-y-2">
                <p className={`text-[10px] font-black uppercase mb-3 ${g === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>{g.toUpperCase()}</p>
                {['helmet', 'jacket', 'shirt', 'bag', 'arms', 'legs', 'shoes', 'decal', 'chain', 'vest', 'mask'].map(f => (
                  <div key={f} className="flex flex-col">
                    <span className="text-[8px] text-zinc-600 uppercase font-bold">{f}</span>
                    <input value={formData[g][f] || ''} className="bg-black/40 p-2 rounded border border-white/5 text-[10px] text-white" onChange={e => g === 'male' ? handleMaleChange(f, e.target.value) : handleFemaleChange(f, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => onSave(formData)} className="w-full bg-red-700 py-5 rounded-2xl font-black uppercase text-white hover:bg-red-600 transition mt-10">GUARDAR CAMBIOS EN UNIFORMIDAD</button>
      </div>
    </div>
  );
};

// --- APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [selectedDept, setSelectedDept] = useState(null);
  const [uniforms, setUniforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniform, setSelectedUniform] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingUniform, setEditingUniform] = useState(null);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentHeroIdx((prev) => (prev + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
    signInAnonymously(auth);
  }, []);

  useEffect(() => {
    if (!user) return;
    const uniformsRef = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
    return onSnapshot(uniformsRef, (snapshot) => {
      setUniforms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [user]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const saveUniform = async (formData) => {
    const { male, female, imageUrls, portada, ...rest } = formData;
    const urls = imageUrls.split(',').map(s => s.trim()).filter(s => s);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'uniforms'), {
      ...rest, portada: portada || urls[0], maleIds: male, femaleIds: female, imageUrls: urls
    });
    setShowAddModal(false);
    notify("Uniformidad registrada.");
  };

  const updateUniform = async (formData) => {
    const { id, male, female, imageUrls, portada, ...rest } = formData;
    const urls = typeof imageUrls === 'string' ? imageUrls.split(',').map(s => s.trim()).filter(s => s) : imageUrls;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'uniforms', id), {
      ...rest, portada, maleIds: male, femaleIds: female, imageUrls: urls
    }, { merge: true });
    setEditingUniform(null);
    notify("Uniformidad actualizada.");
  };

  const deleteUniform = async (id) => {
    if(!window.confirm("¿Borrar uniforme?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'uniforms', id));
    notify("Uniforme eliminado.");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-700/50 font-sans tracking-tight">
      <nav className="fixed w-full z-[60] bg-black/60 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => {setView('landing'); setSelectedDept(null);}}>
          <img src={LOGO_URL} className="h-12 w-12" alt="SAFD" />
          <div className="text-left hidden sm:block">
            <h1 className="text-xl font-black italic uppercase leading-none">SAFD UNIFORMIDAD</h1>
            <p className="text-[9px] text-[#d4af37] font-bold tracking-[0.3em] uppercase">San Andreas Fire & Rescue</p>
          </div>
        </div>
        <div className="flex gap-6">
          {!isAdmin ? (
            <button onClick={() => setShowLoginModal(true)} className="bg-red-700 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">JEFATURA</button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(true)} className="bg-green-600 p-3 rounded-full text-white"><Plus size={16}/></button>
              <button onClick={() => setIsAdmin(false)} className="bg-zinc-800 px-6 py-3 rounded-full text-[10px] font-black uppercase text-white">SALIR</button>
            </div>
          )}
        </div>
      </nav>

      {view === 'landing' ? (
        <div className="animate-in fade-in duration-1000">
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/80 z-10"></div>
            {HERO_IMAGES.map((img, idx) => <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentHeroIdx ? 'opacity-40' : 'opacity-0'}`} alt="Hero" />)}
            <div className="relative z-20 text-center">
              {/* Animación animate-pulse restaurada aquí */}
              <img src={LOGO_URL} className="h-48 w-48 mx-auto mb-10 drop-shadow-[0_0_50px_rgba(185,28,28,0.5)] animate-pulse" alt="Logo" />
              <h2 className="text-[#d4af37] text-xs font-black tracking-[1.5em] mb-6 uppercase italic">UNIFORMIDAD • SISTEMA</h2>
              <h1 className="text-7xl md:text-[11rem] font-black italic uppercase leading-none tracking-tighter text-white">SAFD <span className="text-red-700">PORTAL</span></h1>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 py-32">
            <h2 className="text-5xl font-black italic uppercase mb-20 text-left">Divisiones <span className="text-red-700">Tácticas</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <DepartmentCard icon={Plane} title="AIR OPS" desc="Extinción aérea y montaña." onClick={() => {setView('department'); setSelectedDept('AIR OPS');}} />
              <DepartmentCard icon={Search} title="FIRE MARSHAL" desc="Investigación y prevención." onClick={() => {setView('department'); setSelectedDept('FIRE MARSHAL');}} />
              <DepartmentCard icon={Radio} title="R.T.D." desc="Entrenamiento y formación." onClick={() => {setView('department'); setSelectedDept('R.T.D.');}} />
              <DepartmentCard icon={Anchor} title="MARINE" desc="Salvamento marítimo." onClick={() => {setView('department'); setSelectedDept('MARINE');}} />
              <DepartmentCard icon={Flame} title="WILDLAND" desc="Incendios forestales." onClick={() => {setView('department'); setSelectedDept('WILDLAND');}} />
              <DepartmentCard icon={Stethoscope} title="PARAMEDIC" desc="Urgencias críticas." onClick={() => {setView('department'); setSelectedDept('PARAMEDIC');}} />
              <DepartmentCard icon={Biohazard} title="HAZMAT" color="bg-yellow-600" desc="Materiales químicos." onClick={() => {setView('department'); setSelectedDept('HAZMAT');}} />
              <DepartmentCard icon={Users} title="VOLUNTEER" color="bg-blue-800" desc="Personal en prácticas." onClick={() => {setView('department'); setSelectedDept('VOLUNTEER');}} />
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 text-left">
            <h2 className="text-5xl font-black italic uppercase mb-10">Manual <span className="text-red-700">Vestuario</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {uniforms.filter(u => u.dept === 'General' || !u.dept).map(u => <UniformCard key={u.id} uniform={u} isAdmin={isAdmin} onDelete={deleteUniform} onSelect={setSelectedUniform} onEdit={setEditingUniform} />)}
            </div>
          </section>
        </div>
      ) : (
        <div className="pt-32 pb-32 max-w-7xl mx-auto px-6 text-left min-h-screen">
          <button onClick={() => {setView('landing'); setSelectedDept(null);}} className="text-zinc-500 hover:text-red-500 mb-12 font-black uppercase text-[10px] flex items-center gap-2"><ArrowLeft size={16}/> Volver</button>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase mb-20">{selectedDept}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {uniforms.filter(u => u.dept === selectedDept).map(u => <UniformCard key={u.id} uniform={u} isAdmin={isAdmin} onDelete={deleteUniform} onSelect={setSelectedUniform} onEdit={setEditingUniform} />)}
          </div>
        </div>
      )}

      {selectedUniform && <UniformDetail uniform={selectedUniform} onClose={() => setSelectedUniform(null)} />}
      {showAddModal && <AddUniformModal onSave={saveUniform} onClose={() => setShowAddModal(false)} />}
      {showLoginModal && <LoginModal onLogin={() => setIsAdmin(true)} onClose={() => setShowLoginModal(false)} />}
      {editingUniform && <EditUniformModal uniform={editingUniform} onSave={updateUniform} onClose={() => setEditingUniform(null)} />}
      
      {notification && (
        <div className="fixed bottom-10 right-10 z-[300] p-6 rounded-3xl bg-zinc-900 border border-[#d4af37]/30 shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500">
          <AlertCircle size={20} className="text-[#d4af37]" />
          <span className="font-bold uppercase text-[10px] text-white tracking-widest">{notification}</span>
        </div>
      )}

      <footer className="py-40 border-t border-white/5 text-center opacity-30">
        <p className="text-zinc-700 text-[10px] uppercase font-black tracking-[1em] mb-4 text-center">SAFD UNIFORMIDAD • STATE OF SAN ANDREAS</p>
      </footer>
    </div>
  );
}