import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  User, 
  ChevronRight, 
  X, 
  Trash2, 
  Plus, 
  LogIn, 
  LogOut, 
  Edit2, 
  AlertCircle,
  ChevronLeft,
  Shield,
  Search,
  Info
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE (Mantén tu configuración aquí) ---
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
const appId = "safd-uniformidad"; // ID de tu aplicación

// --- COMPONENTE: TARJETA DE UNIFORME ---
const UniformCard = ({ uniform, isAdmin, onDelete, onSelect, onEdit }) => (
  <div 
    onClick={() => onSelect(uniform)}
    className="group relative bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-blue-600/50 transition-all duration-500 shadow-2xl"
  >
    <div className="aspect-square overflow-hidden">
      <img 
        src={uniform.portada || (uniform.imageUrls ? uniform.imageUrls[0] : '')} 
        className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 opacity-80 group-hover:opacity-100" 
        alt={uniform.name} 
      />
    </div>

    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 flex flex-col justify-end text-left">
      <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] mb-1">{uniform.category}</span>
      <div className="flex justify-between items-end">
        <h4 className="text-2xl font-black italic uppercase leading-none text-white">{uniform.name}</h4>
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full group-hover:bg-blue-600 group-hover:rotate-90 transition duration-500 text-white">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>

    {isAdmin && (
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(uniform); }}
          className="bg-blue-600/90 p-2.5 rounded-xl hover:bg-blue-500 transition-all hover:scale-110 text-white shadow-lg"
        >
          <Edit2 size={18} />
        </button>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(uniform.id); }}
          className="bg-red-900/90 p-2.5 rounded-xl hover:bg-red-600 transition-all hover:scale-110 text-white shadow-lg"
        >
          <Trash2 size={18} />
        </button>
      </div>
    )}
  </div>
);

// --- APLICACIÓN PRINCIPAL ---
export default function App() {
  const [uniforms, setUniforms] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUniform, setEditingUniform] = useState(null);
  const [selectedUniform, setSelectedUniform] = useState(null);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Aquí podrías añadir lógica para verificar si es admin real
        setIsAdmin(true); 
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const uniformsRef = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
    const q = query(uniformsRef, orderBy('category', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUniforms(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveUniform = async (formData) => {
    try {
      const { male, female, imageUrls, portada, ...rest } = formData;
      const urls = imageUrls.split(',').map(s => s.trim()).filter(s => s);
      const uniformsRef = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
      
      await addDoc(uniformsRef, {
        ...rest,
        portada: portada || urls[0],
        maleIds: male,
        femaleIds: female,
        imageUrls: urls,
        createdAt: new Date().toISOString()
      });
      
      setShowAddModal(false);
      notify("Nueva uniformidad registrada", "success");
    } catch (error) {
      notify("Error al guardar", "error");
    }
  };

  const updateUniform = async (formData) => {
    try {
      const { id, male, female, imageUrls, portada, ...rest } = formData;
      const urls = typeof imageUrls === 'string' 
        ? imageUrls.split(',').map(s => s.trim()).filter(s => s) 
        : imageUrls;
      
      const uniformRef = doc(db, 'artifacts', appId, 'public', 'data', 'uniforms', id);
      await setDoc(uniformRef, {
        ...rest,
        portada: portada,
        maleIds: male,
        femaleIds: female,
        imageUrls: urls,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setEditingUniform(null);
      notify("Uniformidad actualizada", "success");
    } catch (error) {
      notify("Error al actualizar", "error");
    }
  };

  const deleteUniform = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este uniforme?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'uniforms', id));
      notify("Registro eliminado");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-600/30">
      {/* HEADER / HERO */}
      <header className="relative py-20 px-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)]" />
        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-blue-600" />
            <span className="text-xs font-black tracking-[0.5em] uppercase text-blue-500">San Andreas Fire Dept</span>
            <div className="h-[2px] w-12 bg-blue-600" />
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-8">
            SAFD <span className="text-blue-600">UNIFORMIDAD</span>
          </h1>
          
          <div className="flex gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={20} /> Añadir Equipo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CATÁLOGO */}
      <main className="max-w-7xl mx-auto px-10 pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="font-black uppercase tracking-widest text-xs text-white">Cargando Red de Datos</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {uniforms.map(uniform => (
              <UniformCard 
                key={uniform.id} 
                uniform={uniform} 
                isAdmin={isAdmin}
                onDelete={deleteUniform}
                onSelect={setSelectedUniform}
                onEdit={setEditingUniform}
              />
            ))}
          </div>
        )}
      </main>

      {/* NOTIFICACIONES */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-900 border border-white/10 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">{notification.msg}</span>
        </div>
      )}

      {/* MODALES */}
      {editingUniform && (
        <EditUniformModal 
          uniform={editingUniform} 
          onSave={updateUniform} 
          onClose={() => setEditingUniform(null)} 
        />
      )}

      <footer className="py-20 border-t border-white/5 opacity-30 text-center">
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase">SAFD UNIFORMIDAD • LOS SANTOS LOGISTICS • 2026</p>
      </footer>
    </div>
  );
}

// --- MODAL DE EDICIÓN (AL FINAL DEL ARCHIVO) ---
const EditUniformModal = ({ uniform, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: uniform.id,
    name: uniform.name,
    category: uniform.category,
    dept: uniform.dept || 'General',
    description: uniform.description || '',
    portada: uniform.portada || '',
    imageUrls: Array.isArray(uniform.imageUrls) ? uniform.imageUrls.join(', ') : '',
    male: uniform.maleIds,
    female: uniform.femaleIds
  });

  const handleMaleChange = (field, value) => setFormData({...formData, male: {...formData.male, [field]: value}});
  const handleFemaleChange = (field, value) => setFormData({...formData, female: {...formData.female, [field]: value}});

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#0a0a0a] w-full max-w-5xl rounded-[3rem] p-10 border border-white/10 my-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div className="text-left">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">EDITAR <span className="text-blue-600">UNIFORMIDAD</span></h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">ID REGISTRO: {uniform.id}</p>
          </div>
          <button onClick={onClose} className="bg-white/5 p-4 rounded-2xl hover:bg-red-600 text-white transition-all hover:rotate-90">
            <X size={20}/>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Nombre del Equipo</span>
                <input value={formData.name} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-blue-600 outline-none text-white font-bold" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase ml-2">URL Portada Principal</span>
                <input value={formData.portada} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-blue-600 outline-none text-white text-xs font-mono" onChange={e => setFormData({...formData, portada: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Categoría</span>
                <select value={formData.category} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-blue-600 outline-none text-white font-bold" onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="OFICIAL">OFICIAL</option>
                  <option value="ESPECIALIZADO">ESPECIALIZADO</option>
                  <option value="GALA">GALA</option>
                  <option value="CADETE">CADETE</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Departamento</span>
                <select value={formData.dept} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-blue-600 outline-none text-white font-bold" onChange={e => setFormData({...formData, dept: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Aviación">Aviación</option>
                  <option value="Rescate Marítimo">Rescate Marítimo</option>
                  <option value="USAR">USAR</option>
                  <option value="Bombas">Bombas</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Descripción Técnica</span>
              <textarea value={formData.description} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-blue-600 outline-none text-white h-24 text-sm" onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Galería de Imágenes (Por comas)</span>
              <input value={formData.imageUrls} className="bg-[#161616] p-4 rounded-xl border border-white/5 focus:border-blue-600 outline-none text-white text-[10px] font-mono" onChange={e => setFormData({...formData, imageUrls: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['male', 'female'].map(g => (
              <div key={g} className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <h3 className="font-black uppercase text-[10px] mb-4 text-blue-500 tracking-[0.2em]">{g === 'male' ? 'HOMBRE' : 'MUJER'}</h3>
                <div className="grid grid-cols-2 gap-2 text-left">
                  {['helmet', 'jacket', 'shirt', 'bag', 'arms', 'legs', 'shoes', 'decal', 'chain', 'vest', 'mask'].map(f => (
                    <div key={f} className="flex flex-col gap-1">
                      <span className="text-[8px] text-zinc-600 font-bold uppercase ml-1">{f}</span>
                      <input value={formData[g][f]} className="bg-black/40 p-2 rounded-lg border border-white/5 text-[10px] text-white outline-none focus:border-blue-600 text-center uppercase" onChange={e => g === 'male' ? handleMaleChange(f, e.target.value) : handleFemaleChange(f, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => onSave(formData)} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 mt-10 border-b-4 border-blue-800 active:translate-y-1">
          ACTUALIZAR DATOS EN LA RED
        </button>
      </div>
    </div>
  );
};