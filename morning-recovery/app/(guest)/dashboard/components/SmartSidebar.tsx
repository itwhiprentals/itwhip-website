// app/(guest)/dashboard/components/SmartSidebar.tsx
// Smart Sidebar Component - Adaptive sidebar that shows contextual widgets
// Changes content based on user location, time, and activity

'use client'

import { useState, useEffect } from 'react'
import { 
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCartOutline,
  IoStatsChartOutline,
  IoFlashOutline,
  IoNotificationsOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoTrophyOutline,
  IoCloseOutline,
  IoExpandOutline,
  IoContractOutline
} from 'react-icons/io5'

// Types
interface SmartSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  activeWidgets?: string[]
  userRole?: string
  isAtHotel?: boolean
}

interface Widget {
  id: string
  title: string
  icon: any
  priority: number
  visible: boolean
  minimized: boolean
}

export default function SmartSidebar({
  isCollapsed = false,
  onToggleCollapse,
  activeWidgets = ['cart', 'stats', 'liveFeed'],
  userRole = 'guest',
  isAtHotel = false
}: SmartSidebarProps) {
  // State management
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'cart',
      title: 'Shopping Cart',
      icon: IoCartOutline,
      priority: 1,
      visible: true,
      minimized: false
    },
    {
      id: 'stats',
      title: 'Your Stats',
      icon: IoStatsChartOutline,
      priority: 2,
      visible: true,
      minimized: false
    },
    {
      id: 'liveFeed',
      title: 'Live Activity',
      icon: IoFlashOutline,
      priority: 3,
      visible: true,
      minimized: false
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: IoNotificationsOutline,
      priority: 4,
      visible: false,
      minimized: false
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: IoWalletOutline,
      priority: 5,
      visible: false,
      minimized: false
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: IoTrophyOutline,
      priority: 6,
      visible: false,
      minimized: false
    }
  ])

  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState('w-80') // w-80 = 320px

  // Update widgets based on context
  useEffect(() => {
    updateWidgetVisibility()
  }, [isAtHotel, userRole, activeWidgets])

  // Update widget visibility based on context
  const updateWidgetVisibility = () => {
    setWidgets(prev => prev.map(widget => {
      // Show wallet widget if at hotel
      if (widget.id === 'wallet' && isAtHotel) {
        return { ...widget, visible: true }
      }
      
      // Show notifications if there are any
      if (widget.id === 'notifications' && activeWidgets.includes('notifications')) {
        return { ...widget, visible: true }
      }
      
      // Show achievements for premium users
      if (widget.id === 'achievements' && userRole === 'premium') {
        return { ...widget, visible: true }
      }
      
      // Default visibility from activeWidgets
      return {
        ...widget,
        visible: activeWidgets.includes(widget.id)
      }
    }))
  }

  // Toggle widget minimized state
  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, minimized: !widget.minimized }
        : widget
    ))
  }

  // Expand widget to full view
  const expandWidget = (widgetId: string) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId)
  }

  // Remove widget from sidebar
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: false }
        : widget
    ))
  }

  // Reorder widgets
  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === widgetId)
      if (index === -1) return prev
      
      const newWidgets = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      
      if (targetIndex >= 0 && targetIndex < newWidgets.length) {
        // Swap priorities
        const temp = newWidgets[index].priority
        newWidgets[index].priority = newWidgets[targetIndex].priority
        newWidgets[targetIndex].priority = temp
        
        // Sort by priority
        newWidgets.sort((a, b) => a.priority - b.priority)
      }
      
      return newWidgets
    })
  }

  // Render widget content placeholder
  const renderWidgetContent = (widgetId: string) => {
    // This would normally render the actual widget component
    // For now, return placeholder content
    switch(widgetId) {
      case 'cart':
        return (
          <div className="p-3 text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>3 items</span>
              <span className="font-semibold">$142.50</span>
            </div>
            <button className="w-full bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors">
              Checkout
            </button>
          </div>
        )
      
      case 'stats':
        return (
          <div className="p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saved</span>
              <span className="font-semibold text-green-600">$1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rides</span>
              <span className="font-semibold">42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CO2 Saved</span>
              <span className="font-semibold">127kg</span>
            </div>
          </div>
        )
      
      case 'liveFeed':
        return (
          <div className="p-3 space-y-2">
            <div className="text-xs text-gray-500">2 min ago</div>
            <div className="text-sm">John booked a ride to Airport</div>
            <div className="text-xs text-gray-500">5 min ago</div>
            <div className="text-sm">Sarah ordered room service</div>
          </div>
        )
      
      default:
        return (
          <div className="p-3 text-sm text-gray-500">
            Widget content goes here
          </div>
        )
    }
  }

  // Collapsed sidebar
  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Expand Sidebar"
        >
          <IoChevronBackOutline className="w-5 h-5 text-gray-600" />
        </button>
        
        {widgets
          .filter(w => w.visible)
          .slice(0, 3)
          .map(widget => {
            const Icon = widget.icon
            return (
              <button
                key={widget.id}
                onClick={onToggleCollapse}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                title={widget.title}
              >
                <Icon className="w-5 h-5 text-gray-600" />
                {widget.id === 'cart' && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                )}
              </button>
            )
          })}
      </div>
    )
  }

  // Expanded widget view
  if (expandedWidget) {
    const widget = widgets.find(w => w.id === expandedWidget)
    if (!widget) return null
    
    const Icon = widget.icon
    
    return (
      <div className="w-96 bg-white border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{widget.title}</h3>
            </div>
            <button
              onClick={() => setExpandedWidget(null)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <IoContractOutline className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="h-full overflow-y-auto">
          {renderWidgetContent(widget.id)}
        </div>
      </div>
    )
  }

  // Normal sidebar view
  return (
    <div className={`${sidebarWidth} bg-white border-l border-gray-200 overflow-y-auto`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Quick Access</h3>
          <div className="flex items-center space-x-2">
            {isAtHotel && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <IoLocationOutline className="mr-1" />
                At Hotel
              </span>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Collapse Sidebar"
            >
              <IoChevronForwardOutline className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="p-4 space-y-4">
        {widgets
          .filter(w => w.visible)
          .sort((a, b) => a.priority - b.priority)
          .map((widget, index) => {
            const Icon = widget.icon
            
            return (
              <div
                key={widget.id}
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Widget Header */}
                <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {widget.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {/* Move Up */}
                    {index > 0 && (
                      <button
                        onClick={() => moveWidget(widget.id, 'up')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Move Up"
                      >
                        <IoChevronBackOutline className="w-3 h-3 text-gray-400 rotate-90" />
                      </button>
                    )}
                    
                    {/* Move Down */}
                    {index < widgets.filter(w => w.visible).length - 1 && (
                      <button
                        onClick={() => moveWidget(widget.id, 'down')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Move Down"
                      >
                        <IoChevronForwardOutline className="w-3 h-3 text-gray-400 rotate-90" />
                      </button>
                    )}
                    
                    {/* Expand */}
                    <button
                      onClick={() => expandWidget(widget.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Expand"
                    >
                      <IoExpandOutline className="w-3 h-3 text-gray-400" />
                    </button>
                    
                    {/* Minimize/Restore */}
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={widget.minimized ? 'Restore' : 'Minimize'}
                    >
                      <IoChevronForwardOutline 
                        className={`w-3 h-3 text-gray-400 transition-transform ${
                          widget.minimized ? '' : 'rotate-90'
                        }`}
                      />
                    </button>
                    
                    {/* Close */}
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Remove"
                    >
                      <IoCloseOutline className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                {/* Widget Content */}
                {!widget.minimized && (
                  <div className="bg-white">
                    {renderWidgetContent(widget.id)}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* Add Widget Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
          + Add Widget
        </button>
      </div>
    </div>
  )
}