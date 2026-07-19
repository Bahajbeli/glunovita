'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface RecipeCustomizerProps {
  product: any
  onClose: () => void
  onConfirm: (customizedProduct: any) => void
}

export default function RecipeCustomizer({ product, onClose, onConfirm }: RecipeCustomizerProps) {
  const [ingredientsList, setIngredientsList] = useState<any[]>([])
  const [customIngredients, setCustomIngredients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/ingredients')
      const allIngs = res.data.data
      setIngredientsList(allIngs)

      // Map the product's recipeIngredients to our custom array
      if (product.recipeIngredients && product.recipeIngredients.length > 0) {
        const initial = product.recipeIngredients.map((ri: any) => {
          // ri.ingredient could be an object (populated) or a string (ID)
          const ingId = typeof ri.ingredient === 'object' ? ri.ingredient._id : ri.ingredient
          const fullIng = allIngs.find((i: any) => i._id === ingId)
          return {
            ingredient: ingId,
            name: fullIng?.name || 'Inconnu',
            price: fullIng?.price || 0,
            baseGrammage: fullIng?.grammage || 1,
            grammage: ri.grammage
          }
        })
        setCustomIngredients(initial)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des ingrédients')
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    const available = ingredientsList.find(ing => !customIngredients.some(ci => ci.ingredient === ing._id))
    if (available) {
      setCustomIngredients([...customIngredients, {
        ingredient: available._id,
        name: available.name,
        price: available.price,
        baseGrammage: available.grammage,
        grammage: 100 // default 100g
      }])
    } else {
      toast.error('Tous les ingrédients disponibles sont déjà dans votre composition.')
    }
  }

  const removeIngredient = (index: number) => {
    const newList = [...customIngredients]
    newList.splice(index, 1)
    setCustomIngredients(newList)
  }

  const updateGrammage = (index: number, newGrammage: number) => {
    if (newGrammage < 0) return
    const newList = [...customIngredients]
    newList[index].grammage = newGrammage
    setCustomIngredients(newList)
  }

  const changeIngredient = (index: number, newIngId: string) => {
    const fullIng = ingredientsList.find(i => i._id === newIngId)
    if (!fullIng) return
    const newList = [...customIngredients]
    newList[index] = {
      ingredient: fullIng._id,
      name: fullIng.name,
      price: fullIng.price,
      baseGrammage: fullIng.grammage,
      grammage: newList[index].grammage
    }
    setCustomIngredients(newList)
  }

  const calculatedCost = customIngredients.reduce((total, ci) => {
    if (ci.baseGrammage > 0) {
      return total + ((ci.price / ci.baseGrammage) * ci.grammage)
    }
    return total
  }, 0)

  const marginPercent = product.margin || 0
  const finalPrice = calculatedCost * (1 + marginPercent / 100)

  const handleConfirm = () => {
    const customCartId = `${product._id}-${Date.now()}`
    
    const customizedProduct = {
      ...product,
      _cartId: customCartId,
      customPrice: Number(finalPrice.toFixed(3)),
      customIngredients: customIngredients.map(ci => ({
        ingredient: ci.ingredient,
        name: ci.name,
        grammage: ci.grammage,
        price: ci.price
      }))
    }
    onConfirm(customizedProduct)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Personnaliser</h2>
            <p className="text-gray-500 text-sm">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center p-8"><div className="spinner"></div></div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Composition</h3>
                  <button onClick={addIngredient} className="text-sm bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition">
                    <FiPlus /> Ajouter
                  </button>
                </div>
                
                {customIngredients.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">Aucun ingrédient</p>
                )}

                <div className="space-y-3">
                  {customIngredients.map((ci, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <div className="flex-1">
                        <select 
                          className="w-full text-sm font-medium bg-transparent outline-none text-gray-800"
                          value={ci.ingredient}
                          onChange={(e) => changeIngredient(idx, e.target.value)}
                        >
                          {ingredientsList.map(ing => {
                            const isSelectedElsewhere = customIngredients.some((other, i) => i !== idx && other.ingredient === ing._id)
                            return (
                              <option key={ing._id} value={ing._id} disabled={isSelectedElsewhere}>
                                {ing.name}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <input 
                          type="number"
                          min="0"
                          step="10"
                          value={ci.grammage}
                          onChange={(e) => updateGrammage(idx, Number(e.target.value))}
                          className="w-16 bg-transparent text-center font-medium text-sm outline-none"
                        />
                        <span className="text-xs text-gray-500 font-medium pr-2">g</span>
                      </div>
                      
                      <button onClick={() => removeIngredient(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-500 font-medium">Prix total :</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-teal-600">{finalPrice.toFixed(3)} DT</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition">
              Annuler
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={loading || customIngredients.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition disabled:opacity-50"
            >
              Ajouter au Panier
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
