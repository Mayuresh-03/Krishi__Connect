import React from 'react';
import { Leaf } from "lucide-react";

const BackgroundLeaves = () => {
    const leaves = Array.from({ length: 15 });
    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                {leaves.map((_, i) => {
                    const style = {
                        left: `${Math.random() * 100}vw`,
                        animationDuration: `${Math.random() * 5 + 10}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: Math.random() * 0.5 + 0.3,
                    };
                    return (
                        <div key={i} className="leaf-container" style={style}>
                            <Leaf className="w-6 h-6 text-green-300" />
                        </div>
                    );
                })}
            </div>
            <style>{`
                .leaf-container {
                    position: absolute;
                    top: -10%;
                    animation: fall linear infinite;
                }
                @keyframes fall {
                    0% { transform: translateY(0vh) rotateZ(0deg); }
                    100% { transform: translateY(110vh) rotateZ(360deg); }
                }
            `}</style>
        </>
    );
};

export default BackgroundLeaves;