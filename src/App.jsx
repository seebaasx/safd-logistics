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

// Estas líneas son las que te faltaban para quitar el error de "auth":
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
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover/carousel:opacity-100 z-20"
          >
            <ChevronLeft size={20}/>
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-red-600 transition opacity-0 group-hover/carousel:opacity-100 z-20"
          >
            <ChevronRight size={20}/>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === idx ? 'w-6 bg-red-600' : 'w-2 bg-white/20'}`}></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const UniformCard = ({ uniform, isAdmin, onDelete, onSelect }) => (
  <div 
    onClick={() => onSelect(uniform)}
    className="group relative bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-red-600/50 transition-all duration-500"
  >
    <div className="aspect-[square] overflow-hidden">
      <img src={uniform.portada || (uniform.imageUrls ? uniform.imageUrls[0] : uniform.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000 opacity-80 group-hover:opacity-100" alt={uniform.name} />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent text-left p-8 flex flex-col justify-end">
      <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-[0.3em]">{uniform.category}</span>
      <div className="flex justify-between items-end">
        <h4 className="text-3xl font-black italic uppercase leading-none mt-1">{uniform.name}</h4>
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full group-hover:bg-red-600 group-hover:scale-110 transition duration-300">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
    {isAdmin && (
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(uniform.id); }}
        className="absolute top-6 right-6 bg-red-900/90 p-2.5 rounded-xl hover:bg-red-600 z-10 transition-all hover:scale-110"
      >
        <Trash2 size={18} />
      </button>
    )}
  </div>
);

const DepartmentCard = ({ icon: Icon, title, desc, onClick, color = "bg-red-600" }) => (
  <div 
    onClick={onClick}
    className="group bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] hover:border-red-600/30 transition-all duration-500 hover:translate-y-[-5px] cursor-pointer"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-900/20 group-hover:scale-110 transition duration-500`}>
      <Icon size={28} className="text-white" />
    </div>
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-black mb-3 italic uppercase tracking-tight text-left">{title}</h3>
      <ChevronRight size={18} className="text-zinc-700 group-hover:text-red-500 transition" />
    </div>
    <p className="text-zinc-500 text-sm leading-relaxed font-medium text-left">{desc}</p>
  </div>
);

const UniformDetail = ({ uniform, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose}></div>
    <div className="relative bg-[#0a0a0a] w-full max-w-6xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row h-full lg:h-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
      
      <div className="w-full lg:w-1/2 relative bg-zinc-950 min-h-[40vh] lg:min-h-0">
        <UniformCarousel images={uniform.imageUrls || [uniform.imageUrl]} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0a0a0a] pointer-events-none"></div>
        <button onClick={onClose} className="absolute top-8 left-8 bg-black/60 p-4 rounded-full hover:bg-red-600 transition-all hover:scale-110 z-30"><X/></button>
      </div>

      <div className="w-full lg:w-1/2 p-8 lg:p-14 overflow-y-auto relative text-left">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
           <img src={uniform.imageUrls?.[0] || uniform.imageUrl} className="w-full h-full object-cover blur-3xl scale-150" alt="Fondo desenfocado" />
        </div>
        <div className="relative z-10">
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-red-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest italic">{uniform.category}</span>
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Shield size={14} className="text-[#d4af37]"/> {uniform.dept}
              </span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter">{uniform.name}</h2>
            <p className="mt-6 text-zinc-500 font-medium text-base leading-relaxed">{uniform.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Hombre', 'Mujer'].map(gender => (
              <div key={gender} className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 transition-all">
                <div className={`flex items-center gap-4 mb-8 border-b border-white/10 pb-5 ${gender === 'Hombre' ? 'text-blue-400' : 'text-pink-400'}`}>
                  <User size={18}/>
                  <h3 className="font-black italic uppercase tracking-widest">MODELO {gender.toUpperCase()}</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries({
  'Casco': gender === 'Hombre' ? uniform.maleIds?.helmet : uniform.femaleIds?.helmet,
  'Chaqueta': gender === 'Hombre' ? uniform.maleIds?.jacket : uniform.femaleIds?.jacket,
  'Camiseta': gender === 'Hombre' ? uniform.maleIds?.shirt : uniform.femaleIds?.shirt,
  'Bolsa': gender === 'Hombre' ? uniform.maleIds?.bag : uniform.femaleIds?.bag,
  'Brazos': gender === 'Hombre' ? uniform.maleIds?.arms : uniform.femaleIds?.arms,
  'Piernas': gender === 'Hombre' ? uniform.maleIds?.legs : uniform.femaleIds?.legs,
  'Zapatos': gender === 'Hombre' ? uniform.maleIds?.shoes : uniform.femaleIds?.shoes,
  'Calcomanía': gender === 'Hombre' ? uniform.maleIds?.decal : uniform.femaleIds?.decal,
  'Cadena': gender === 'Hombre' ? uniform.maleIds?.chain : uniform.femaleIds?.chain,
  'Chaleco': gender === 'Hombre' ? uniform.maleIds?.vest : uniform.femaleIds?.vest,
  'Máscara': gender === 'Hombre' ? uniform.maleIds?.mask : uniform.femaleIds?.mask,
})
.filter(([_, v]) => v && v !== '' && v !== '0') // <--- ESTO ES LO QUE OCULTA LOS VACÍOS
.map(([k, v]) => (
  <div key={k} className="flex justify-between items-center group/item">
    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{k}</span>
    <span className="text-xs font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10 group-hover/item:border-red-600/50 transition">
      {v}
    </span>
  </div>
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
    if (pass === "SAFD2026") {
      onLogin();
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative bg-[#111] w-full max-w-md p-10 rounded-3xl border ${error ? 'border-red-600' : 'border-[#d4af37]/30'} shadow-2xl transition-all duration-300`}>
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 bg-zinc-900 border ${error ? 'border-red-600' : 'border-[#d4af37]/30'}`}>
             <Lock className={error ? 'text-red-600' : 'text-[#d4af37]'} size={32} />
          </div>
          <h2 className="text-[#d4af37] text-xl font-black italic uppercase tracking-widest text-center">SISTEMA LOGÍSTICO</h2>
          <p className="text-zinc-600 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold italic text-center">Área Restringida - SAFD Jefatura</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password"
            autoFocus
            placeholder="••••••••" 
            className="w-full bg-[#1c1c1c] p-5 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold text-center text-2xl tracking-[0.4em] transition-all text-white" 
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          <button type="submit" className="w-full bg-[#b91c1c] py-5 rounded-xl font-black uppercase tracking-widest hover:bg-red-600 transition-all text-sm shadow-xl shadow-red-900/10">AUTORIZAR ACCESO</button>
        </form>
      </div>
    </div>
  );
};

const AddUniformModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
  name: '', 
  category: 'Reglamentario', 
  dept: 'General', 
  description: '', 
  imageUrls: '', 
  portada: '', // <--- Nueva propiedad para la imagen 1080x1080
  male: { 
    helmet: '', // <--- Añadido Casco Hombre
    jacket: '', shirt: '', bag: '', arms: '', legs: '', shoes: '', decal: '', chain: '', vest: '', mask: '' 
  },
  female: { 
    helmet: '', // <--- Añadido Casco Mujer
    jacket: '', shirt: '', bag: '', arms: '', legs: '', shoes: '', decal: '', chain: '', vest: '', mask: '' 
  }
});

  const handleMaleChange = (field, val) => setFormData(prev => ({...prev, male: {...prev.male, [field]: val}}));
  const handleFemaleChange = (field, val) => setFormData(prev => ({...prev, female: {...prev.female, [field]: val}}));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 text-white">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#0d0d0d] w-full max-w-5xl p-10 rounded-[2.5rem] border border-[#d4af37]/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
          <h2 className="text-[#d4af37] text-2xl font-black italic uppercase tracking-widest text-left">REGISTRAR NUEVO UNIFORME</h2>
          <X onClick={onClose} className="text-zinc-600 hover:text-white cursor-pointer transition-all" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
          <div className="space-y-6">
            <div>
              <label className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em] block mb-3 italic">Información Principal</label>
              <div className="space-y-4">
                <input value={formData.name} placeholder="Nombre del Uniforme" className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold" onChange={e => setFormData({...formData, name: e.target.value})} />
                {/* 2. PEGA ESTE AQUÍ ABAJO (La Portada) */}
<input 
  value={formData.portada} 
  placeholder="URL Portada Principal (1080x1080)" 
  className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold" 
  onChange={e => setFormData({...formData, portada: e.target.value})} 
/>
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.category} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold" onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Reglamentario</option><option>Departamento</option><option>Actualizado</option>
                  </select>
                  <select value={formData.dept} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold" onChange={e => setFormData({...formData, dept: e.target.value})}>
                    <option>General</option><option>AIR OPS</option><option>FIRE MARSHAL</option><option>R.T.D.</option><option>MARINE</option><option>WILDLAND</option><option>PARAMEDIC</option><option>HAZMAT</option><option>VOLUNTEER</option>
                  </select>
                </div>
                <textarea value={formData.description} placeholder="Descripción táctica..." rows="3" className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-bold resize-none" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>
            <div>
              <label className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em] block mb-3 italic">Galería Multimedia (URLs de FiveManage separadas por comas)</label>
              <textarea value={formData.imageUrls} placeholder="URL1, URL2, URL3..." className="w-full bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-[#d4af37] outline-none font-mono text-[10px] h-32" onChange={e => setFormData({...formData, imageUrls: e.target.value})}></textarea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {['male', 'female'].map(g => (
              <div key={g} className="space-y-3">
                 <p className={`text-[11px] font-black uppercase border-b border-white/10 pb-3 ${g === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>{g === 'male' ? 'HOMBRE' : 'MUJER'} (IDs)</p>
                 {['jacket', 'shirt', 'bag', 'arms', 'legs', 'shoes', 'decal', 'chain', 'vest', 'mask'].map(f => (
                   <div key={f} className="flex flex-col">
                      <span className="text-[9px] text-zinc-600 font-bold uppercase mb-1">{f}</span>
                      <input value={formData[g][f]} className="bg-black/40 p-2 rounded border border-white/5 text-[10px] focus:border-red-600 outline-none" onChange={e => g === 'male' ? handleMaleChange(f, e.target.value) : handleFemaleChange(f, e.target.value)} />
                   </div>
                 ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-12">
          <button onClick={() => onSave(formData)} className="flex-1 bg-red-700 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition shadow-xl shadow-red-900/10">ARCHIVAR EN ALMACÉN CENTRAL</button>
          <button onClick={onClose} className="px-10 bg-zinc-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition">CANCELAR</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL APP ---

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
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentHeroIdx((prev) => (prev + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const uniformsRef = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
    const unsubscribe = onSnapshot(uniformsRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUniforms(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const notify = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const deleteUniform = async (id) => {
    if(!isAdmin) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'uniforms', id));
    notify("Uniforme retirado de logística.");
  };

  const saveUniform = async (formData) => {
    const { male, female, imageUrls, ...rest } = formData;
    const urls = imageUrls.split(',').map(s => s.trim()).filter(s => s);
    
    const uniformsRef = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
    await addDoc(uniformsRef, {
      ...rest,
      maleIds: male, // Guardamos con el nombre de propiedad que espera el detalle
      femaleIds: female, // Guardamos con el nombre de propiedad que espera el detalle
      imageUrls: urls.length > 0 ? urls : ["https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?q=80&w=800"]
    });
    
    setShowAddModal(false);
    notify("Base de datos de uniformes actualizada.");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-700/50 font-sans tracking-tight">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-[60] bg-black/60 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {setView('landing'); setSelectedDept(null);}}>
            <img src={LOGO_URL} className="h-12 w-12 group-hover:scale-110 transition duration-500" alt="SAFD" />
            <div className="hidden sm:block text-left">
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none group-hover:text-red-500 transition">SAFD LOGISTICS</h1>
              <p className="text-[9px] text-[#d4af37] font-bold tracking-[0.3em] uppercase mt-1">San Andreas Fire & Rescue</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => {setView('landing'); setSelectedDept(null);}} className="text-[11px] font-black uppercase tracking-widest hover:text-red-500 transition">Portal Inicio</button>
            {!isAdmin ? (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 px-6 py-3 rounded-full text-[10px] font-black transition uppercase tracking-widest shadow-lg shadow-red-900/20 text-white">
                <Lock size={12}/> Jefatura
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-500 p-3 rounded-full transition shadow-lg shadow-green-900/20 text-white"><Plus size={16}/></button>
                <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-full text-[10px] font-black transition uppercase text-white">
                  <Unlock size={12}/> Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {view === 'landing' ? (
        <div className="animate-in fade-in duration-1000">
          {/* HERO */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/80 z-10"></div>
              {HERO_IMAGES.map((img, idx) => (
                <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentHeroIdx ? 'opacity-40 scale-100' : 'opacity-0 scale-110'}`} alt="Fondo Hero" />
              ))}
            </div>
            <div className="relative z-20 text-center px-6 max-w-5xl">
              <img src={LOGO_URL} className="h-48 w-48 mx-auto mb-10 drop-shadow-[0_0_50px_rgba(185,28,28,0.5)] animate-pulse" alt="Logo Principal" />
              <h2 className="text-[#d4af37] text-xs font-black tracking-[1.5em] uppercase mb-6">LOGISTICS • SYSTEM</h2>
              <h1 className="text-7xl md:text-[11rem] font-black italic uppercase leading-[0.75] tracking-tighter mb-10 text-white">SAFD <span className="text-red-700 block md:inline">PORTAL</span></h1>
              <p className="max-w-2xl mx-auto text-zinc-400 text-xl font-medium leading-relaxed italic">Gestión táctica de activos y estandarización de componentes técnicos del Estado de San Andreas.</p>
            </div>
          </section>

          {/* DEPARTAMENTOS */}
          <section className="max-w-7xl mx-auto px-6 py-32 text-left">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-20 text-white">Divisiones <span className="text-red-700">Tácticas</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <DepartmentCard icon={Plane} title="AIR OPS" desc="Extinción aérea, búsqueda y rescate en montaña." onClick={() => {setView('department'); setSelectedDept('AIR OPS');}} />
              <DepartmentCard icon={Search} title="FIRE MARSHAL" desc="Investigación, prevención y peritaje legal." onClick={() => {setView('department'); setSelectedDept('FIRE MARSHAL');}} />
              <DepartmentCard icon={Radio} title="R.T.D." color="bg-zinc-800" desc="Entrenamiento táctico y formación académica." onClick={() => {setView('department'); setSelectedDept('R.T.D.');}} />
              <DepartmentCard icon={Anchor} title="MARINE" desc="Salvamento marítimo y operaciones subacuáticas." onClick={() => {setView('department'); setSelectedDept('MARINE');}} />
              <DepartmentCard icon={Flame} title="WILDLAND" desc="Combate de incendios en interfaz forestal." onClick={() => {setView('department'); setSelectedDept('WILDLAND');}} />
              <DepartmentCard icon={Stethoscope} title="PARAMEDIC" desc="Soporte vital avanzado y urgencias críticas." onClick={() => {setView('department'); setSelectedDept('PARAMEDIC');}} />
              <DepartmentCard icon={Biohazard} title="HAZMAT" color="bg-yellow-600" desc="Materiales químicos y radiológicos peligrosos." onClick={() => {setView('department'); setSelectedDept('HAZMAT');}} />
              <DepartmentCard icon={Users} title="VOLUNTEER" color="bg-blue-800" desc="Reserva logística y personal en prácticas." onClick={() => {setView('department'); setSelectedDept('VOLUNTEER');}} />
            </div>
          </section>

          {/* CATÁLOGO GENERAL */}
          <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 text-left">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-10 text-white">Manual <span className="text-red-700">Vestuario</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {/* Filtramos estrictamente por los que NO tienen departamento asignado para el catálogo general */}
              {uniforms.filter(u => u.dept === 'General' || !u.dept || u.dept === '').map(u => (
                <UniformCard key={u.id} uniform={u} isAdmin={isAdmin} onDelete={deleteUniform} onSelect={setSelectedUniform} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="pt-32 pb-32 max-w-7xl mx-auto px-6 min-h-screen text-left animate-in slide-in-from-right duration-700">
          <button onClick={() => {setView('landing'); setSelectedDept(null);}} className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition mb-12 font-black uppercase text-[10px] tracking-widest text-white">
            <ArrowLeft size={16}/> Volver al Portal General
          </button>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-20 text-white">{selectedDept}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {uniforms.filter(u => u.dept === selectedDept).map(u => (
              <UniformCard key={u.id} uniform={u} isAdmin={isAdmin} onDelete={deleteUniform} onSelect={setSelectedUniform} />
            ))}
          </div>
        </div>
      )}

      {/* ELEMENTOS GLOBALES (MODALES) */}
      {selectedUniform && <UniformDetail uniform={selectedUniform} onClose={() => setSelectedUniform(null)} />}
      {showAddModal && <AddUniformModal onSave={saveUniform} onClose={() => setShowAddModal(false)} />}
      {showLoginModal && <LoginModal onLogin={() => setIsAdmin(true)} onClose={() => setShowLoginModal(false)} />}
      
      {notification && (
        <div className={`fixed bottom-10 right-10 z-[300] p-6 rounded-3xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right duration-500 ${notification.type === 'error' ? 'bg-red-950 border-red-600' : 'bg-zinc-900 border-[#d4af37]/30'}`}>
          <AlertCircle size={20} className={notification.type === 'error' ? 'text-red-600' : 'text-[#d4af37]'} />
          <span className="font-bold uppercase text-[10px] tracking-widest text-white">{notification.msg}</span>
        </div>
      )}

      <footer className="bg-black py-40 border-t border-white/5 mt-40 text-center">
        <img src={LOGO_URL} className="h-24 w-24 mx-auto mb-10 opacity-20 grayscale" alt="Logo Footer" />
        <p className="text-zinc-700 text-[10px] uppercase font-black tracking-[1em] mb-4">SAFD LOGISTICS • STATE OF SAN ANDREAS</p>
      </footer>
    </div>
  );
}