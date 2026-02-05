
"use client";

import { motion } from "framer-motion";

export default function PrecisionLoader() {
    return (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-transparent overflow-hidden pointer-events-none z-50">
            <motion.div
                className="h-full bg-[#FF4F00]" // International Orange
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                    repeat: Infinity,
                    duration: 1, // Fast, precise scan
                    ease: "linear",
                }}
            />
        </div>
    );
}
