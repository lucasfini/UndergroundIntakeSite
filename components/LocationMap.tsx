'use client'

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

// Underground Media + Design - exact coordinates from Google Maps
const position = { lat: 43.2634797, lng: -79.9177265 }

export function LocationMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const googleMapsUrl = 'https://maps.app.goo.gl/epLEwS2rzq89foN2A'
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`

  return (
    <div className="mt-4">
      <div className="rounded-lg overflow-hidden border border-[#1C3450]/20 relative h-[300px]">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={position}
            defaultZoom={18}
            mapId="underground_location_map"
            mapTypeId="satellite"
            disableDefaultUI={false}
            zoomControl={true}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
          >
            <AdvancedMarker position={position}>
              <img
                src="/images/favico.svg"
                alt="Underground location"
                width={40}
                height={40}
                style={{ transform: 'translate(-50%, -100%)' }}
              />
            </AdvancedMarker>
          </Map>
        </APIProvider>

        {/* Info Card in top-left corner */}
        <div className="absolute top-3 left-3 bg-white rounded-lg shadow-lg p-3 max-w-[280px] z-10">
          <h3 className="font-semibold text-sm mb-1.5 text-gray-900">Underground Media + Design</h3>
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
            McMaster University Student Centre<br />
            1280 Main St W, B117 Lower Level<br />
            Hamilton, ON L8S 4S4
          </p>
          <div className="flex gap-3 text-xs">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              View larger map
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Directions
            </a>
          </div>
        </div>
      </div>
      <div className="bg-[#f7fbfa] text-[#1C3450] p-3 text-sm font-medium space-y-1 rounded-b-lg border border-t-0 border-[#1C3450]/20">
        <div className="font-semibold flex items-center gap-2">
          <span className="text-red-600">📍</span>
          <span>1280 Main St W, Hamilton, ON</span>
        </div>
        <div>McMaster University Student Centre, B117 Lower Level</div>
        <div>Hamilton, ON L8S 4S4</div>
      </div>
    </div>
  )
}
