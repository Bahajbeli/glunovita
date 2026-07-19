'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { FiFileText, FiTrash2, FiPlus, FiEdit2, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface Ingredient {
  _id: string;
  name: string;
  grammage: number;
  price: number;
}

interface RecipeIngredient {
  ingredient: string;
  grammage: number;
}

interface Recipe {
  _id: string;
  name: string;
  description: string;
  price: number;
  margin: number;
  recipeIngredients: {
    ingredient: Ingredient;
    grammage: number;
  }[];
  image?: string;
}

export default function AdminRecipes() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'FOOD', // Recipes always default to FOOD
    isRecipe: true,
    margin: 15, // default 15% margin
    stock: 999, // default infinite for recipes
    image: '',
    recipeIngredients: [] as RecipeIngredient[]
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'ADMIN') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      const [resRecipes, resIng] = await Promise.all([
        api.get('/products/admin/all'), // We will filter isRecipe below
        api.get('/ingredients')
      ])
      // Filter only active recipes
      setRecipes(resRecipes.data.data.products.filter((p: any) => p.isRecipe && p.isActive !== false))
      setIngredientsList(resIng.data.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe._id)
    setFormData({
      name: recipe.name,
      description: recipe.description,
      category: 'FOOD',
      isRecipe: true,
      margin: recipe.margin || 0,
      stock: 999,
      image: recipe.image || '',
      recipeIngredients: recipe.recipeIngredients
        .filter(ri => ri && ri.ingredient)
        .map(ri => ({
          ingredient: typeof ri.ingredient === 'object' ? ri.ingredient._id : ri.ingredient,
          grammage: ri.grammage
        }))
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    const toastId = toast.loading("Téléchargement de l'image en cours...");
    try {
      const res = await api.post('/upload', uploadData);
      setFormData(prev => ({ ...prev, image: res.data.url }));
      toast.success("Image téléchargée avec succès", { id: toastId });
    } catch (error: any) {
      toast.error("Erreur lors du téléchargement de l'image", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.recipeIngredients.length === 0) {
      return toast.error('Veuillez ajouter au moins un ingrédient')
    }

    try {
      // The backend will automatically calculate the price and save it
      if (editingId) {
        await api.put(`/products/${editingId}`, formData)
        toast.success('Recette mise à jour')
      } else {
        await api.post('/products', formData)
        toast.success('Recette ajoutée avec succès')
      }
      setEditingId(null)
      setFormData({ name: '', description: '', category: 'FOOD', isRecipe: true, margin: 15, stock: 999, image: '', recipeIngredients: [] })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      try {
        await api.delete(`/products/${id}`)
        toast.success('Supprimée avec succès')
        fetchData()
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const addIngredientToRecipe = () => {
    const availableIngredient = ingredientsList.find(ing => !formData.recipeIngredients.some(ri => ri.ingredient === ing._id));
    if (availableIngredient) {
      setFormData(prev => ({
        ...prev,
        recipeIngredients: [...prev.recipeIngredients, { ingredient: availableIngredient._id, grammage: 100 }]
      }))
    } else {
      toast.error('Tous les ingrédients disponibles sont déjà dans la recette.');
    }
  }

  const updateRecipeIngredient = (index: number, field: string, value: string) => {
    const newList = [...formData.recipeIngredients]
    newList[index] = { ...newList[index], [field]: field === 'grammage' ? Number(value) : value }
    setFormData(prev => ({ ...prev, recipeIngredients: newList }))
  }

  const removeRecipeIngredient = (index: number) => {
    const newList = [...formData.recipeIngredients]
    newList.splice(index, 1)
    setFormData(prev => ({ ...prev, recipeIngredients: newList }))
  }

  // Calculate realtime cost
  const calculatedCost = formData.recipeIngredients.reduce((total, ri) => {
    const ing = ingredientsList.find(i => i._id === ri.ingredient)
    if (ing && ing.grammage > 0) {
      return total + ((ing.price / ing.grammage) * ri.grammage)
    }
    return total
  }, 0)

  if (authLoading || loading) return <Layout><div className="flex justify-center p-8"><div className="spinner"></div></div></Layout>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <Layout>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <FiFileText className="text-primary-600" />
          Gestion des Recettes
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Modifier la recette' : 'Créer une Recette'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la recette *</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ex: Cake Sans Gluten" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image (URL ou Fichier)</label>
                <div className="flex gap-2 items-center">
                  <input type="text" className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://exemple.com/image.jpg ou /uploads/..." />
                  <label className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-200 border transition whitespace-nowrap text-sm font-medium">
                    Parcourir...
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Ingrédients *</label>
                  <button type="button" onClick={addIngredientToRecipe} className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-lg font-medium transition flex items-center gap-1">
                    <FiPlus /> Ajouter
                  </button>
                </div>
                
                {formData.recipeIngredients.length === 0 && (
                  <p className="text-xs text-slate-400 italic mb-2">Aucun ingrédient ajouté.</p>
                )}

                <div className="space-y-2 mb-4">
                  {formData.recipeIngredients.map((ri, index) => (
                    <div key={index} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <select 
                          className="w-full p-1.5 text-sm border rounded bg-white outline-none focus:ring-1 focus:ring-primary-500"
                          value={ri.ingredient}
                          onChange={e => updateRecipeIngredient(index, 'ingredient', e.target.value)}
                        >
                          {ingredientsList.map(ing => {
                            const isAlreadySelected = formData.recipeIngredients.some((otherRi, otherIndex) => otherIndex !== index && otherRi.ingredient === ing._id);
                            return (
                              <option key={ing._id} value={ing._id} disabled={isAlreadySelected}>
                                {ing.name} ({(ing.price / ing.grammage * 1000).toFixed(2)} DT/kg)
                              </option>
                            );
                          })}
                        </select>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            className="w-20 p-1.5 text-sm border rounded bg-white outline-none focus:ring-1 focus:ring-primary-500"
                            value={ri.grammage}
                            onChange={e => updateRecipeIngredient(index, 'grammage', e.target.value)}
                          />
                          <span className="text-xs text-slate-500 font-medium">grammes</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeRecipeIngredient(index)} className="text-rose-400 hover:text-rose-600 p-1">
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marge Bénéficiaire (%)</label>
                <input required type="number" min="0" step="1" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.margin} onChange={e => setFormData({...formData, margin: Number(e.target.value)})} placeholder="ex: 15" />
              </div>
              
              <div className="bg-slate-800 text-white p-4 rounded-xl shadow-inner space-y-2">
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-sm font-medium">Coût de revient</span>
                  <span className="font-semibold">{calculatedCost.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-600 pt-2">
                  <span className="text-sm font-medium">Prix de vente final (+{formData.margin}%)</span>
                  <span className="text-xl font-bold text-green-400">{(calculatedCost * (1 + formData.margin / 100)).toFixed(3)} DT</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition flex justify-center items-center gap-2 font-medium">
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                  {editingId ? 'Enregistrer' : 'Créer & Publier'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {
                    setEditingId(null)
                    setFormData({ name: '', description: '', category: 'FOOD', isRecipe: true, margin: 15, stock: 999, image: '', recipeIngredients: [] })
                  }} className="bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300 transition font-medium">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl overflow-hidden h-fit">
            <h2 className="text-lg font-semibold mb-4">Recettes en Boutique ({recipes.length})</h2>
            <div className="grid gap-4">
              {recipes.map(recipe => (
                <div key={recipe._id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition bg-white flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    {recipe.image ? (
                      <img src={getImageUrl(recipe.image)} alt={recipe.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-slate-100" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-300 text-2xl">🍲</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{recipe.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{recipe.description}</p>
                      
                      <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Composition :</p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.recipeIngredients?.map((ri, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {ri.ingredient?.name}
                            <span className="bg-white/50 px-1 rounded text-primary-600">{ri.grammage}g</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 min-w-[120px]">
                    <div className="text-center sm:text-right">
                      <span className="block text-xs text-slate-400 font-medium">Prix de vente</span>
                      <span className="text-lg font-bold text-primary-600">{recipe.price.toFixed(3)} DT</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(recipe)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition" title="Modifier">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(recipe._id)} className="text-rose-500 hover:text-rose-700 p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition" title="Supprimer">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {recipes.length === 0 && (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  Aucune recette publiée pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
