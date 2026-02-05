"use client";

import { useEffect, useRef, useState } from "react";
import GlobeJS, { GlobeMethods } from "react-globe.gl";

export default function Globe() {
    // Correctly typing the ref to match GlobeJS expectations
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const [size, setSize] = useState([0, 0]);

    useEffect(() => {
        // Dynamic resizing
        const updateSize = () => setSize([window.innerWidth, window.innerHeight]);
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.5;
            globeRef.current.controls().enableZoom = false; // Keep it cinematic
        }
    }, []);

    // Simple Arc Data (Server -> Target)
    const arcsData = [
        { startLat: 37.7749, startLng: -122.4194, endLat: 40.7128, endLng: -74.0060, color: "#E5E5E5" }, // SF -> NY (Platinum)
        { startLat: 51.5074, startLng: -0.1278, endLat: 35.6762, endLng: 139.6503, color: "#2563EB" },  // London -> Tokyo (Signal Blue)
        { startLat: 28.6139, startLng: 77.2090, endLat: -33.8688, endLng: 151.2093, color: "#E5E5E5" } // Delhi -> Sydney (Platinum)
    ];

    return (
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none select-none">
            {/* Client-only safe render check for window if needed, mostly handled by useClient */}
            {size[0] !== 0 && (
                <GlobeJS
                    ref={globeRef}
                    width={size[0]}
                    height={size[1]}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                    arcsData={arcsData}
                    arcColor="color"
                    arcDashLength={0.4}
                    arcDashGap={2}
                    arcDashInitialGap={() => Math.random()}
                    arcDashAnimateTime={2000}
                    atmosphereColor="#2563EB"
                    atmosphereAltitude={0.15}
                />
            )}
        </div>
    );
}
