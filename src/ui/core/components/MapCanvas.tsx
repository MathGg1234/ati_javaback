import React from "react";

export function MapCanvas({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
    return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
