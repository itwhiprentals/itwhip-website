// app/sys-2847/fleet/edit/components/HostSection.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

interface Host {
  id: string
  name: string
  email: string
  phone?: string
  profilePhoto?: string
  bio?: string
  responseTime?: number
  responseRate?: number
  totalTrips?: number
  rating?: number
  memberSince?: string
  joinedAt?: string
  languages?: string[]
  verificationStatus?: string // Now stores comma-separated values
  verificationLevel?: string // Database field name
  city?: string
  state?: string
  education?: string
  work?: string
  totalReviews?: number
  badge?: 'super_host' | 'elite_host' | 'top_rated' | 'all_star' | null
}

interface HostSectionProps {
  hosts: Host[]
  selectedHostId?: string
  onHostChange: (hostId: string) => void
  onHostUpdate?: (host: Host) => void
}

export function HostSection({
  hosts,
  selectedHostId,
  onHostChange,
  onHostUpdate
}: HostSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingHost, setEditingHost] = useState<Host | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedHost = hosts.find(h => h.id === selectedHostId)

  // Format response time for display
  const formatResponseTime = (minutes?: number) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  // Get member since year
  const getMemberSince = (host?: Host) => {
    if (!host) return null
    const date = host.memberSince || host.joinedAt
    if (!date) return null
    return new Date(date).getFullYear()
  }

  // Determine badge based on stats
  const getHostBadge = (host?: Host) => {
    if (!host) return null
    
    // Elite Host: 500+ trips, 4.9+ rating, 95%+ response
    if (host.totalTrips && host.totalTrips >= 500 && 
        host.rating && host.rating >= 4.9 && 
        host.responseRate && host.responseRate >= 95) {
      return { type: 'elite_host', label: 'Elite Host', color: 'purple' }
    }
    
    // Super Host: 100+ trips, 4.8+ rating, 90%+ response
    if (host.totalTrips && host.totalTrips >= 100 && 
        host.rating && host.rating >= 4.8 && 
        host.responseRate && host.responseRate >= 90) {
      return { type: 'super_host', label: 'Super Host', color: 'amber' }
    }
    
    // All-Star: 50+ trips, 4.7+ rating
    if (host.totalTrips && host.totalTrips >= 50 && 
        host.rating && host.rating >= 4.7) {
      return { type: 'all_star', label: 'All-Star Host', color: 'blue' }
    }
    
    // Top Rated: 4.9+ rating with 20+ trips
    if (host.rating && host.rating >= 4.9 && 
        host.totalTrips && host.totalTrips >= 20) {
      return { type: 'top_rated', label: 'Top Rated', color: 'green' }
    }
    
    return null
  }

  // Handle host edit - properly load verification data
  const handleEditHost = () => {
    if (selectedHost) {
      // Ensure verificationStatus is properly set from verificationLevel
      const hostToEdit = {
        ...selectedHost,
        verificationStatus: selectedHost.verificationStatus || selectedHost.verificationLevel || ''
      }
      setEditingHost(hostToEdit)
      setSaveError(null)
      setShowEditModal(true)
    }
  }

  // Handle photo upload for host
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('files', e.target.files[0])
    
    try {
      const response = await fetch('/sys-2847/fleet/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success && data.data) {
        const photoUrl = Array.isArray(data.data) ? data.data[0] : data.data
        setEditingHost(prev => prev ? { ...prev, profilePhoto: photoUrl } : null)
      }
    } catch (err) {
      console.error('Photo upload error:', err)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Save host changes - FIXED VERSION
  const handleSaveHost = async () => {
    if (!editingHost) return
    
    setSaving(true)
    setSaveError(null)
    
    try {
      const response = await fetch(`/sys-2847/fleet/api/hosts/${editingHost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingHost,
          // Ensure verificationStatus is sent to the API
          verificationStatus: editingHost.verificationStatus || ''
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Call onHostUpdate if provided with the updated data
        if (onHostUpdate && result.data) {
          onHostUpdate(result.data)
        }
        
        // Close the modal
        setShowEditModal(false)
        setEditingHost(null)
        
        // Reload the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 100)
      } else {
        setSaveError(result.error || 'Failed to update host profile')
      }
    } catch (err) {
      console.error('Failed to update host:', err)
      setSaveError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Get verification badges component (shows multiple)
  const getVerificationBadges = (status?: string) => {
    if (!status) return null;
    
    const statuses = typeof status === 'string' ? status.split(',').filter(s => s.trim()) : [];
    const badges = [];
    
    if (statuses.includes('id_verified')) {
      badges.push(
        <span key="id" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          ID
        </span>
      );
    }
    
    if (statuses.includes('background_checked')) {
      badges.push(
        <span key="bg" className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Background
        </span>
      );
    }
    
    if (statuses.includes('driving_record')) {
      badges.push(
        <span key="driving" className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Driving
        </span>
      );
    }
    
    if (statuses.includes('insurance_verified')) {
      badges.push(
        <span key="insurance" className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Insurance
        </span>
      );
    }
    
    if (statuses.includes('phone_verified')) {
      badges.push(
        <span key="phone" className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Phone
        </span>
      );
    }

    if (statuses.includes('training_completed')) {
      badges.push(
        <span key="training" className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Training
        </span>
      );
    }
    
    // Also check verificationLevel for backward compatibility
    return badges.length > 0 ? <>{badges}</> : null;
  };

  // Helper function to handle verification checkbox changes
  const handleVerificationChange = (verificationType: string, checked: boolean) => {
    if (!editingHost) return;
    
    // Get current verifications from verificationStatus
    const currentStatus = editingHost.verificationStatus || '';
    const current = currentStatus ? currentStatus.split(',').filter(s => s.trim()) : [];
    
    let updated: string[];
    if (checked) {
      // Add if not already present
      if (!current.includes(verificationType)) {
        updated = [...current, verificationType];
      } else {
        updated = current;
      }
    } else {
      // Remove if present
      updated = current.filter(v => v !== verificationType);
    }
    
    setEditingHost({ 
      ...editingHost, 
      verificationStatus: updated.join(',')
    });
  };

  const hostBadge = getHostBadge(selectedHost)
  const memberSince = getMemberSince(selectedHost)

  // Display verification badges - check both verificationStatus and verificationLevel
  const displayVerifications = selectedHost?.verificationStatus || selectedHost?.verificationLevel

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Host Assignment
      </h3>
      
      {/* Host Selector */}
      {hosts.length > 0 ? (
        <div className="space-y-4">
          <select
            value={selectedHostId || ''}
            onChange={(e) => onHostChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a host</option>
            {hosts.map(host => (
              <option key={host.id} value={host.id}>
                {host.name} 
                {host.rating && ` - ${host.rating}★`}
                {host.totalTrips && ` (${host.totalTrips} trips)`}
              </option>
            ))}
          </select>
          
          {/* Selected Host Preview - Enhanced */}
          {selectedHost && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  {selectedHost.profilePhoto ? (
                    <img 
                      src={selectedHost.profilePhoto}
                      alt={selectedHost.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Host Info - Enhanced */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {selectedHost.name}
                    </h4>
                    {getVerificationBadges(displayVerifications)}
                    {hostBadge && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium
                        ${hostBadge.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                          hostBadge.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                          hostBadge.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {hostBadge.label}
                      </span>
                    )}
                  </div>

                  {/* Location and Member Since */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {(selectedHost.city || selectedHost.state) && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{selectedHost.city || 'Phoenix'}, {selectedHost.state || 'AZ'}</span>
                      </div>
                    )}
                    {memberSince && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Host since {memberSince}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Stats Grid - Similar to guest view */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {/* Rating */}
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-sm">{selectedHost.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rating</p>
                    </div>
                    
                    {/* Trips */}
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <p className="font-bold text-sm">{selectedHost.totalTrips || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trips</p>
                    </div>
                    
                    {/* Response Rate */}
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <p className="font-bold text-sm">{selectedHost.responseRate || 0}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Response</p>
                    </div>
                    
                    {/* Response Time */}
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <p className="font-bold text-sm">{formatResponseTime(selectedHost.responseTime)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reply</p>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  {selectedHost.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {selectedHost.bio}
                    </p>
                  )}
                  
                  {/* Additional Info */}
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {selectedHost.languages && selectedHost.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Languages:</span>
                        {selectedHost.languages.map((lang, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {selectedHost.education && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        <span className="text-xs">{selectedHost.education}</span>
                      </div>
                    )}
                    
                    {selectedHost.work && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">Works in: {selectedHost.work}</span>
                      </div>
                    )}
                    
                    {selectedHost.totalReviews !== undefined && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="text-xs">{selectedHost.totalReviews} reviews</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleEditHost}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit Host Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Loading hosts...</p>
      )}
      
      {/* Edit Host Modal - Enhanced */}
      {showEditModal && editingHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Host Profile
            </h3>
            
            {/* Error Alert */}
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                {saveError}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {editingHost.profilePhoto ? (
                    <img 
                      src={editingHost.profilePhoto}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingHost.name}
                    onChange={(e) => setEditingHost({ ...editingHost, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <input
                    type="date"
                    value={
                      editingHost.memberSince ? 
                        (typeof editingHost.memberSince === 'string' && editingHost.memberSince.includes('T') ? 
                          editingHost.memberSince.split('T')[0] : 
                          editingHost.memberSince) :
                      editingHost.joinedAt ? 
                        (typeof editingHost.joinedAt === 'string' && editingHost.joinedAt.includes('T') ? 
                          editingHost.joinedAt.split('T')[0] : 
                          editingHost.joinedAt) : 
                      ''
                    }
                    onChange={(e) => setEditingHost({ ...editingHost, memberSince: e.target.value })}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    min="2020-01-01" // Set reasonable minimum date
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingHost.city || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, city: e.target.value })}
                    placeholder="Phoenix"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={editingHost.state || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, state: e.target.value })}
                    placeholder="AZ"
                    maxLength={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editingHost.bio || ''}
                  onChange={(e) => setEditingHost({ ...editingHost, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  placeholder="Tell guests about yourself..."
                />
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    value={editingHost.rating || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, rating: parseFloat(e.target.value) })}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Trips
                  </label>
                  <input
                    type="number"
                    value={editingHost.totalTrips || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, totalTrips: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Rate (%)
                  </label>
                  <input
                    type="number"
                    value={editingHost.responseRate || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, responseRate: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Time (min)
                  </label>
                  <input
                    type="number"
                    value={editingHost.responseTime || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, responseTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Reviews
                  </label>
                  <input
                    type="number"
                    value={editingHost.totalReviews || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, totalReviews: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge
                  </label>
                  <select
                    value={editingHost.badge || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, badge: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  >
                    <option value="">Auto (based on stats)</option>
                    <option value="elite_host">Elite Host</option>
                    <option value="super_host">Super Host</option>
                    <option value="all_star">All-Star Host</option>
                    <option value="top_rated">Top Rated</option>
                  </select>
                </div>
              </div>
              
              {/* Languages - FIXED to allow spaces */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Languages (comma separated)
                </label>
                <input
                  type="text"
                  value={editingHost.languages?.join(', ') || ''}
                  onChange={(e) => {
                    // Allow spaces and commas during typing
                    const value = e.target.value;
                    setEditingHost({ 
                      ...editingHost, 
                      languages: value.split(',').map(l => l.trim()).filter(l => l)
                    })
                  }}
                  onBlur={(e) => {
                    // Clean up on blur
                    const value = e.target.value;
                    setEditingHost({ 
                      ...editingHost, 
                      languages: value.split(',').map(l => l.trim()).filter(l => l)
                    })
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  placeholder="English, Spanish, French"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate languages with commas. Example: English, Spanish, French
                </p>
              </div>
              
              {/* Work and Education */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={editingHost.education || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, education: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                    placeholder="Arizona State University"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work
                  </label>
                  <input
                    type="text"
                    value={editingHost.work || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, work: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                    placeholder="Hospitality & Tourism"
                  />
                </div>
              </div>
              
              {/* Verification Status - Multiple Checkboxes - FIXED PERSISTENCE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Status
                </label>
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={editingHost.verificationStatus?.includes('id_verified') || false}
                      onChange={(e) => handleVerificationChange('id_verified', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Government ID Verified</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={editingHost.verificationStatus?.includes('background_checked') || false}
                      onChange={(e) => handleVerificationChange('background_checked', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Background Check Completed</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={editingHost.verificationStatus?.includes('driving_record') || false}
                      onChange={(e) => handleVerificationChange('driving_record', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Driving Record Verified</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={editingHost.verificationStatus?.includes('insurance_verified') || false}
                      onChange={(e) => handleVerificationChange('insurance_verified', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Insurance Documentation Verified</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={editingHost.verificationStatus?.includes('phone_verified') || false}
                      onChange={(e) => handleVerificationChange('phone_verified', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Phone Number Verified</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={editingHost.verificationStatus?.includes('training_completed') || false}
                      onChange={(e) => handleVerificationChange('training_completed', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Host Training Completed</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleSaveHost}
                disabled={saving}
                className={`flex-1 px-4 py-2 rounded text-white font-medium transition-colors
                  ${saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingHost(null)
                  setSaveError(null)
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}