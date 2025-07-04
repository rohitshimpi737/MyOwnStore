import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Safe sorting utility to prevent localeCompare errors
export function safeSortProducts(products, sortBy) {
  if (!products || !Array.isArray(products)) return []
  
  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '')
      case 'price':
        return (a.discountedPrice || a.price || 0) - (b.discountedPrice || b.price || 0)
      case '-price':
        return (b.discountedPrice || b.price || 0) - (a.discountedPrice || a.price || 0)
      case '-rating':
        return (b.rating || 0) - (a.rating || 0)
      case '-createdAt':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'createdAt':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      default:
        return (a.title || '').localeCompare(b.title || '')
    }
  })
  
  return sorted
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function truncateText(text, length = 100) {
  if (text.length <= length) return text
  return text.substr(0, length) + '...'
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length)
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateCartTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

export function getStorageItem(key, defaultValue = null){
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    
    // For token, return as string without parsing
    if (key === 'token') {
      return item
    }
    
    // For other items, try to parse JSON
    return JSON.parse(item)
  } catch (error) {
    console.error(`Error parsing localStorage item ${key}:`, error)
    return defaultValue
  }
}

export function setStorageItem (key, value){
  try {
    if (key === 'token') {
      // Store token as plain string
      localStorage.setItem(key, value)
    } else {
      // Store other items as JSON
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error)
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}

// Cart utility functions
export function calculateCartTotalWithTax(items, taxRate = 0.08) {
  const subtotal = calculateCartTotal(items)
  const tax = subtotal * taxRate
  return {
    subtotal,
    tax,
    total: subtotal + tax
  }
}

export function getCartSummary(items) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = calculateCartTotal(items)
  const uniqueItems = items.length
  
  return {
    totalItems,
    uniqueItems,
    totalValue,
    averageItemValue: totalValue / totalItems || 0
  }
}

export function validateCartStock(items) {
  return items.map(item => ({
    ...item,
    isStockValid: !item.stock || item.quantity <= item.stock,
    stockIssue: item.stock && item.quantity > item.stock ? 
      `Only ${item.stock} available` : null
  }))
}

export function suggestShippingUpgrade(subtotal, shippingThreshold = 50) {
  if (subtotal >= shippingThreshold) {
    return null
  }
  
  const needed = shippingThreshold - subtotal
  return {
    needed,
    message: `Add ${formatPrice(needed)} more for free shipping`
  }
}
