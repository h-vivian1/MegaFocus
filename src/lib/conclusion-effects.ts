import confetti from "canvas-confetti";
import { toast } from "sonner";

export const triggerConclusionEffects = () => {
    console.log("🎉 Triggering Conclusion Effects!");

    // 1. Som
    try {
        const audio = new Audio("/task_complete.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (user interaction needed first?)", e));
    } catch (e) {
        console.error("Audio error", e);
    }

    // 2. Confete
    try {
        const end = Date.now() + 1000;
        const colors = ['#10b981', '#3b82f6', '#f59e0b'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    } catch (e) {
        console.error("Confetti error", e);
    }

    toast.success("Tarefa Concluída! Parabéns! 🚀");
};
