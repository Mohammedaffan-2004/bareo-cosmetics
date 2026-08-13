export interface UserSkinProfileInput {
  hasProfile?: boolean
  skinType?: string
  concerns?: string[]
  metrics?: {
    hydration?: number
    oilBalance?: number
    sensitivity?: number
    barrier?: number
    acneRisk?: number
    pigmentation?: number
    elasticity?: number
  }
}

export interface RecommendationEngineResult {
  productId: string
  matchPercent: number | null
  reasons: string[]
  keyTags: string[]
  isCompatible: boolean
}

/** Canonical skin types */
export function normalizeSkinType(input?: string): string {
  if (!input) return 'normal'
  const val = input.toLowerCase().trim()
  if (val.includes('oily')) return 'oily'
  if (val.includes('dry')) return 'dry'
  if (val.includes('sensitive')) return 'sensitive'
  if (val.includes('combination')) return 'combination'
  return 'normal'
}

/** Canonical concerns mapper */
export function normalizeConcern(input: string): string {
  const val = input.toLowerCase().trim()
  if (val.includes('acne') || val.includes('pimple') || val.includes('breakout') || val.includes('blackhead')) return 'acne'
  if (val.includes('pigment') || val.includes('dark spot') || val.includes('tan') || val.includes('spot')) return 'pigmentation'
  if (val.includes('dry') || val.includes('flaky') || val.includes('dehydrat')) return 'dryness'
  if (val.includes('oil') || val.includes('shine') || val.includes('sebum') || val.includes('pore')) return 'oiliness'
  if (val.includes('sensitiv') || val.includes('redness') || val.includes('irritat')) return 'sensitivity'
  if (val.includes('aging') || val.includes('wrinkle') || val.includes('fine line')) return 'anti-aging'
  if (val.includes('dark circle') || val.includes('eye')) return 'dark-circles'
  return val
}

/** Extract canonical active ingredient slugs from product ingredients and tags */
export function extractActiveIngredients(product: any): string[] {
  const actives = new Set<string>()
  const tags: string[] = Array.isArray(product.tags) ? product.tags.map((t: string) => t.toLowerCase()) : []
  const ingredients: any[] = Array.isArray(product.ingredients) ? product.ingredients : []

  const searchStr = [
    ...tags,
    ...ingredients.map((i) => (typeof i === 'string' ? i : `${i.name || ''} ${i.description || ''}`).toLowerCase()),
    (product.name || '').toLowerCase(),
    (product.shortDescription || '').toLowerCase(),
  ].join(' ')

  if (searchStr.includes('niacinamide') || searchStr.includes('vitamin b3')) actives.add('niacinamide')
  if (searchStr.includes('salicylic') || searchStr.includes('bha')) actives.add('salicylic-acid')
  if (searchStr.includes('centella') || searchStr.includes('cica')) actives.add('centella')
  if (searchStr.includes('hyaluronic') || searchStr.includes('squalane')) actives.add('hyaluronic-acid')
  if (searchStr.includes('arbutin') || searchStr.includes('rice water')) actives.add('alpha-arbutin')
  if (searchStr.includes('vitamin c') || searchStr.includes('ascorbic')) actives.add('vitamin-c')
  if (searchStr.includes('ceramide')) actives.add('ceramides')
  if (searchStr.includes('retinol') || searchStr.includes('retinal') || searchStr.includes('bakuchiol')) actives.add('retinol')

  return Array.from(actives)
}

/** Format ingredient display string (e.g. Niacinamide 10%) */
function formatIngredientName(ing: any): string {
  if (typeof ing === 'string') return ing
  if (ing.name) {
    return ing.concentration ? `${ing.name} ${ing.concentration}` : ing.name
  }
  return ''
}

/**
 * Pure deterministic recommendation & compatibility engine.
 * Computes suitability score 0-100% and generates explainable reasons.
 */
export function evaluateProductSuitability(
  product: any,
  profile: UserSkinProfileInput
): RecommendationEngineResult {
  const productId = product.id || product._id?.toString() || ''

  // Safety Exclusion Rules: Out of Stock or Inactive
  if ((product.stock !== undefined && product.stock <= 0) || (product.status && product.status !== 'active')) {
    return {
      productId,
      matchPercent: 0,
      reasons: [product.stock === 0 ? 'Product currently out of stock' : 'Product unavailable on storefront'],
      keyTags: ['Unavailable'],
      isCompatible: false,
    }
  }

  // Check if profile exists and has user data
  const hasProfile = profile && (
    profile.hasProfile === true ||
    Boolean(profile.skinType || (profile.concerns && profile.concerns.length > 0) || profile.metrics)
  )

  if (!hasProfile) {
    return {
      productId,
      matchPercent: null,
      reasons: ['Complete skin assessment for personalized matching'],
      keyTags: Array.isArray(product.keyFacts) && product.keyFacts.length > 0 ? product.keyFacts.slice(0, 3) : ['Standard'],
      isCompatible: false,
    }
  }

  const userSkinType = normalizeSkinType(profile.skinType)
  const userConcerns = (profile.concerns || []).map(normalizeConcern)

  const productSkinTypes: string[] = Array.isArray(product.skinTypes)
    ? product.skinTypes.map((s: string) => s.toLowerCase())
    : []
  const productConcerns: string[] = Array.isArray(product.concerns)
    ? product.concerns.map((c: string) => c.toLowerCase())
    : []
  const productTags: string[] = Array.isArray(product.tags)
    ? product.tags.map((t: string) => t.toLowerCase())
    : []
  const activeIngredients = extractActiveIngredients(product)

  let skinTypeScore = 0
  let concernScore = 0
  let metricScore = 0
  let activeScore = 0
  let safetyPenalty = 0

  const reasons: string[] = []
  const keyTagsSet = new Set<string>()

  // 1. Skin Type Score (Max 25 pts)
  if (productSkinTypes.includes(userSkinType)) {
    skinTypeScore = 25
    reasons.push(`Formulated for ${userSkinType} skin types`)
  } else if (productSkinTypes.includes('all') || productSkinTypes.includes('normal') || productSkinTypes.length === 0) {
    skinTypeScore = 15
    reasons.push(`Suitable for all skin types including ${userSkinType}`)
  } else {
    skinTypeScore = 5
  }

  // 2. Concerns Score (+15 pts per matching concern, Max 35 pts)
  const matchedConcerns: string[] = []
  userConcerns.forEach((uc) => {
    const isMatched =
      productConcerns.some((pc) => pc.includes(uc) || uc.includes(pc)) ||
      productTags.some((pt) => pt.includes(uc))
    if (isMatched) {
      matchedConcerns.push(uc)
    }
  })

  if (matchedConcerns.length > 0) {
    concernScore = Math.min(35, matchedConcerns.length * 15)
    reasons.push(`Targets ${matchedConcerns.slice(0, 2).join(' & ')} concerns`)
    matchedConcerns.forEach((mc) => keyTagsSet.add(mc.replace('-', ' ').toUpperCase()))
  }

  // 3. AI Metric Deficiency Score (Max 25 pts)
  if (profile.metrics) {
    const m = profile.metrics
    let metricPoints = 0

    const hydration = m.hydration ?? 100
    const barrier = m.barrier ?? m.acneRisk ?? 100
    const oilBalance = m.oilBalance ?? 100
    const pigmentation = m.pigmentation ?? 100

    if (hydration < 70 && (productConcerns.includes('dryness') || productTags.includes('hyaluronic-acid') || activeIngredients.includes('hyaluronic-acid'))) {
      metricPoints += 10
      reasons.push('Supports subsurface hydration recovery')
    }
    if (barrier < 70 && (productConcerns.includes('redness') || productConcerns.includes('sensitivity') || activeIngredients.includes('centella') || activeIngredients.includes('ceramides'))) {
      metricPoints += 10
      reasons.push('Reinforces moisture barrier integrity')
    }
    if (oilBalance < 70 && (productConcerns.includes('oiliness') || productConcerns.includes('acne') || activeIngredients.includes('niacinamide') || activeIngredients.includes('salicylic-acid'))) {
      metricPoints += 10
      reasons.push('Balances T-zone sebum secretion')
    }
    if (pigmentation < 70 && (productConcerns.includes('pigmentation') || activeIngredients.includes('alpha-arbutin') || activeIngredients.includes('vitamin-c'))) {
      metricPoints += 10
      reasons.push('Promotes even skin tone & clarity')
    }

    metricScore = Math.min(25, metricPoints)
  } else {
    metricScore = matchedConcerns.length > 0 ? 15 : 0
  }

  // 4. Active Ingredients Score (Max 15 pts)
  if (activeIngredients.length > 0) {
    activeScore = 15
    const primaryIngredient = Array.isArray(product.ingredients) && product.ingredients.length > 0
      ? formatIngredientName(product.ingredients[0])
      : activeIngredients[0]
    if (primaryIngredient) {
      reasons.push(`Enriched with ${primaryIngredient}`)
      keyTagsSet.add(primaryIngredient)
    }
  }

  // 5. Safety & Sensitivity Checks (Approved -30 Penalty)
  if (userSkinType === 'sensitive' || (profile.metrics?.sensitivity && profile.metrics.sensitivity < 55)) {
    const isSoothing = productTags.includes('cica') || productTags.includes('fragrance-free') || productConcerns.includes('sensitivity') || activeIngredients.includes('centella')
    if (isSoothing) {
      keyTagsSet.add('SOOTHING')
    } else if (activeIngredients.includes('salicylic-acid') || activeIngredients.includes('retinol')) {
      safetyPenalty = 30
      reasons.push('Contains concentrated actives — patch test recommended')
    }
  }

  // Add Key Facts to keyTags if present
  if (Array.isArray(product.keyFacts)) {
    product.keyFacts.forEach((kf: string) => {
      if (keyTagsSet.size < 4) keyTagsSet.add(kf)
    })
  }

  // Compute final score with Math.max(0, Math.min(100, score))
  const rawScore = skinTypeScore + concernScore + metricScore + activeScore - safetyPenalty
  const matchPercent = Math.max(0, Math.min(100, rawScore))
  const isCompatible = matchPercent >= 60

  if (reasons.length === 0) {
    reasons.push('Clean formulation supporting daily skin maintenance')
  }

  return {
    productId,
    matchPercent,
    reasons: reasons.slice(0, 4),
    keyTags: Array.from(keyTagsSet).slice(0, 3),
    isCompatible,
  }
}
