export function SleepingZ() {
    return (
        <div className="absolute top-1/4 right-1/4 pointer-events-none select-none">
            <style>{`
        @keyframes floatZ {
          0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-40px) translateX(20px) scale(1.2); opacity: 0; }
        }
        .z-anim { animation: floatZ 3s infinite ease-in-out; }
        .delay-1 { animation-delay: 0s; }
        .delay-2 { animation-delay: 1s; }
        .delay-3 { animation-delay: 2s; }
      `}</style>
            <div className="relative">
                <span className="z-anim delay-1 absolute text-white font-bold text-xl">Z</span>
                <span className="z-anim delay-2 absolute text-white font-bold text-2xl -top-6 -right-6">z</span>
                <span className="z-anim delay-3 absolute text-white font-bold text-lg -top-10 right-2">Z</span>
            </div>
        </div>
    );
}
