// app/(guest)/rentals/search/utils/MarkerManager.ts
import mapboxgl from 'mapbox-gl'

interface Car {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  location: {
    lat: number
    lng: number
  }
  instantBook?: boolean
  carType?: string
}

interface MarkerData {
  marker: mapboxgl.Marker
  element: HTMLElement
  carId: string
  lastUpdate: number
}

export class MarkerManager {
  private markers: Map<string, MarkerData> = new Map()
  private markerPool: HTMLElement[] = []
  private map: mapboxgl.Map | null = null
  private clickHandler: ((car: Car) => void) | null = null
  private hoverHandler: ((car: Car | null) => void) | null = null
  private cars: Map<string, Car> = new Map()
  private activeMarkerId: string | null = null
  private clusterSource: mapboxgl.GeoJSONSource | null = null
  private readonly POOL_SIZE = 50
  private readonly CLUSTER_RADIUS = 50
  private readonly CLUSTER_MAX_ZOOM = 14
  
  constructor() {
    // Pre-create marker elements for reuse
    this.initializePool()
  }
  
  private initializePool() {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const el = this.createMarkerElement()
      this.markerPool.push(el)
    }
  }
  
  private createMarkerElement(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'car-marker-base'
    el.innerHTML = `
      <div class="marker-content">
        <div class="marker-price"></div>
        <div class="instant-badge" style="display: none;">⚡</div>
      </div>
    `
    return el
  }
  
  private getPooledElement(): HTMLElement {
    let el = this.markerPool.pop()
    if (!el) {
      el = this.createMarkerElement()
    }
    return el
  }
  
  private returnToPool(el: HTMLElement) {
    // Reset element state
    el.className = 'car-marker-base'
    el.style.transform = ''
    el.style.opacity = '1'
    const badge = el.querySelector('.instant-badge') as HTMLElement
    if (badge) badge.style.display = 'none'
    
    if (this.markerPool.length < this.POOL_SIZE) {
      this.markerPool.push(el)
    }
  }
  
  public setMap(map: mapboxgl.Map) {
    this.map = map
    this.setupClustering()
  }
  
  private setupClustering() {
    if (!this.map) return
    
    // Add source for clustering
    this.map.addSource('cars-cluster', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterMaxZoom: this.CLUSTER_MAX_ZOOM,
      clusterRadius: this.CLUSTER_RADIUS
    })
    
    // Add cluster circles
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'cars-cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#fbbf24', // amber-400
          10,
          '#f59e0b', // amber-500
          30,
          '#ea580c'  // orange-600
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          25,
          30,
          30
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#fff',
        'circle-stroke-opacity': 0.9
      }
    })
    
    // Add cluster count labels
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'cars-cluster',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff'
      }
    })
    
    // Click on cluster to zoom
    this.map.on('click', 'clusters', (e) => {
      const features = this.map!.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      })
      
      const clusterId = features[0].properties?.cluster_id
      const source = this.map!.getSource('cars-cluster') as mapboxgl.GeoJSONSource
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        
        this.map!.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom ?? undefined
        })
      })
    })
    
    this.clusterSource = this.map.getSource('cars-cluster') as mapboxgl.GeoJSONSource
  }
  
  public setHandlers(clickHandler: (car: Car) => void, hoverHandler?: (car: Car | null) => void) {
    this.clickHandler = clickHandler
    this.hoverHandler = hoverHandler ?? undefined as any
  }
  
  public updateMarkers(cars: Car[], selectedCarId?: string | null) {
    if (!this.map) return
    
    const currentTime = Date.now()
    const newCarIds = new Set(cars.map(car => car.id))
    
    // Update cars map
    this.cars.clear()
    cars.forEach(car => this.cars.set(car.id, car))
    
    // Remove markers for cars that no longer exist
    const markersToRemove: string[] = []
    this.markers.forEach((markerData, carId) => {
      if (!newCarIds.has(carId)) {
        markersToRemove.push(carId)
      }
    })
    
    markersToRemove.forEach(carId => {
      this.removeMarker(carId)
    })
    
    // Update or create markers for current cars
    cars.forEach(car => {
      const existingMarker = this.markers.get(car.id)
      
      if (existingMarker) {
        // Update existing marker if position changed
        this.updateMarker(car, existingMarker, selectedCarId === car.id)
      } else {
        // Create new marker
        this.createMarker(car, selectedCarId === car.id)
      }
    })
    
    // Update clustering data
    this.updateClustering(cars)
  }
  
  private updateClustering(cars: Car[]) {
    if (!this.clusterSource) return
    
    const features = cars.map(car => ({
      type: 'Feature' as const,
      properties: {
        carId: car.id,
        price: car.dailyRate
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [car.location.lng, car.location.lat]
      }
    }))
    
    this.clusterSource.setData({
      type: 'FeatureCollection',
      features
    })
  }
  
  private createMarker(car: Car, isSelected: boolean) {
    if (!this.map) return
    
    const el = this.getPooledElement()
    
    // Update marker content
    this.updateMarkerElement(el, car, isSelected)
    
    // Add event listeners
    this.attachEventListeners(el, car)
    
    // Create Mapbox marker
    const marker = new mapboxgl.Marker(el, {
      anchor: 'center',
      offset: [0, 0]
    })
      .setLngLat([car.location.lng, car.location.lat])
      .addTo(this.map)
    
    // Store marker data
    this.markers.set(car.id, {
      marker,
      element: el,
      carId: car.id,
      lastUpdate: Date.now()
    })
  }
  
  private updateMarker(car: Car, markerData: MarkerData, isSelected: boolean) {
    // Update marker element
    this.updateMarkerElement(markerData.element, car, isSelected)
    
    // Update position if changed
    const currentLngLat = markerData.marker.getLngLat()
    if (currentLngLat.lng !== car.location.lng || currentLngLat.lat !== car.location.lat) {
      markerData.marker.setLngLat([car.location.lng, car.location.lat])
    }
    
    markerData.lastUpdate = Date.now()
  }
  
  private updateMarkerElement(el: HTMLElement, car: Car, isSelected: boolean) {
    // Update classes
    el.className = `car-marker-base car-marker ${car.instantBook ? 'instant' : ''} ${car.carType === 'luxury' ? 'luxury' : ''} ${isSelected ? 'selected' : ''}`
    
    // Update price
    const priceEl = el.querySelector('.marker-price') as HTMLElement
    if (priceEl) {
      priceEl.textContent = `$${Math.round(car.dailyRate)}`
    }
    
    // Update instant badge
    const badge = el.querySelector('.instant-badge') as HTMLElement
    if (badge) {
      badge.style.display = car.instantBook ? 'flex' : 'none'
    }
  }
  
  private attachEventListeners(el: HTMLElement, car: Car) {
    // Remove old listeners
    const newEl = el.cloneNode(true) as HTMLElement
    el.parentNode?.replaceChild(newEl, el)
    
    // Add click handler
    newEl.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (this.clickHandler) {
        this.clickHandler(car)
      }
      this.setActiveMarker(car.id)
    })
    
    // Add hover handlers
    if (this.hoverHandler) {
      newEl.addEventListener('mouseenter', () => {
        if (this.hoverHandler) {
          this.hoverHandler(car)
        }
      })
      
      newEl.addEventListener('mouseleave', () => {
        if (this.hoverHandler) {
          this.hoverHandler(null)
        }
      })
    }
    
    // Prevent touch delays on mobile
    newEl.addEventListener('touchstart', (e) => {
      e.stopPropagation()
    }, { passive: true })
  }
  
  private removeMarker(carId: string) {
    const markerData = this.markers.get(carId)
    if (!markerData) return
    
    markerData.marker.remove()
    this.returnToPool(markerData.element)
    this.markers.delete(carId)
  }
  
  public setActiveMarker(carId: string | null) {
    // Remove active state from previous marker
    if (this.activeMarkerId) {
      const prevMarker = this.markers.get(this.activeMarkerId)
      if (prevMarker) {
        prevMarker.element.classList.remove('selected')
      }
    }
    
    // Set new active marker
    if (carId) {
      const marker = this.markers.get(carId)
      if (marker) {
        marker.element.classList.add('selected')
        const car = this.cars.get(carId)
        if (car && this.map) {
          this.map.flyTo({
            center: [car.location.lng, car.location.lat],
            zoom: 15,
            duration: 1000,
            essential: true
          })
        }
      }
    }
    
    this.activeMarkerId = carId
  }
  
  public highlightMarker(carId: string | null) {
    this.markers.forEach((markerData, id) => {
      if (id === carId) {
        markerData.element.classList.add('highlighted')
      } else {
        markerData.element.classList.remove('highlighted')
      }
    })
  }
  
  public cleanup() {
    this.markers.forEach(markerData => {
      markerData.marker.remove()
    })
    this.markers.clear()
    this.cars.clear()
    this.markerPool = []
    this.activeMarkerId = null
  }
  
  public getVisibleMarkers(): string[] {
    if (!this.map) return []
    
    const bounds = this.map.getBounds()
    const visibleIds: string[] = []
    
    this.markers.forEach((markerData, carId) => {
      const car = this.cars.get(carId)
      if (car && bounds && bounds.contains([car.location.lng, car.location.lat])) {
        visibleIds.push(carId)
      }
    })
    
    return visibleIds
  }
}