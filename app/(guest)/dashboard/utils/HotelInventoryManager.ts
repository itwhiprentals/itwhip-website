// app/(guest)/dashboard/utils/HotelInventoryManager.ts
// Hotel Inventory Manager - Manages digital mini-bar and hotel store inventory
// Tracks stock levels, pricing, and availability in real-time

'use client'

// Types
export interface InventoryItem {
  id: string
  name: string
  description: string
  category: InventoryCategory
  price: number
  stock: number
  maxStock: number
  minStock: number
  unit: string
  image?: string
  brand?: string
  tags: string[]
  available: boolean
  roomChargeable: boolean
  lastRestocked?: Date
  expiryDate?: Date
  metadata?: Record<string, any>
}

export interface InventoryCategory {
  id: string
  name: string
  icon: string
  description: string
  sortOrder: number
  parentCategory?: string
  isActive: boolean
}

export interface InventoryUpdate {
  itemId: string
  quantity: number
  type: 'restock' | 'purchase' | 'adjustment' | 'damage' | 'expiry'
  timestamp: Date
  userId?: string
  roomNumber?: string
  notes?: string
}

export interface InventoryAlert {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired'
  itemId: string
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
  acknowledged: boolean
}

interface InventoryFilters {
  category?: string
  available?: boolean
  roomChargeable?: boolean
  search?: string
  tags?: string[]
  priceRange?: { min: number; max: number }
  inStock?: boolean
}

interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  categoryCounts: Record<string, number>
}

// Default categories
const DEFAULT_CATEGORIES: InventoryCategory[] = [
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    description: 'Soft drinks, juices, and water',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: '🍿',
    description: 'Chips, candy, and quick bites',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    icon: '🍷',
    description: 'Wine, beer, and spirits',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'toiletries',
    name: 'Toiletries',
    icon: '🧴',
    description: 'Personal care items',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'convenience',
    name: 'Convenience',
    icon: '🏪',
    description: 'Travel essentials',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'souvenirs',
    name: 'Souvenirs',
    icon: '🎁',
    description: 'Hotel merchandise and gifts',
    sortOrder: 6,
    isActive: true
  }
]

// Sample inventory data
const SAMPLE_INVENTORY: InventoryItem[] = [
  // Beverages
  {
    id: 'bev-001',
    name: 'Coca-Cola',
    description: 'Classic Coca-Cola 12oz can',
    category: DEFAULT_CATEGORIES[0],
    price: 3.50,
    stock: 24,
    maxStock: 48,
    minStock: 12,
    unit: 'can',
    brand: 'Coca-Cola',
    tags: ['soda', 'caffeine', 'cold'],
    available: true,
    roomChargeable: true
  },
  {
    id: 'bev-002',
    name: 'Fiji Water',
    description: 'Premium artesian water 500ml',
    category: DEFAULT_CATEGORIES[0],
    price: 4.00,
    stock: 36,
    maxStock: 60,
    minStock: 20,
    unit: 'bottle',
    brand: 'Fiji',
    tags: ['water', 'premium', 'cold'],
    available: true,
    roomChargeable: true
  },
  // Snacks
  {
    id: 'snk-001',
    name: 'Pringles Original',
    description: 'Classic potato chips',
    category: DEFAULT_CATEGORIES[1],
    price: 5.00,
    stock: 18,
    maxStock: 36,
    minStock: 10,
    unit: 'tube',
    brand: 'Pringles',
    tags: ['chips', 'salty', 'snack'],
    available: true,
    roomChargeable: true
  },
  {
    id: 'snk-002',
    name: 'Snickers Bar',
    description: 'Chocolate bar with peanuts',
    category: DEFAULT_CATEGORIES[1],
    price: 3.00,
    stock: 30,
    maxStock: 50,
    minStock: 15,
    unit: 'bar',
    brand: 'Mars',
    tags: ['chocolate', 'candy', 'sweet'],
    available: true,
    roomChargeable: true
  },
  // Alcohol
  {
    id: 'alc-001',
    name: 'Corona Extra',
    description: 'Mexican lager beer 355ml',
    category: DEFAULT_CATEGORIES[2],
    price: 7.00,
    stock: 12,
    maxStock: 24,
    minStock: 6,
    unit: 'bottle',
    brand: 'Corona',
    tags: ['beer', 'alcohol', 'cold'],
    available: true,
    roomChargeable: true
  },
  {
    id: 'alc-002',
    name: 'Red Wine - Cabernet',
    description: 'House red wine 187ml',
    category: DEFAULT_CATEGORIES[2],
    price: 12.00,
    stock: 8,
    maxStock: 20,
    minStock: 5,
    unit: 'bottle',
    brand: 'House Selection',
    tags: ['wine', 'alcohol', 'red'],
    available: true,
    roomChargeable: true
  }
]

class HotelInventoryManager {
  private inventory: Map<string, InventoryItem>
  private categories: Map<string, InventoryCategory>
  private updates: InventoryUpdate[]
  private alerts: InventoryAlert[]
  private subscribers: Set<(inventory: InventoryItem[]) => void>

  constructor() {
    this.inventory = new Map()
    this.categories = new Map()
    this.updates = []
    this.alerts = []
    this.subscribers = new Set()
    
    this.initializeInventory()
  }

  // Initialize with sample data
  private initializeInventory(): void {
    // Load categories
    DEFAULT_CATEGORIES.forEach(category => {
      this.categories.set(category.id, category)
    })
    
    // Load inventory items
    SAMPLE_INVENTORY.forEach(item => {
      this.inventory.set(item.id, item)
    })
    
    // Check for alerts
    this.checkInventoryAlerts()
  }

  // Get all inventory items
  getInventory(filters?: InventoryFilters): InventoryItem[] {
    let items = Array.from(this.inventory.values())
    
    if (filters) {
      // Apply filters
      if (filters.category) {
        items = items.filter(item => item.category.id === filters.category)
      }
      
      if (filters.available !== undefined) {
        items = items.filter(item => item.available === filters.available)
      }
      
      if (filters.roomChargeable !== undefined) {
        items = items.filter(item => item.roomChargeable === filters.roomChargeable)
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.brand?.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
      
      if (filters.tags && filters.tags.length > 0) {
        items = items.filter(item =>
          filters.tags!.some(tag => item.tags.includes(tag))
        )
      }
      
      if (filters.priceRange) {
        items = items.filter(item =>
          item.price >= filters.priceRange!.min &&
          item.price <= filters.priceRange!.max
        )
      }
      
      if (filters.inStock !== undefined) {
        items = items.filter(item => 
          filters.inStock ? item.stock > 0 : item.stock === 0
        )
      }
    }
    
    return items
  }

  // Get single item
  getItem(itemId: string): InventoryItem | null {
    return this.inventory.get(itemId) || null
  }

  // Get items by category
  getItemsByCategory(categoryId: string): InventoryItem[] {
    return this.getInventory({ category: categoryId })
  }

  // Update inventory stock
  updateStock(update: InventoryUpdate): boolean {
    const item = this.inventory.get(update.itemId)
    if (!item) return false
    
    // Calculate new stock level
    let newStock = item.stock
    switch (update.type) {
      case 'purchase':
        newStock -= update.quantity
        break
      case 'restock':
        newStock += update.quantity
        break
      case 'adjustment':
        newStock = update.quantity
        break
      case 'damage':
      case 'expiry':
        newStock -= update.quantity
        break
    }
    
    // Validate stock level
    if (newStock < 0) newStock = 0
    if (newStock > item.maxStock) newStock = item.maxStock
    
    // Update item
    item.stock = newStock
    item.available = newStock > 0
    
    // Record update
    this.updates.push({
      ...update,
      timestamp: new Date()
    })
    
    // Check for alerts
    this.checkItemAlerts(item)
    
    // Notify subscribers
    this.notifySubscribers()
    
    return true
  }

  // Purchase items (reduce stock)
  purchaseItems(items: { itemId: string; quantity: number }[], roomNumber?: string): boolean {
    // Validate all items are available
    for (const purchase of items) {
      const item = this.inventory.get(purchase.itemId)
      if (!item || item.stock < purchase.quantity) {
        return false
      }
    }
    
    // Process purchases
    for (const purchase of items) {
      this.updateStock({
        itemId: purchase.itemId,
        quantity: purchase.quantity,
        type: 'purchase',
        timestamp: new Date(),
        roomNumber
      })
    }
    
    return true
  }

  // Restock items
  restockItem(itemId: string, quantity: number): boolean {
    return this.updateStock({
      itemId,
      quantity,
      type: 'restock',
      timestamp: new Date()
    })
  }

  // Check for inventory alerts
  private checkInventoryAlerts(): void {
    this.alerts = []
    
    this.inventory.forEach(item => {
      this.checkItemAlerts(item)
    })
  }

  // Check alerts for a specific item
  private checkItemAlerts(item: InventoryItem): void {
    // Remove existing alerts for this item
    this.alerts = this.alerts.filter(alert => alert.itemId !== item.id)
    
    // Check out of stock
    if (item.stock === 0) {
      this.alerts.push({
        id: `alert-${item.id}-oos`,
        type: 'out_of_stock',
        itemId: item.id,
        message: `${item.name} is out of stock`,
        severity: 'high',
        timestamp: new Date(),
        acknowledged: false
      })
    }
    // Check low stock
    else if (item.stock <= item.minStock) {
      this.alerts.push({
        id: `alert-${item.id}-low`,
        type: 'low_stock',
        itemId: item.id,
        message: `${item.name} is running low (${item.stock} remaining)`,
        severity: 'medium',
        timestamp: new Date(),
        acknowledged: false
      })
    }
    
    // Check expiry
    if (item.expiryDate) {
      const daysUntilExpiry = Math.floor(
        (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysUntilExpiry <= 0) {
        this.alerts.push({
          id: `alert-${item.id}-expired`,
          type: 'expired',
          itemId: item.id,
          message: `${item.name} has expired`,
          severity: 'high',
          timestamp: new Date(),
          acknowledged: false
        })
      } else if (daysUntilExpiry <= 7) {
        this.alerts.push({
          id: `alert-${item.id}-expiring`,
          type: 'expiring',
          itemId: item.id,
          message: `${item.name} expires in ${daysUntilExpiry} days`,
          severity: 'medium',
          timestamp: new Date(),
          acknowledged: false
        })
      }
    }
  }

  // Get current alerts
  getAlerts(unacknowledgedOnly: boolean = true): InventoryAlert[] {
    if (unacknowledgedOnly) {
      return this.alerts.filter(alert => !alert.acknowledged)
    }
    return [...this.alerts]
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
    }
  }

  // Get inventory statistics
  getStats(): InventoryStats {
    const items = Array.from(this.inventory.values())
    
    const stats: InventoryStats = {
      totalItems: items.length,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      expiringItems: 0,
      categoryCounts: {}
    }
    
    items.forEach(item => {
      // Calculate total value
      stats.totalValue += item.price * item.stock
      
      // Count stock levels
      if (item.stock === 0) {
        stats.outOfStockItems++
      } else if (item.stock <= item.minStock) {
        stats.lowStockItems++
      }
      
      // Count by category
      const categoryId = item.category.id
      stats.categoryCounts[categoryId] = (stats.categoryCounts[categoryId] || 0) + 1
      
      // Check expiry
      if (item.expiryDate) {
        const daysUntilExpiry = Math.floor(
          (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilExpiry <= 7) {
          stats.expiringItems++
        }
      }
    })
    
    return stats
  }

  // Get categories
  getCategories(): InventoryCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  // Subscribe to inventory changes
  subscribe(callback: (inventory: InventoryItem[]) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Notify subscribers of changes
  private notifySubscribers(): void {
    const items = this.getInventory()
    this.subscribers.forEach(callback => callback(items))
  }

  // Get recent updates
  getRecentUpdates(limit: number = 10): InventoryUpdate[] {
    return this.updates
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Export inventory data
  exportInventory(): {
    items: InventoryItem[]
    categories: InventoryCategory[]
    stats: InventoryStats
  } {
    return {
      items: this.getInventory(),
      categories: this.getCategories(),
      stats: this.getStats()
    }
  }
}

// Singleton instance
let instance: HotelInventoryManager | null = null

export function getInventoryManager(): HotelInventoryManager {
  if (!instance) {
    instance = new HotelInventoryManager()
  }
  return instance
}

// Utility functions for external use
export function checkInventory(itemId: string): number {
  const manager = getInventoryManager()
  const item = manager.getItem(itemId)
  return item?.stock || 0
}

export function updateInventory(update: InventoryUpdate): boolean {
  const manager = getInventoryManager()
  return manager.updateStock(update)
}

export function getInventoryByCategory(categoryId: string): InventoryItem[] {
  const manager = getInventoryManager()
  return manager.getItemsByCategory(categoryId)
}

export function calculateInventoryValue(): number {
  const manager = getInventoryManager()
  return manager.getStats().totalValue
}

export default HotelInventoryManager